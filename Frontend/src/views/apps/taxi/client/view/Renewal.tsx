// MUI Imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box'; // Import Box for layout

const RenewalReminder = (dictionary:any) => {
  // Static data for client and renewal details
  const daysLeft = 7; // Example number of days left for renewal

  return (
    <Card>
      <CardContent className="relative mbe-3">
        {/* Title of the reminder */}
        <Typography variant="h5" className="mbe-0.5">
         {dictionary['navigation'].ReminderRenewalDueSoon}
        </Typography>
        
        {/* Subtitle with the number of days left */}
        <Typography variant="subtitle1" className="mbe-3">
          {dictionary['navigation'].Thisclienthas} {daysLeft} {dictionary['navigation'].daysleftuntiltherenewaldate}.
        </Typography>

        {/* Box to align the days and the button on a single line */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Displaying the number of days left */}
          <Typography variant="h4" color="primary.main">
            {daysLeft > 0 ? `${daysLeft} Days` : 'Expired'}
          </Typography>

          {/* Box to align the button to the right */}
          <Box ml={2}>
            <Button 
              variant="contained" 
              color="primary" 
              disabled={daysLeft <= 0} // Disable button if expired
            >
              {dictionary['navigation'].SendReminder}
            </Button>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RenewalReminder;
