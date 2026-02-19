'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

export interface QRScannerState {
  isScanning: boolean
  error: string | null
  videoRef: React.RefObject<HTMLVideoElement | null>
  startScanning: () => Promise<void>
  stopScanning: () => void
}

export function useQRScanner(onScan: (value: string) => void): QRScannerState {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const controlsRef = useRef<{ stop: () => void } | null>(null)

  const stopScanning = useCallback(() => {
    controlsRef.current?.stop()
    controlsRef.current = null
    setIsScanning(false)
  }, [])

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return
    setError(null)

    try {
      const { BrowserMultiFormatReader } = await import('@zxing/browser')
      const reader = new BrowserMultiFormatReader()

      setIsScanning(true)
      const controls = await reader.decodeFromVideoDevice(
        undefined,
        videoRef.current,
        (result, err) => {
          if (result) {
            onScan(result.getText())
            stopScanning()
          }
          // Ignore continuous NotFoundError (no QR in frame yet)
          if (err && err.name !== 'NotFoundException') {
            setError('Erro na câmera. Tente recarregar.')
          }
        }
      )
      controlsRef.current = controls
    } catch {
      setError('Câmera não disponível. Verifique as permissões.')
      setIsScanning(false)
    }
  }, [onScan, stopScanning])

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [stopScanning])

  return { isScanning, error, videoRef, startScanning, stopScanning }
}
