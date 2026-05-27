// MUI Imports

import { getServerSession } from 'next-auth/next';  

import { getDictionary } from '@/utils/getDictionary';



import { authOptions } from '@/app/api/login/auth';

import type { Locale } from '@/configs/i18n';

// Views
import UserProfile from '@views/pages/user-profile/index';
import { post } from '@/app/api/apps/taxi/apiService';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

const Profile = async ({ params }: { params: { lang: Locale,zoneId:any } }) => {
  const [session, dictionary] = await Promise.all([
    getServerSession(authOptions), 
    getDictionary(params.lang),
  ]);

  // Log session data to check
  const token = session?.accessToken; // or session?.user?.id, depending on your setup
  const email = session?.user?.email; 

  const data = await post(ENDPOINTS.profile.list, { token: token,email:email });

  return <UserProfile dictionary={dictionary} data={data.data} zoneId={params.zoneId} />;
};

export default Profile;
