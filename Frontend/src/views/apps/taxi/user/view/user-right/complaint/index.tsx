// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import Complaint from './Complaint'

// Type Definitions
interface ComplaintDataType {
  id: string;
  title: string;
  description: string;
  status: string;
  createdAt: string;
  userId: string;
  userName: string;
  assignedToId: string | null;
  assignedToName: string;
}

interface ComplaintTableProps {
  userId: string;
  complaintData: ComplaintDataType[]; // Optional with a default value
  dictionary: any;
}

const ComplaintTable =  ({ userId, complaintData , dictionary }: ComplaintTableProps) => {

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Complaint userId={userId} complaintData={complaintData} dictionary={dictionary}/>
      </Grid>
    </Grid>
  )  
}

export default ComplaintTable
