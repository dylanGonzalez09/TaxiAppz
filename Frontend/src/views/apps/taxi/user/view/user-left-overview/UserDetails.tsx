'use client'
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';

import { BASE_IMAGE_URL } from '@/app/api/apps/taxi/endpoint'
import { useIsDemoUser } from '@/utils/demoUser';
import CustomAvatar from '@core/components/mui/Avatar';

// Define the type for user data
interface UserData {
  id: string;
  tripsCount: number;
  rating: number;
  active: boolean;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleIds: string[];
  avatar: string | null;
  profilePic: string | null;
}



// Define props for UserDetails
interface UserDetailsProps {
  userData: UserData;
  dictionary: any;
}

const UserDetails: React.FC<UserDetailsProps> = ({ userData,dictionary }) => {
  const { checkDemoStatus } = useIsDemoUser();

  const isDemo = checkDemoStatus();

  const maskedPhone =
    isDemo && userData?.phoneNumber.length > 5
      ? userData?.phoneNumber.slice(0, userData?.phoneNumber.length - 5) + '*****'
      : userData?.phoneNumber;

  const maskedEmail =
    isDemo && userData?.email?.length > 5
      ? '*****' + userData?.email.slice(5)
      : userData?.email;

  return (
    <Card>
      <CardContent className="flex flex-col pbs-12 gap-6">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center flex-col gap-4">
            <div className="flex flex-col items-center gap-4">
             <CustomAvatar
                      alt="user-profile"
                      src={
                        userData?.avatar
                          ? `${BASE_IMAGE_URL}${userData.avatar}`
                          : '/images/avatars/1.png'
                      }
                      variant="circular"
                      size={120}
                    />
              <Typography variant="h5">{`${userData?.firstName} `}</Typography>
            </div>
            {userData?.email && (
              <Chip
                label={maskedEmail}
                color="secondary"
                size="small"
                variant="tonal"
              />
            )}
          </div>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <CustomAvatar variant="rounded" color="primary" skin="light">
                <i className="tabler-checkbox" />
              </CustomAvatar>
             <div>
                <Typography variant="h6">{userData.rating}</Typography>
                <Typography>{dictionary['navigation'].Rating}</Typography>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CustomAvatar variant="rounded" color="primary" skin="light">
                <i className="tabler-briefcase" />
              </CustomAvatar>
              <div>
                <Typography variant="h6">{userData?.tripsCount}</Typography>
                <Typography>{dictionary['navigation'].Trip}</Typography>
              </div>
            </div>
          </div>
        </div>

        <Divider className="mlb-4" />
        <div className="flex flex-col gap-2">
          <div className="flex items-center flex-wrap gap-x-1.5">
            <Typography className="font-medium" color="text.primary">
              {dictionary['navigation'].Username}:
            </Typography>
            <Typography>{`${userData?.firstName} `}</Typography>
          </div>

          <div className="flex items-center flex-wrap gap-x-1.5">
            <Typography className="font-medium" color="text.primary">
              {dictionary['navigation'].Status}:
            </Typography>
            <Typography color="text.primary">
              {userData?.active ? dictionary['navigation'].active || 'Active' : dictionary['navigation'].inactive || 'Inactive'}
            </Typography>
          </div>

          <div className="flex items-center flex-wrap gap-x-1.5">
            <Typography className="font-medium" color="text.primary">
              {dictionary['navigation'].Contact}:
            </Typography>
            <Typography color="text.primary">{maskedPhone}</Typography>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
