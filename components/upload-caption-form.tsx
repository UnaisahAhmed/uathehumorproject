'use client'

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const API_BASE_URL = 'https://api.almostcrackd.ai'

const SUPPORTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/heic',
])

interface PresignedUrlResponse {
  presignedUrl: string
  cdnUrl: string
}

interface RegisterImageResponse {
  imageId: string
  now: number
}

type CaptionRecord = Record<string, unknown>

function getCaptionText(record: CaptionRecord): string {
  const candidates = ['content', 'caption', 'text', 'generated_caption']

  for (const key of candidates) {
    const value = record[key]
    if (typeof value === 'string' && value.trim().length > 0) {
      return value
    }
  }

  return JSON.stringify(record)
}

async function parseErrorMessage(response: Response): Promise<string> {
  const fallback = `Request failed (${response.status})`

  try {
    const data: unknown = await response.json()
    if (data && typeof data === 'object') {
      const withMessage = data as { message?: unknown; error?: unknown }
      if (typeof withMessage.message === 'string' && withMessage.message.trim().length > 0) {
        return withMessage.message
      }
      if (typeof withMessage.error === 'string' && withMessage.error.trim().length > 0) {
        return withMessage.error
      }
    }
  } catch {
    // Ignore and use fallback
  }

  return fallback
}

export default function UploadCaptionForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [statusText, setStatusText] = useState('Select an image to begin.')
  const [errorText, setErrorText] = useState('')
  const [uploadedCdnUrl, setUploadedCdnUrl] = useState('')
  const [imageId, setImageId] = useState('')
  const [captions, setCaptions] = useState<CaptionRecord[]>([])

  const previewUrl = useMemo(() => {
    if (!file) {
      return ''
    }

    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0] ?? null

    setErrorText('')
    setCaptions([])
    setUploadedCdnUrl('')
    setImageId('')

    if (!nextFile) {
      setFile(null)
      setStatusText('Select an image to begin.')
      return
    }

    if (!SUPPORTED_IMAGE_TYPES.has(nextFile.type)) {
      setFile(null)
      setStatusText('Select an image to begin.')
      setErrorText('Unsupported file type. Please upload JPEG, PNG, WEBP, GIF, or HEIC.')
      return
    }

    setFile(nextFile)
    setStatusText('Ready to upload and generate captions.')
  }

  const runPipeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!file) {
      setErrorText('Please choose an image file first.')
      return
    }

    setIsRunning(true)
    setErrorText('')
    setCaptions([])
    setUploadedCdnUrl('')
    setImageId('')

    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()

      if (error) {
        throw new Error(error.message)
      }

      const token = data.session?.access_token
      if (!token) {
        throw new Error('You are not authenticated. Please sign in again.')
      }

      const contentType = file.type

      setStatusText('Step 1/4: Generating presigned upload URL...')
      const presignedResponse = await fetch(`${API_BASE_URL}/pipeline/generate-presigned-url`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentType }),
      })

      if (!presignedResponse.ok) {
        throw new Error(await parseErrorMessage(presignedResponse))
      }

      const { presignedUrl, cdnUrl } = (await presignedResponse.json()) as PresignedUrlResponse

      setStatusText('Step 2/4: Uploading image bytes...')
      const uploadResponse = await fetch(presignedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': contentType,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error(await parseErrorMessage(uploadResponse))
      }

      setUploadedCdnUrl(cdnUrl)

      setStatusText('Step 3/4: Registering image with pipeline...')
      const registerResponse = await fetch(`${API_BASE_URL}/pipeline/upload-image-from-url`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageUrl: cdnUrl,
          isCommonUse: false,
        }),
      })

      if (!registerResponse.ok) {
        throw new Error(await parseErrorMessage(registerResponse))
      }

      const registerPayload = (await registerResponse.json()) as RegisterImageResponse
      setImageId(registerPayload.imageId)

      setStatusText('Step 4/4: Generating captions...')
      const generateResponse = await fetch(`${API_BASE_URL}/pipeline/generate-captions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageId: registerPayload.imageId,
        }),
      })

      if (!generateResponse.ok) {
        throw new Error(await parseErrorMessage(generateResponse))
      }

      const generated = (await generateResponse.json()) as unknown
      const records = Array.isArray(generated)
        ? generated.filter((item): item is CaptionRecord => !!item && typeof item === 'object')
        : []

      setCaptions(records)
      setStatusText(`Done: generated ${records.length} caption${records.length === 1 ? '' : 's'}.`)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unexpected error during upload pipeline.'
      setErrorText(message)
      setStatusText('Pipeline failed. Fix the issue and try again.')
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <section className="upload-flow" aria-live="polite">
      <form className="upload-form" onSubmit={runPipeline}>
        <label className="upload-label" htmlFor="image-upload-input">
          Upload image
        </label>

        <input
          id="image-upload-input"
          name="image"
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/heic"
          onChange={onFileChange}
          className="upload-input"
          disabled={isRunning}
        />

        {file ? <p className="upload-file-meta">Selected: {file.name}</p> : null}

        <button className="upload-submit" type="submit" disabled={!file || isRunning}>
          {isRunning ? 'Working...' : 'Upload & Generate Captions'}
        </button>
      </form>

      <div className="upload-status-box">
        <p className="upload-status">{statusText}</p>
        {errorText ? <p className="upload-error">{errorText}</p> : null}
        {uploadedCdnUrl ? (
          <p className="upload-meta">
            Uploaded URL: <a href={uploadedCdnUrl} target="_blank" rel="noreferrer">Open image</a>
          </p>
        ) : null}
        {imageId ? <p className="upload-meta">Image ID: {imageId}</p> : null}
      </div>

      {previewUrl ? (
        <div className="upload-preview">
          <img src={previewUrl} alt="Selected upload preview" className="upload-preview-image" />
        </div>
      ) : null}

      {captions.length > 0 ? (
        <div className="generated-captions">
          <h2 className="generated-title">Generated Captions</h2>
          <ol className="generated-list">
            {captions.map((record, index) => (
              <li key={`${index}-${getCaptionText(record)}`} className="generated-item">
                {getCaptionText(record)}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  )
}
