import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useAuth } from './AuthContext'
import {
  KYC_STEP_STATUS,
  KYC_STEPS,
  createDefaultKycState,
} from '../data/kycSteps'

const KYC_STORAGE_KEY = 'nuevo-rental-kyc-records'

const KycContext = createContext(null)

function loadAllRecords() {
  try {
    const raw = window.localStorage.getItem(KYC_STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveAllRecords(records) {
  try {
    window.localStorage.setItem(KYC_STORAGE_KEY, JSON.stringify(records))
  } catch {
    // Ignore storage errors
  }
}

export function KycProvider({ children }) {
  const { user } = useAuth()
  const [records, setRecords] = useState(loadAllRecords)

  useEffect(() => {
    saveAllRecords(records)
  }, [records])

  const userEmail = user?.email ?? null

  const kycState = useMemo(() => {
    if (!userEmail) return createDefaultKycState()
    return records[userEmail] ?? createDefaultKycState()
  }, [records, userEmail])

  const updateKyc = useCallback(
    (updater) => {
      if (!userEmail) return

      setRecords((prev) => {
        const current = prev[userEmail] ?? createDefaultKycState()
        const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater }

        return {
          ...prev,
          [userEmail]: next,
        }
      })
    },
    [userEmail],
  )

  const setStepStatus = useCallback(
    (stepId, status) => {
      updateKyc((current) => ({
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
      updateKyc((current) => ({
        ...current,
        activeStepId: stepId,
        status: current.status === 'not_started' ? 'in_progress' : current.status,
      }))
    },
    [updateKyc],
  )

  const completeStep = useCallback(
    (stepId, nextStepId) => {
      updateKyc((current) => {
        const stepStatuses = {
          ...current.stepStatuses,
          [stepId]: KYC_STEP_STATUS.DONE,
        }

        const isLast = stepId === 'approved'
        const nextActive = nextStepId ?? stepId

        return {
          ...current,
          status: isLast ? 'approved' : 'in_progress',
          stepStatuses,
          activeStepId: nextActive,
          completedAt: isLast ? new Date().toISOString() : current.completedAt,
        }
      })
    },
    [updateKyc],
  )

  const startKyc = useCallback(() => {
    updateKyc(() => ({
      ...createDefaultKycState(),
      status: 'in_progress',
      activeStepId: 'upload',
    }))
  }, [updateKyc])

  const resetKyc = useCallback(() => {
    if (!userEmail) return
    setRecords((prev) => ({
      ...prev,
      [userEmail]: createDefaultKycState(),
    }))
  }, [userEmail])

  const progress = useMemo(() => {
    const doneCount = KYC_STEPS.filter(
      (step) => kycState.stepStatuses[step.id] === KYC_STEP_STATUS.DONE,
    ).length
    return Math.round((doneCount / KYC_STEPS.length) * 100)
  }, [kycState.stepStatuses])

  const value = useMemo(
    () => ({
      kycState,
      progress,
      isApproved: kycState.status === 'approved',
      updateKyc,
      setStepStatus,
      setActiveStep,
      completeStep,
      startKyc,
      resetKyc,
    }),
    [kycState, progress, updateKyc, setStepStatus, setActiveStep, completeStep, startKyc, resetKyc],
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
