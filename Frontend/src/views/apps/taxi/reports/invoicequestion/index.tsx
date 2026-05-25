import Grid from '@mui/material/Grid';

import InvoiceQuestionTable from './invoicequestion';

const InvoiceQuestionList = ({  dictionary , staticGroup}: { staticGroup: any, dictionary: any , privillageData :any}) => {
  return (
    <Grid container spacing={6}>
      {/* <Grid item xs={12}>
        <DriverCard driverData={driverData} />
      </Grid> */}
      <Grid item xs={12}>
        <InvoiceQuestionTable  dictionary={dictionary} staticGroup={staticGroup} />
      </Grid>
    </Grid>
  );
};

export default InvoiceQuestionList;
