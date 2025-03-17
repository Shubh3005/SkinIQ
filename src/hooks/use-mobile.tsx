
import * as React from "react"

const MOBILE_BREAKPOINT = 768
const TABLET_BREAKPOINT = 1024

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  isIOS: boolean
  isAndroid: boolean
  isTouch: boolean
}

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

export function useDeviceInfo(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = React.useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    isIOS: false,
    isAndroid: false,
    isTouch: false,
  })

  React.useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const isMobile = width < MOBILE_BREAKPOINT
      const isTablet = width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT
      const isDesktop = width >= TABLET_BREAKPOINT

      // Detect iOS
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || 
                   (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
      
      // Detect Android
      const isAndroid = /Android/.test(navigator.userAgent)
      
      // Detect touch capability
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        isIOS,
        isAndroid,
        isTouch,
      })
    }

    // Initialize
    updateDeviceInfo()

    // Add resize listener
    window.addEventListener('resize', updateDeviceInfo)
    
    return () => {
      window.removeEventListener('resize', updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
