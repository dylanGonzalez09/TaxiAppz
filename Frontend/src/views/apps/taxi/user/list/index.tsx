// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import UserListTable from './UserListTable'

// Updated Component with `showAddButton` prop
const UserList = ({ userData, dictionary, showAddButton, showActionButton }: { userData?: any[], dictionary: any, showAddButton: boolean, showActionButton: boolean }) => {

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
       
        <UserListTable tableData={userData} dictionary={dictionary} showAddButton={showAddButton} showActionButton={showActionButton}/>
      </Grid>
    </Grid>
  );
}

export default UserList;
