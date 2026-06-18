export const KYC_STEPS = [
  { id: 'upload', label: 'Upload Aadhaar/PAN', description: 'Upload clear photos of your government ID.' },
  { id: 'ocr', label: 'OCR Verification', description: 'We extract and verify details from your documents.' },
  { id: 'face-start', label: 'Start Live Face Check', description: 'Begin biometric liveness verification.' },
  { id: 'camera', label: 'Camera Opens', description: 'Allow camera access for live face capture.' },
  { id: 'face-match', label: 'Face Match', description: 'Match your live face with ID photo.' },
  { id: 'success', label: 'Verification Success', description: 'Your identity checks passed successfully.' },
  { id: 'approved', label: 'KYC Approved', description: 'You are verified and ready to rent.' },
]

export const KYC_STEP_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  DONE: 'done',
  FAILED: 'failed',
}

export function createDefaultKycState() {
  return {
    status: 'not_started',
    activeStepId: 'upload',
    stepStatuses: Object.fromEntries(KYC_STEPS.map((step) => [step.id, KYC_STEP_STATUS.PENDING])),
    documents: {
      aadhaar: null,
      pan: null,
    },
    ocrData: null,
    completedAt: null,
  }
}
