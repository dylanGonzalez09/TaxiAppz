import { useRouter } from 'next/router';

import { signOut } from 'next-auth/react';

import { clearPrivilegeCache } from '@/utils/privillage'



// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const useRedirect = () => {
  const router = useRouter();

  const redirectToLogin = async () => {
    localStorage.removeItem('isDemoUser') 
    await clearPrivilegeCache();
    await signOut({ callbackUrl: process.env.NEXT_PUBLIC_APP_URL });
    router.push('/login'); // Adjust the path as needed
  };

  return { redirectToLogin };
};
