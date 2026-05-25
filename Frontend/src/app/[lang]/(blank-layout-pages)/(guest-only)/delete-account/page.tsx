// Next Imports
import type { Metadata } from 'next'

// Component Imports
import DeleteAccount from '@views/DeleteAccount'

// Server Action Imports
import { getServerMode } from '@core/utils/serverHelpers'

export const metadata: Metadata = {
  title: 'Delete Account',
  description: 'Delete Account'
}

const DeleteAccountPage = () => {
  // Vars
  const mode = getServerMode()

  return <DeleteAccount mode={mode} />
}

export default DeleteAccountPage