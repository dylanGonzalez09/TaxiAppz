/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import type { ReactElement } from 'react'

// Type Imports
import type { SystemMode } from '@core/types'

// Hook Imports
import { useSettings } from '@core/hooks/useSettings'
import useLayoutInit from '@core/hooks/useLayoutInit'

type LayoutWrapperProps = {
  systemMode: SystemMode
  verticalLayout: ReactElement
}

const LayoutWrapper = (props: LayoutWrapperProps) => {
  // Props
  const { systemMode, verticalLayout } = props

  // Hooks
  const { settings } = useSettings()

  useLayoutInit(systemMode)
  
return (
    <>
     <div className='flex flex-col flex-auto' data-skin={settings.skin}>
      {verticalLayout}
    </div>
    </>
  );

}

export default LayoutWrapper
