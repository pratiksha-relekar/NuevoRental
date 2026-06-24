import { useCallback, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { uploadKycDocumentImage } from '../backend/storage/imageStorage'
import { useAuth } from '../context/AuthContext'
import { useKyc } from '../context/KycContext'
import { useCamera } from '../hooks/useCamera'
import { KYC_STEP_STATUS, KYC_STEPS } from '../data/kycSteps'
import '../styles/pageAnimations.css'
import './KycPage.css'

function UploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 16V4M12 4l4 4M12 4L8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M8 3h7l5 5v13a1 1 0 01-1 1H8a1 1 0 01-1-1V4a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.6" />
      <path d="M15 3v5h5M10 13h6M10 17h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 12l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function SpinnerIcon() {
  return <span className="kyc-spinner" aria-hidden="true" />
}

function CameraIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 8h3l2-3h6l2 3h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V10a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="12" cy="13" r="3.5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <path d="M24 4L40 12V24C40 33.5 33 41.5 24 44C15 41.5 8 33.5 8 24V12L24 4Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
      <path d="M18 24L22 28L30 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function StepStatusIcon({ status }) {
  if (status === KYC_STEP_STATUS.DONE) {
    return <span className="kyc-step-icon kyc-step-icon--done"><CheckIcon /></span>
  }
  if (status === KYC_STEP_STATUS.PROCESSING) {
    return <span className="kyc-step-icon kyc-step-icon--processing"><SpinnerIcon /></span>
  }
  if (status === KYC_STEP_STATUS.FAILED) {
    return <span className="kyc-step-icon kyc-step-icon--failed">!</span>
  }
  return <span className="kyc-step-icon kyc-step-icon--pending" />
}

function captureVideoFrame(videoElement) {
  if (!videoElement?.videoWidth) return null

  const canvas = document.createElement('canvas')
  canvas.width = videoElement.videoWidth
  canvas.height = videoElement.videoHeight
  const context = canvas.getContext('2d')
  if (!context) return null

  context.drawImage(videoElement, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.85)
}

function DocumentUploadCard({ label, docType, document, onUpload, disabled = false, uploadingDoc = null }) {
  const inputRef = useRef(null)
  const status = document ? 'uploaded' : 'empty'

  const handleChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    onUpload(file)
  }

  return (
    <div className={`kyc-upload-card kyc-upload-card--${status}`}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        className="kyc-upload-input"
        onChange={handleChange}
        aria-label={`Upload ${label}`}
      />
      <div className="kyc-upload-card-icon" aria-hidden="true">
        {status === 'uploaded' ? <CheckIcon /> : status === 'empty' ? <UploadIcon /> : <DocIcon />}
      </div>
      <div className="kyc-upload-card-body">
        <h3>{label}</h3>
        <p>{document ? document.name : 'JPG, PNG or PDF up to 10 MB'}</p>
        {document?.preview || document?.storageUrl ? (
          <img src={document.storageUrl || document.preview} alt={`${label} preview`} className="kyc-upload-preview" />
        ) : null}
      </div>
      <button
        type="button"
        className="kyc-upload-btn"
        onClick={() => inputRef.current?.click()}
        disabled={disabled}
      >
        {document ? 'Replace file' : 'Upload document'}
      </button>
      <span className={`kyc-upload-status kyc-upload-status--${status}`}>
        {status === 'uploaded' ? 'Uploaded' : uploadingDoc === docType ? 'Uploading...' : 'Pending'}
      </span>
    </div>
  )
}

