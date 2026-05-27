// types/next-auth.d.ts
import 'next-auth/jwt'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name: string
      image: {
        clientId: string
        firstName: string
        phoneNumber: string
        role: string
        zoneId: string
      }
    }
    accessToken?: string
  }

  interface User {
    id: string
    name: string
    email: string
    image: {
      clientId: string
      firstName: string
      phoneNumber: string
      role: string
      zoneId: string
    }
    token: string
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    idToken?: string
    accessToken?: string
    user?: {
      id: string
      name: string
      email: string
    }
    image?: {
      clientId: string
      firstName: string
      phoneNumber: string
      role: string
      zoneId: string
    }
  }
}