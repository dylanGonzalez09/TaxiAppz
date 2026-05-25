import type { DefaultSession } from 'next-auth';
import 'next-auth/jwt';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image: {
        clientId: string;
        companyId: string;
        firstName : string;
        phoneNumber : string;
        role: string;

      };
    } & DefaultSession['user'];
    accessToken?: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string;
    accessToken?: string;
    user?: {
      id: string;
      name: string;
      email: string;
    };
  }
}
