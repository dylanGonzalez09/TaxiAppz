// MUI Imports
import Grid from '@mui/material/Grid';

// Component Imports
import ClientListTable from './ClientTable';

const ClientList = ({ clientData, dictionary }: { clientData?: any, dictionary: any }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <ClientListTable tableData={clientData} dictionary={dictionary}  />
      </Grid>
    </Grid>
  );
};

export default ClientList;
