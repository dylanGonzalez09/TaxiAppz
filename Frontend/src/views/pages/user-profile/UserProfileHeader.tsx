'use client';

import { useState } from 'react';

import { Card, CardContent, Typography, Divider, Button, Box, Avatar } from '@mui/material';

import EditProfileDrawer from './EditProfileDrawer';
import EditPasswordDrawer from './EditPasswordDrawer';

const UserDetails = ({ profileData, dictionary,zoneId }: { profileData: any; dictionary: any,zoneId:any }) => {
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editPasswordOpen, setEditPasswordOpen] = useState(false);
const [data, setData] = useState(profileData);

  const toggleEditProfile = () => setEditProfileOpen((prevState) => !prevState);
  const toggleEditPassword = () => setEditPasswordOpen((prevState) => !prevState);


  return (
    <>     <Card sx={{ borderRadius: 2, boxShadow: 3, maxWidth: 600, mx: 'auto' }}>
        <CardContent>
          {/* Profile Section */}
          <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" py={4}>
            <Avatar
              alt="user-profile"
              src={data.profilePic}
              sx={{
                width: 120,
                height: 120,
                border: '4px solid #fff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
              }}
             
            />
         <Typography variant="h4" mt={2} fontWeight="bold" color="primary">
              {`${data.firstName} ${data.lastName}`}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary" mt={1}>
              {data.email}
            </Typography>
          </Box>

          {/* Information Section */}
          <Box display="flex" flexDirection="column" gap={2} mt={4}>
            <Typography variant="h6" color="text.secondary">{dictionary['navigation'].Profile}</Typography>
            <Divider sx={{ mb: 2 }} />
            <ProfileDetail label={dictionary['navigation'].FirstName || "First Name"} value={data.firstName} />
            <ProfileDetail label={dictionary['navigation'].LastName || "Last Name"} value={data.lastName} />
            {/* <ProfileDetail label="Gender" value={data.gender} /> */}
            <ProfileDetail label={dictionary['navigation'].phoneNumber || "Phone Number"} value={data.phoneNumber} />
            <ProfileDetail label={dictionary['navigation'].Email || "Email"} value={data.email} />
          </Box>

          {/* Action Buttons */}
          <Box display="flex" justifyContent="center" gap={4} mt={6}>
            <Button
              variant="contained"
              onClick={toggleEditProfile}
              startIcon={<i className="tabler-edit" />}
              sx={{
                minWidth: 160,
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': { boxShadow: 6 },
              }}
            >
              {dictionary['navigation'].edit}
            </Button>
            <Button
              variant="contained"
              onClick={toggleEditPassword}
              startIcon={<i className="tabler-lock" />}
              sx={{
                minWidth: 160,
                padding: '10px 20px',
                fontSize: '16px',
                fontWeight: 600,
                boxShadow: 3,
                '&:hover': { boxShadow: 6 },
              }}
            >
              {dictionary['navigation'].EditPassword}
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Drawers */}
      <EditProfileDrawer
        open={editProfileOpen}
        profileData={data}
        dictionary={dictionary}
        setData={setData}
        handleClose={toggleEditProfile}
        zoneId={zoneId}
      />

      <EditPasswordDrawer
        open={editPasswordOpen}
        dictionary={dictionary}
        handleClose={toggleEditPassword}
        userId={data.id}
      />
    </>
  );
};

// Helper Component to display profile details
const ProfileDetail = ({ label, value }: { label: string; value: string }) => (
  <Box display="flex" justifyContent="space-between" sx={{ py: 1 }}>
    <Typography className="font-medium" color="text.primary" sx={{ fontWeight: 600 }}>
      {label}:
    </Typography>
    <Typography sx={{ color: 'text.secondary' }}>{value}</Typography>
  </Box>
);

export default UserDetails;
