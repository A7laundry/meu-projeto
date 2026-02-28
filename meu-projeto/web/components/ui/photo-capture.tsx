'use client'

import { useRef } from 'react'

interface PhotoCaptureProps {
  photos: File[]
  onPhotosChange: (photos: File[]) => void
  maxPhotos?: number
  label?: string
}

export function PhotoCapture({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  label = 'Evidencias fotograficas',
}: PhotoCaptureProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  function handleCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files || files.length === 0) return

    const remaining = maxPhotos - photos.length
    if (remaining <= 0) return

    const newFiles = Array.from(files).slice(0, remaining)
    onPhotosChange([...photos, ...newFiles])

    // Reset input so the same file can be re-selected
    if (inputRef.current) inputRef.current.value = ''
  }

  function removePhoto(index: number) {
    onPhotosChange(photos.filter((_, i) => i !== index))
  }

  const canAddMore = photos.length < maxPhotos

  return (
    <div className="space-y-3">
      <label
        className="text-xs text-white/35 mb-1.5 block uppercase tracking-wide"
      >
        {label}
      </label>

      {/* Thumbnails grid */}
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2.5">
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="relative group"
              style={{
                width: 72,
                height: 72,
                borderRadius: 10,
                overflow: 'hidden',
                border: '1px solid rgba(214,178,94,0.18)',
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={URL.createObjectURL(photo)}
                alt={`Foto ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePhoto(idx)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                style={{
                  background: 'rgba(0,0,0,0.75)',
                  color: '#fca5a5',
                  border: '1px solid rgba(248,113,113,0.30)',
                }}
              >
                X
              </button>
              {/* Index badge */}
              <span
                className="absolute bottom-0.5 left-0.5 text-[9px] font-bold px-1 rounded"
                style={{
                  background: 'rgba(0,0,0,0.65)',
                  color: 'rgba(214,178,94,0.70)',
                }}
              >
                {idx + 1}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Capture button */}
      {canAddMore && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
          style={{
            background: 'rgba(214,178,94,0.06)',
            border: '1px dashed rgba(214,178,94,0.22)',
            color: 'rgba(214,178,94,0.65)',
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Tirar Foto ({photos.length}/{maxPhotos})
        </button>
      )}

      {/* Hidden file input — uses capture="environment" for mobile camera */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCapture}
        className="hidden"
      />

      {/* Max reached hint */}
      {!canAddMore && (
        <p className="text-[11px] text-white/25 text-center">
          Limite de {maxPhotos} fotos atingido
        </p>
      )}
    </div>
  )
}
