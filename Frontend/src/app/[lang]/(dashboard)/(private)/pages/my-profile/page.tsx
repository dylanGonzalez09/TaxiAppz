// MUI Imports

import { getServerSession } from 'next-auth/next';  

import { getDictionary } from '@/utils/getDictionary';



import { authOptions } from '@/app/api/login/auth';

import type { Locale } from '@/configs/i18n';

// Views
import UserProfile from '@views/pages/user-profile/index';
import { post } from '@/app/api/apps/taxi/apiService';
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';

const Profile = async ({ params }: { params: { lang: Locale } }) => {
  const [session, dictionary] = await Promise.all([
    getServerSession(authOptions), 
    getDictionary(params.lang),
  ]);

  // Log session data to check
  const token = session?.user?.name; // or session?.user?.id, depending on your setup

  const data = await post(ENDPOINTS.profile.list, { token: token });

  return <UserProfile dictionary={dictionary} data={data.data} />;
};

export default Profile;
