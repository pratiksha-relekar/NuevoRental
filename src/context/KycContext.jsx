import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  deleteUserKyc,
  markKycNoticeRead,
  saveUserKycRecord,
  submitUserKycForReview,
  subscribeToUserKyc,
} from '../backend/firestore/kyc'
import { useAuth } from './AuthContext'
import {
  KYC_STEP_STATUS,
  KYC_STEPS,
  createDefaultKycState,
} from '../data/kycSteps'

const KycContext = createContext(null)

export function KycProvider({ children }) {
  const { user } = useAuth()
  const [kycState, setKycState] = useState(createDefaultKycState)
  const [kycReady, setKycReady] = useState(false)
  const [saveError, setSaveError] = useState('')
  const kycStateRef = useRef(kycState)

  const userEmail = user?.email ?? null

  useEffect(() => {
    kycStateRef.current = kycState
  }, [kycState])

  useEffect(() => {
    if (!userEmail) {
      setKycState(createDefaultKycState())
      setKycReady(true)
      return undefined
    }

    let active = true
    setKycReady(false)

    const unsubscribe = subscribeToUserKyc(
      userEmail,
      (record) => {
        if (active) {
          setKycState(record)
          kycStateRef.current = record
          setKycReady(true)
        }
      },
      () => {
        if (active) {
          setKycReady(true)
        }
      },
    )

    return () => {
      active = false
      unsubscribe()
    }
  }, [userEmail])

  const saveKycNow = useCallback(
    async (record) => {
      if (!userEmail) return null

      const payload = record ?? kycStateRef.current
      setSaveError('')

      try {
        const saved = await saveUserKycRecord(userEmail, payload)
        setKycState(saved)
        kycStateRef.current = saved
        return saved
      } catch (error) {
        const message = error?.message || 'Could not save KYC details. Please try again.'
        setSaveError(message)
        throw error
      }
    },
    [userEmail],
  )

  const updateKyc = useCallback(
    (updater, { persist = true } = {}) => {
      if (!userEmail) return Promise.resolve(null)

      const current = kycStateRef.current
      const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }
      setKycState(next)
      kycStateRef.current = next

      if (!persist) {
        return Promise.resolve(next)
      }

      return saveKycNow(next)
    },
    [userEmail, saveKycNow],
  )

  const setStepStatus = useCallback(
    (stepId, status) => {
      return updateKyc((current) => ({
        ...current,
        status: current.status === 'not_started' ? 'in_progress' : current.status,
        stepStatuses: {
          ...current.stepStatuses,
          [stepId]: status,
        },
      }))
    },
    [updateKyc],
  )

  const setActiveStep = useCallback(
    (stepId) => {
      return updateKyc((current) => ({
        ...current,
        activeStepId: stepId,
        status: current.status === 'not_started' ? 'in_progress' : current.status,
      }))
    },
    [updateKyc],
  )

  const completeStep = useCallback(
    (stepId, nextStepId) => {
      return updateKyc((current) => {
        const stepStatuses = {
          ...current.stepStatuses,
          [stepId]: KYC_STEP_STATUS.DONE,
        }

        const isLast = stepId === 'approved'
        const nextActive = nextStepId ?? stepId

        return {
          ...current,
          status: isLast ? 'approved' : current.status === 'not_started' ? 'in_progress' : current.status,
          stepStatuses,
          activeStepId: nextActive,
          completedAt: isLast ? new Date().toISOString() : current.completedAt,
        }
      })
    },
    [updateKyc],
  )

  const startKyc = useCallback(async () => {
    const next = {
      ...createDefaultKycState(),
      status: 'in_progress',
      activeStepId: 'upload',
    }
    setKycState(next)
    kycStateRef.current = next
    return saveKycNow(next)
  }, [saveKycNow])

  const submitForReview = useCallback(async () => {
    if (!userEmail) return null
    setSaveError('')

    try {
      const saved = await submitUserKycForReview(userEmail, kycStateRef.current)
      setKycState(saved)
      kycStateRef.current = saved
      return saved
    } catch (error) {
      const message = error?.message || 'Could not submit KYC for review. Please try again.'
      setSaveError(message)
      throw error
    }
  }, [userEmail])

  const resetKyc = useCallback(async () => {
    if (!userEmail) return
    const next = createDefaultKycState()
    setKycState(next)
    kycStateRef.current = next
    await deleteUserKyc(userEmail)
    await saveUserKycRecord(userEmail, next)
  }, [userEmail])

  const dismissVerificationNotice = useCallback(async () => {
    if (!userEmail) return
    const updated = await markKycNoticeRead(userEmail)
    setKycState(updated)
    kycStateRef.current = updated
  }, [userEmail])

  const progress = useMemo(() => {
    const doneCount = KYC_STEPS.filter(
      (step) => kycState.stepStatuses[step.id] === KYC_STEP_STATUS.DONE,
    ).length
    return Math.round((doneCount / KYC_STEPS.length) * 100)
  }, [kycState.stepStatuses])

  const verificationNotice = useMemo(() => {
    const notice = kycState.verificationNotice
    if (!notice || notice.read) return null
    return notice
  }, [kycState.verificationNotice])

  const value = useMemo(
    () => ({
      kycState,
      kycReady,
      progress,
      isApproved: kycState.status === 'approved',
      verificationNotice,
      saveError,
      updateKyc,
      saveKycNow,
      submitForReview,
      setStepStatus,
      setActiveStep,
      completeStep,
      startKyc,
      resetKyc,
      dismissVerificationNotice,
    }),
    [
      kycState,
      kycReady,
      progress,
      verificationNotice,
      saveError,
      updateKyc,
      saveKycNow,
      submitForReview,
      setStepStatus,
      setActiveStep,
      completeStep,
      startKyc,
      resetKyc,
      dismissVerificationNotice,
    ],
  )

  return <KycContext.Provider value={value}>{children}</KycContext.Provider>
}

export function useKyc() {
  const context = useContext(KycContext)
  if (!context) {
    throw new Error('useKyc must be used within KycProvider')
  }
  return context
}