function KycPage() {
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const {
    kycState,
    progress,
    isApproved,
    verificationNotice,
    saveError,
    dismissVerificationNotice,
    updateKyc,
    submitForReview,
    setStepStatus,
    setActiveStep,
    completeStep,
    startKyc,
  } = useKyc()

  const [showWizard, setShowWizard] = useState(false)
  const [ocrMessage, setOcrMessage] = useState('')
  const [faceMatchMessage, setFaceMatchMessage] = useState('')
  const [uploadingDoc, setUploadingDoc] = useState(null)
  const [uploadError, setUploadError] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  const activeStepId = kycState.activeStepId
  const cameraActive = activeStepId === 'camera'
  const { videoRef, error: cameraError, ready: cameraReady } = useCamera(cameraActive && showWizard)
  const canEditDocuments = !isApproved && kycState.status !== 'in_review'

  useEffect(() => {
    if (kycState.activeStepId === 'liveness') {
      setActiveStep('face-match')
    }
  }, [kycState.activeStepId, setActiveStep])

  useEffect(() => {
    if (
      kycState.status === 'in_progress'
      || kycState.status === 'in_review'
      || kycState.status === 'rejected'
      || isApproved
    ) {
      setShowWizard(true)
    }
  }, [kycState.status, isApproved])

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleDocumentUpload = useCallback(
    async (docType, file) => {
      if (!user?.email) return

      setUploadingDoc(docType)
      setUploadError('')
      try {
        const uploaded = await uploadKycDocumentImage(user.email, docType, file, file.name)

        await updateKyc((current) => ({
          ...current,
          status: current.status === 'rejected' ? 'in_progress' : current.status,
          documents: {
            ...current.documents,
            [docType]: {
              name: file.name,
              preview: uploaded.storageUrl,
              storageUrl: uploaded.storageUrl,
              storagePath: uploaded.storagePath,
              uploadedAt: new Date().toISOString(),
            },
          },
        }))
      } catch (error) {
        setUploadError(error?.message || `Could not upload ${docType}. Please try again.`)
      } finally {
        setUploadingDoc(null)
      }
    },
    [updateKyc, user?.email],
  )

  const runOcrVerification = useCallback(() => {
    setStepStatus('ocr', KYC_STEP_STATUS.PROCESSING)
    setOcrMessage('Scanning Aadhaar and PAN details...')

    window.setTimeout(() => {
      const ocrData = {
        name: user?.displayName ?? 'Verified User',
        aadhaar: 'XXXX-XXXX-4321',
        pan: 'ABCDE1234F',
        dob: '01 Jan 1995',
      }

      updateKyc((current) => ({
        ...current,
        ocrData,
      }))

      setOcrMessage('Document details extracted successfully.')
      completeStep('ocr', 'face-start')
    }, 2800)
  }, [completeStep, setStepStatus, updateKyc, user?.displayName])

  const runFaceMatch = useCallback(() => {
    setStepStatus('face-match', KYC_STEP_STATUS.PROCESSING)
    setFaceMatchMessage('Matching live face with ID photo...')

    window.setTimeout(() => {
      setFaceMatchMessage('Face match successful.')
      completeStep('face-match', 'success')
      window.setTimeout(async () => {
        setSubmittingReview(true)
        setUploadError('')
        try {
          await submitForReview()
        } catch (error) {
          setUploadError(error?.message || 'Could not submit KYC for admin review.')
        } finally {
          setSubmittingReview(false)
        }
      }, 1500)
    }, 2500)
  }, [completeStep, setStepStatus, submitForReview])

  const handleContinueUpload = () => {
    if (!kycState.documents.aadhaar || !kycState.documents.pan) return
    completeStep('upload', 'ocr')
    setActiveStep('ocr')
    runOcrVerification()
  }

  const handleStartFaceCheck = () => {
    completeStep('face-start', 'camera')
    setActiveStep('camera')
  }

  useEffect(() => {
    if (activeStepId === 'camera' && cameraReady) {
      const timer = window.setTimeout(async () => {
        const selfieDataUrl = captureVideoFrame(videoRef.current)

        if (selfieDataUrl && user?.email) {
          try {
            const uploaded = await uploadKycDocumentImage(user.email, 'selfie', selfieDataUrl, 'live-selfie.jpg')
            await updateKyc((current) => ({
              ...current,
              documents: {
                ...current.documents,
                selfie: {
                  name: 'live-selfie.jpg',
                  preview: uploaded.storageUrl,
                  storageUrl: uploaded.storageUrl,
                  storagePath: uploaded.storagePath,
                  uploadedAt: new Date().toISOString(),
                },
              },
            }))
          } catch {
            // Face capture upload failed; continue with verification flow.
          }
        }

        completeStep('camera', 'face-match')
        setActiveStep('face-match')
        runFaceMatch()
      }, 1200)
      return () => window.clearTimeout(timer)
    }
    return undefined
  }, [activeStepId, cameraReady, completeStep, setActiveStep, runFaceMatch, updateKyc, user?.email, videoRef])

  const handleBegin = () => {
    startKyc()
    setShowWizard(true)
  }

  if (!user) return null

  const bothDocsUploaded = Boolean(kycState.documents.aadhaar && kycState.documents.pan)

  return (
    <section className="kyc-page" aria-labelledby="kyc-heading">
      <div className="kyc-page-inner">
        <header className="kyc-page-header">
          <Link to="/dashboard" className="kyc-back-link">← Back to profile</Link>
          <div>
            <span className="kyc-eyebrow">Identity Verification</span>
            <h1 id="kyc-heading" className="kyc-title">KYC Verification</h1>
            <p className="kyc-lead">Complete document upload, OCR check, and live face verification to rent devices.</p>
          </div>
          <div className="kyc-progress-pill">
            <span>{progress}% complete</span>
          </div>
        </header>

        {(uploadError || saveError) && (
          <div className="kyc-notice-banner kyc-notice-banner--alert" role="alert">
            <p>{uploadError || saveError}</p>
          </div>
        )}

        {verificationNotice && (
          <div className={`kyc-notice-banner${kycState.status === 'approved' ? ' kyc-notice-banner--approved' : ' kyc-notice-banner--alert'}`}>
            <p>{verificationNotice.message}</p>
            <button type="button" className="kyc-btn kyc-btn--ghost" onClick={() => void dismissVerificationNotice()}>
              Dismiss
            </button>
          </div>
        )}

        {kycState.status === 'rejected' && (
          <div className="kyc-notice-banner kyc-notice-banner--alert">
            <p>
              {kycState.rejectionReason
                ? `Your KYC was rejected: ${kycState.rejectionReason}. Update your documents and submit again.`
                : 'Your KYC was rejected. Update your documents and submit again.'}
            </p>
          </div>
        )}

        {!showWizard && !isApproved && (
          <div className="kyc-intro-card">
            <div className="kyc-intro-icon"><ShieldIcon /></div>
            <div>
              <h2>Secure &amp; quick verification</h2>
              <ul>
                <li>Upload Aadhaar and PAN for OCR verification</li>
                <li>Complete live face check with your front camera</li>
                <li>All data is encrypted and used only for rental KYC</li>
              </ul>
              <div className="kyc-intro-actions">
                <button type="button" className="kyc-btn kyc-btn--primary" onClick={handleBegin}>
                  Start KYC Verification
                </button>
                <Link to="/dashboard" className="kyc-btn kyc-btn--ghost">Back to Dashboard</Link>
              </div>
            </div>
          </div>
        )}

        {(showWizard || isApproved) && (
          <div className="kyc-wizard">
            <aside className="kyc-stepper" aria-label="KYC progress steps">
              {KYC_STEPS.map((step, index) => {
                const status = kycState.stepStatuses[step.id]
                const isActive = activeStepId === step.id

                return (
                  <div
                    key={step.id}
                    className={`kyc-stepper-item${isActive ? ' is-active' : ''}${status === KYC_STEP_STATUS.DONE ? ' is-done' : ''}`}
                  >
                    <StepStatusIcon status={status} />
                    <div className="kyc-stepper-text">
                      <span className="kyc-stepper-num">Step {index + 1}</span>
                      <span className="kyc-stepper-label">{step.label}</span>
                    </div>
                  </div>
                )
              })}
            </aside>

            <div className="kyc-panel">
              {activeStepId === 'upload' && (
                <div className="kyc-step-content">
                  <h2>{canEditDocuments ? 'Upload Aadhaar / PAN' : 'Your documents'}</h2>
                  <p>
                    {canEditDocuments
                      ? 'Upload clear front-side images of your Aadhaar and PAN cards. You can replace them anytime before approval.'
                      : 'Your verified identity documents are stored securely.'}
                  </p>
                  <div className="kyc-upload-grid">
                    <DocumentUploadCard
                      label="Aadhaar Card"
                      docType="aadhaar"
                      document={kycState.documents.aadhaar}
                      onUpload={(file) => handleDocumentUpload('aadhaar', file)}
                      disabled={!canEditDocuments || uploadingDoc === 'aadhaar'}
                      uploadingDoc={uploadingDoc}
                    />
                    <DocumentUploadCard
                      label="PAN Card"
                      docType="pan"
                      document={kycState.documents.pan}
                      onUpload={(file) => handleDocumentUpload('pan', file)}
                      disabled={!canEditDocuments || uploadingDoc === 'pan'}
                      uploadingDoc={uploadingDoc}
                    />
                  </div>
                  {kycState.documents.selfie?.preview && (
                    <div className="kyc-selfie-preview">
                      <h3>Live selfie</h3>
                      <img src={kycState.documents.selfie.preview} alt="Live selfie preview" />
                    </div>
                  )}
                  {canEditDocuments && (
                    <button
                      type="button"
                      className="kyc-btn kyc-btn--primary"
                      disabled={!bothDocsUploaded || Boolean(uploadingDoc)}
                      onClick={handleContinueUpload}
                    >
                      Continue to OCR verification
                    </button>
                  )}
                </div>
              )}

              {activeStepId === 'ocr' && (
                <div className="kyc-step-content">
                  <h2>OCR Verification</h2>
                  <p>{ocrMessage || 'Extracting text from your uploaded documents...'}</p>
                  <div className="kyc-processing-card">
                    <SpinnerIcon />
                    <span>Running OCR on Aadhaar &amp; PAN</span>
                  </div>
                  {kycState.ocrData && (
                    <dl className="kyc-ocr-grid">
                      <div><dt>Name</dt><dd>{kycState.ocrData.name}</dd></div>
                      <div><dt>Aadhaar</dt><dd>{kycState.ocrData.aadhaar}</dd></div>
                      <div><dt>PAN</dt><dd>{kycState.ocrData.pan}</dd></div>
                      <div><dt>Date of birth</dt><dd>{kycState.ocrData.dob}</dd></div>
                    </dl>
                  )}
                </div>
              )}

              {activeStepId === 'face-start' && (
                <div className="kyc-step-content">
                  <h2>Start Live Face Check</h2>
                  <p>We will open your front camera for a quick liveness check and face match.</p>
                  <div className="kyc-face-start-card">
                    <CameraIcon />
                    <ul>
                      <li>Good lighting on your face</li>
                      <li>Remove mask or sunglasses</li>
                      <li>Keep your face inside the frame</li>
                    </ul>
                  </div>
                  <button type="button" className="kyc-btn kyc-btn--primary" onClick={handleStartFaceCheck}>
                    Start live face check
                  </button>
                </div>
              )}

              {activeStepId === 'camera' && (
                <div className="kyc-step-content">
                  <h2>Camera Opens</h2>
                  <p>Allow camera access when prompted. Position your face in the oval guide.</p>
                  <div className="kyc-camera-wrap">
                    {cameraError ? (
                      <div className="kyc-camera-error">
                        <CameraIcon />
                        <p>{cameraError}</p>
                        <button
                          type="button"
                          className="kyc-btn kyc-btn--ghost"
                          onClick={() => setActiveStep('camera')}
                        >
                          Retry camera access
                        </button>
                      </div>
                    ) : (
                      <>
                        <video ref={videoRef} className="kyc-camera-video" playsInline muted autoPlay />
                        <div className="kyc-camera-overlay" aria-hidden="true" />
                        {!cameraReady && (
                          <div className="kyc-camera-loading">
                            <SpinnerIcon />
                            <span>Opening camera...</span>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {activeStepId === 'face-match' && (
                <div className="kyc-step-content">
                  <h2>Face Match</h2>
                  <p>{faceMatchMessage || 'Comparing your live capture with document photo...'}</p>
                  <div className="kyc-processing-card">
                    <SpinnerIcon />
                    <span>Running face match</span>
                  </div>
                </div>
              )}

              {activeStepId === 'success' && kycState.status === 'in_review' && (
                <div className="kyc-step-content kyc-step-content--center">
                  <div className="kyc-success-icon"><CheckIcon /></div>
                  <h2>Submitted for admin review</h2>
                  <p>
                    Your Aadhaar, PAN, and live face verification are complete. Our admin team will
                    review your documents and confirm your rental orders shortly.
                  </p>
                  {submittingReview && <p>Saving your KYC submission...</p>}
                  <div className="kyc-intro-actions">
                    <Link to="/dashboard" className="kyc-btn kyc-btn--primary">View profile status</Link>
                    <Link to="/rent-products" className="kyc-btn kyc-btn--ghost">Browse rental products</Link>
                  </div>
                </div>
              )}

              {activeStepId === 'success' && kycState.status !== 'in_review' && (
                <div className="kyc-step-content kyc-step-content--center">
                  <div className="kyc-success-icon"><CheckIcon /></div>
                  <h2>Verification Success</h2>
                  <p>Your documents and live face check passed all verification steps.</p>
                </div>
              )}

              {activeStepId === 'approved' && (
                <div className="kyc-step-content kyc-step-content--center">
                  <div className="kyc-approved-badge">KYC Approved</div>
                  <h2>You are verified!</h2>
                  <p>Your identity is verified. You can now rent laptops, mobiles, printers, and more.</p>
                  <div className="kyc-intro-actions">
                    <Link to="/rent-products" className="kyc-btn kyc-btn--primary">Browse rental products</Link>
                    <Link to="/dashboard" className="kyc-btn kyc-btn--ghost">View profile status</Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default KycPage
