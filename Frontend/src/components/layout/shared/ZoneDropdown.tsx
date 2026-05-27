'use client'

import { useState, useEffect, useCallback } from 'react'

import { useRouter, useParams ,usePathname} from 'next/navigation'

import { useSession } from 'next-auth/react'
import { Select, FormControl, InputLabel, MenuItem, Snackbar, Alert } from '@mui/material'
import { toast } from 'react-toastify'


const ZoneDropdown = ({ zoneData }: { zoneData: any[] }) => {
  const [selectedZone, setSelectedZone] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const pathname = usePathname()

  const { data: session, update } = useSession()
  const router = useRouter()
  const { zoneId } = useParams()

  const currentZone = zoneId as string | undefined
  const hasZones = Array.isArray(zoneData) && zoneData.length > 0

  // ✅ Get default zone based on roles
  const getDefaultZoneId = useCallback(() => {
    let defaultZoneId = ''

    if (zoneData.length > 0) {
      // Always pick the first zone as default; this keeps UI consistent across roles.
      defaultZoneId = zoneData[0]._id // first zone id
    }

    // Store in localStorage
    if (defaultZoneId) {
      localStorage.setItem('defaultZoneId', defaultZoneId)
    }

    return defaultZoneId
  }, [zoneData, session?.user?.image])

  // ✅ Initialize selection without API calls
  useEffect(() => {
    if (zoneData.length > 0 && session?.user) {
      const defaultZoneId = getDefaultZoneId()

      // Determine initial selection
      const initialZone = currentZone || defaultZoneId || zoneData[0]._id || ''

      setSelectedZone(initialZone)
    }
  }, [currentZone, zoneData, session?.user, getDefaultZoneId])

  // ✅ Handle user selection changes only
  const handleChange = async (event: any) => {
    const newZoneId = event.target.value as string

    // Mark that user has interacted
    setHasUserInteracted(true)

    // Don't trigger if zone hasn't changed
    if (newZoneId === selectedZone) {
      return
    }

    setIsUpdating(true)
    setShowToast(true)

    try {
      // Update session
      await update({
        image: {
          ...session?.user?.image,
          zoneId: newZoneId
        }
      })

      setSelectedZone(newZoneId)
      await new Promise(resolve => setTimeout(resolve, 200))

      // ✅ Only call API if user has actually interacted
      if (hasUserInteracted) {
        await fetch('/api/update-zone', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ zoneId: newZoneId })
        })
      }

      setShowToast(false)

      // Navigate to new zone
      // await router.push(`/en/${newZoneId}/dashboards/client`)
      await router.push(pathname.replace(`/${currentZone}/`, `/${newZoneId}/`))
      toast.success('Zone switched successfully!')

    } catch (error) {
      console.error('Failed to update zone:', error)
      setSelectedZone(currentZone || '')
    } finally {
      setIsUpdating(false)
      setShowToast(false)
    }
  }

  // No zones available: hide zone selector completely.
  if (!hasZones) {
    return null
  }

  return (
    <>
      <FormControl disabled={isUpdating}>
        <InputLabel>Zone {isUpdating && '(Updating...)'}</InputLabel>
        <Select
          value={selectedZone}
          label={`Zone ${isUpdating ? '(Updating...)' : ''}`}
          onChange={handleChange}
        >
          {zoneData.map(zone => (
            <MenuItem key={zone._id} value={zone._id}>
              {zone.zoneName}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Snackbar
        open={showToast}
        onClose={() => setShowToast(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity="info" sx={{ width: '100%' }}>
          Switching zone, please wait...
        </Alert>
      </Snackbar>
    </>
  )
}

export default ZoneDropdown
