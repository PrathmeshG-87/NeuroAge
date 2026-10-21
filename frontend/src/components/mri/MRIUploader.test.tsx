import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>(
    'react-router-dom',
  )
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

import { MRIUploader } from './MRIUploader'
import { assessmentService } from '@/services/assessment'

describe('MRIUploader', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('waits for backend processing to complete before marking the assessment as success', async () => {
    vi.spyOn(assessmentService, 'createAssessment').mockResolvedValue({
      assessmentId: 'assessment-123',
      status: 'queued',
      message: 'Assessment accepted and queued for processing.',
      createdAt: new Date().toISOString(),
      accessToken: 'token-123',
    })

    vi.spyOn(assessmentService, 'waitForCompletion').mockResolvedValue({
      assessmentId: 'assessment-123',
      status: 'completed',
      chronologicalAge: 62,
      predictedBrainAge: 67.2,
      brainAgeDifference: 5.2,
      uncertaintyInterval: [64.1, 69.8],
      modelName: 'ResNet3D-Regression v1',
      assessmentDate: '2026-10-18T09:35:00.000Z',
      processingStatus: 'Completed',
      preview: {
        url: 'data:image/svg+xml;charset=utf-8,preview',
        fileType: 'image',
        available: true,
        message: 'Generated MRI preview.',
        availableViews: ['axial'],
      },
      modelLimitations: [],
      disclaimer: 'Research only.',
    })

    render(<MRIUploader />)

    const file = new File(['nii-data'], 'brain.nii.gz', {
      type: 'application/octet-stream',
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })

    fireEvent.click(screen.getByRole('button', { name: /submit assessment/i }))

    await waitFor(() => {
      expect(assessmentService.createAssessment).toHaveBeenCalledTimes(1)
    })

    await waitFor(() => {
      expect(assessmentService.waitForCompletion).toHaveBeenCalledWith(
        'assessment-123',
        expect.any(Object),
      )
    })

    await waitFor(() => {
      expect(screen.getByText(/assessment submitted/i)).toBeInTheDocument()
    })
  })

  it('navigates to the detail page after a successful upload', async () => {
    vi.spyOn(assessmentService, 'createAssessment').mockResolvedValue({
      assessmentId: 'assessment-123',
      status: 'queued',
      message: 'Assessment accepted and queued for processing.',
      createdAt: new Date().toISOString(),
      accessToken: 'token-123',
    })

    vi.spyOn(assessmentService, 'waitForCompletion').mockResolvedValue({
      assessmentId: 'assessment-123',
      status: 'completed',
      chronologicalAge: 62,
      predictedBrainAge: 67.2,
      brainAgeDifference: 5.2,
      uncertaintyInterval: [64.1, 69.8],
      modelName: 'ResNet3D-Regression v1',
      assessmentDate: '2026-10-18T09:35:00.000Z',
      processingStatus: 'Completed',
      preview: {
        url: 'data:image/svg+xml;charset=utf-8,preview',
        fileType: 'image',
        available: true,
        message: 'Generated MRI preview.',
        availableViews: ['axial'],
      },
      modelLimitations: [],
      disclaimer: 'Research only.',
    })

    render(<MRIUploader />)

    const file = new File(['nii-data'], 'brain.nii.gz', {
      type: 'application/octet-stream',
    })

    const input = document.querySelector('input[type="file"]') as HTMLInputElement
    fireEvent.change(input, { target: { files: [file] } })
    fireEvent.click(screen.getByRole('button', { name: /submit assessment/i }))

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/assessments/assessment-123')
    })
  })
})
