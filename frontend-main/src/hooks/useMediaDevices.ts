import { useState, useEffect, useRef, useCallback } from 'react'

interface UseMediaDevicesReturn {
  stream: MediaStream | null
  error: string | null
  isLoading: boolean
  hasPermission: boolean
  requestPermission: () => Promise<void>
  stopStream: () => void
}

export function useMediaDevices(): UseMediaDevicesReturn {
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [hasPermission, setHasPermission] = useState(false)
  const streamRef = useRef<MediaStream | null>(null)

  const requestPermission = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = mediaStream
      setStream(mediaStream)
      setHasPermission(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to access media devices')
      setHasPermission(false)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
      setStream(null)
    }
  }, [])

  useEffect(() => {
    return () => stopStream()
  }, [stopStream])

  return { stream, error, isLoading, hasPermission, requestPermission, stopStream }
}
