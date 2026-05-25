"use client"; // Ensure this component runs on the client

// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineDot from '@mui/lab/TimelineDot';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import MuiTimeline from '@mui/lab/Timeline';
import { styled } from '@mui/material/styles';

// Styled Timeline component
const Timeline = styled(MuiTimeline)({
  paddingLeft: 0,
  paddingRight: 0,
  '& .MuiTimelineItem-root': {
    width: '100%',
    '&:before': {
      display: 'none',
    },
  },
  '& .MuiTimelineDot-root': {
    border: 0,
    padding: 0,
  },
});

// AddressCard Component
const AddressCard = ({ requestData, dictionary }: { requestData?: any; dictionary: any }) => {
  if (!requestData || requestData.length === 0) {
    return <Typography variant="body2">No address data available.</Typography>;
  }

  const placesDetails = requestData[0].addressDetails;

  const lastdropAddress = placesDetails[placesDetails.length - 1]?.dropAddress;

  const pickAddresses = placesDetails.map((detail: { pickAddress: string }) => ({
    status: 'Completed',
    detail: detail.pickAddress,
    label: 'Pickup Address:',
  }));

  const addresses = [
    ...pickAddresses,
    lastdropAddress ? { status: 'In Progress', detail: lastdropAddress, label: 'Drop Address:' } : null,
  ].filter(Boolean);

  return (
    <Card>
      <CardContent className='flex flex-col gap-6'>
        <div className='flex justify-between items-center'>
          <Typography variant='h5'>{dictionary['navigation'].LocationDetails}</Typography>
        </div>
        <Timeline>
          {addresses.map((address, index) => {
            const isCompleted = address.status === 'Completed';

            const iconClass = isCompleted
              ? 'tabler-map-pin text-success'
              : 'tabler-map-pin text-warning';

            return (
              <TimelineItem key={index}>
                <TimelineSeparator>
                  <TimelineDot variant='outlined'>
                    <i className={`text-xl ${iconClass}`} />
                  </TimelineDot>
                  {index < addresses.length - 1 && <TimelineConnector />}
                </TimelineSeparator>

                <TimelineContent className='flex flex-col gap-1'>
                  {address.label && (
                    <Typography variant='caption' className='!text-textPrimary text-xs !text-muted'>
                      {address.label}
                    </Typography>
                  )}
                  <Typography className={`font-medium !text-textPrimary ${isCompleted ? '!text-success' : '!text-success'}`}>
                    {address.detail}
                  </Typography>
                </TimelineContent>
              </TimelineItem>
            );
          })}
        </Timeline>
      </CardContent>
    </Card>
  );
};

export default AddressCard;
