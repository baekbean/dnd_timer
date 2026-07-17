'use client'

import { useEffect, useState } from 'react'
import { detectDeviceType, type DeviceType } from '@/lib/deviceType'

/**
 * Client-only device classification. Returns null until mounted so the
 * server-rendered markup never disagrees with the client (UA isn't
 * available during SSR).
 */
export function useDeviceType(): DeviceType | null {
  const [deviceType, setDeviceType] = useState<DeviceType | null>(null)

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- UA isn't available during SSR, so this has to resolve on mount.
    setDeviceType(detectDeviceType())
  }, [])

  return deviceType
}
