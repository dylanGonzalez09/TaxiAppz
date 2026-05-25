'use client'

// MUI Imports
import Button from '@mui/material/Button'

// Type Imports
declare global {
  interface Window {
    Supademo: {
      open: (id: string) => void
    }
  }
}

const SupademoButton = () => {
  const handleClick = () => {
    if (typeof window !== 'undefined' && window.Supademo) {
      window.Supademo.open('cmkqrypa42wemcydyu9v1yzvl')
    }
  }

  return (
    <Button
      variant='contained'
      color='success'
      onClick={handleClick}
      sx={{
        textTransform: 'none',
      }}
    >
      Try the tour
    </Button>
  )
}

export default SupademoButton

