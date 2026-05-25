// MUI Imports
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'

const SevenDays = (dictionary:any) => {
  return (
    <Card>
      <CardContent className='relative'>
        <Typography variant='h5' className='mbe-0.5'>
          {dictionary['navigation'].Congratulations}
        </Typography>
        <Typography variant='subtitle1' className='mbe-1'>
          {dictionary['navigation'].last7dayssales}
        </Typography>
        <Typography variant='h4' color='primary.main'>
          $48.9k
        </Typography>
    
        <img
          alt='Congratulations John'
          src='/images/illustrations/characters/8.png'
          className='absolute block-end-0 max-bs-[150px] is-[116px] inline-end-6'
        />
        <img />
      </CardContent>
    </Card>
  )
}

export default SevenDays
