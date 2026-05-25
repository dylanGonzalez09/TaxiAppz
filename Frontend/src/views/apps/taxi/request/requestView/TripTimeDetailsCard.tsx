'use client'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TimelineDot from '@mui/lab/TimelineDot'
import TimelineItem from '@mui/lab/TimelineItem'
import TimelineContent from '@mui/lab/TimelineContent'
import TimelineSeparator from '@mui/lab/TimelineSeparator'
import TimelineConnector from '@mui/lab/TimelineConnector'
import Typography from '@mui/material/Typography'
import { styled } from '@mui/material/styles'
import MuiTimeline from '@mui/lab/Timeline'
import type { TimelineProps } from '@mui/lab/Timeline'
import CancelIcon from '@mui/icons-material/Cancel'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'

// Styled Timeline component
const Timeline = styled(MuiTimeline)<TimelineProps>({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none'
    },
    '& .MuiTimelineContent-root:last-child': {
      paddingBottom: 0
    },
    '& .MuiTimelineConnector-root': {
      backgroundColor: 'var(--mui-palette-primary-main)'
    }
  }
})

type EventItem = {
  label: string;
  time: string;
};

type Props = {
  events: EventItem[];
  dictionary: any; 
};

const TripTimeDetails = ({ events, dictionary }: Props) => {
  const filteredEvents = events.filter(event => !!event.time);
  const lastEvent = filteredEvents[filteredEvents.length - 1];
  const isCompleted = lastEvent?.label === 'Trip Completed Time';
  const isCancelled = lastEvent?.label === 'Trip Cancel Time';

  return (
    <Card>
   <CardHeader title={dictionary['navigation'].Triptimedetails} />
    {filteredEvents.length > 0 && (
      <CardContent>
        <Timeline>
          {filteredEvents.map((event, index) => {
            const isLastItem = index === filteredEvents.length - 1;

            const connectorColor = isLastItem 
              ? 'transparent' 
              : (isCancelled && index === filteredEvents.length - 2) 
                ? 'error.main' 
                : 'primary.main';

            return (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  {isLastItem ? (
                    isCompleted ? (
                      <CheckCircleIcon 
                        
                      // color="success" 
                        fontSize="small"
                        sx={{ 
                          fontSize: '1.25rem',
                          margin: '4px 0',
                          color: 'success.main'
                        }} 
                      />
                    ) : isCancelled ? (
                     
                      <CancelIcon 
                       
                      // color="error" 
                       
                      fontSize="small"
                        sx={{ 
                          fontSize: '1.25rem',
                          margin: '4px 0',
                          color: 'error.main'
                        }} 
                      />
                    ) : (
                      <TimelineDot color="primary" />
                    )
                  ) : (
                    <TimelineDot color="primary" />
                  )}
                  {!isLastItem && (
                    <TimelineConnector sx={{ 
                      backgroundColor: connectorColor,
                      ...(isCancelled && index === filteredEvents.length - 2 ? { 
                        borderInlineStart: '1px dashed',
                        borderColor: 'error.main'
                      } : {})
                    }} />
                  )}
                </TimelineSeparator>
                <TimelineContent>
                  <div className='flex flex-wrap items-center justify-between gap-x-2 mbe-2.5'>
                    <Typography sx={{
                          color: isLastItem
                            ? isCompleted
                              ? 'success.main'
                              : isCancelled
                                ? 'error.main'
                                : 'text.primary'
                            : 'text.primary'
                        }} className='font-medium'>
                      {event.label}
                    </Typography>
                  </div>
                  <Typography className='mbe-2'>{event.time}</Typography>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </CardContent>
    )}
    </Card>
  )
}

export default TripTimeDetails
