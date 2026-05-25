import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

export const authOptions: NextAuthOptions = {

  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }

        try {
          const res = await fetch(`${process.env.API_URL}/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          })

          const data = await res.json();



          if (res.status === 401) {
            throw new Error(JSON.stringify(data))
          }

          if (res.status === 200) {
            return data
          }

          return null
        } catch (e: any) {
          throw new Error(e.message)
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })

    // ** ...add more providers here
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // ** 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async jwt({ token, user }) {
      if (user) {
        token.name = user.name
        token.accessToken = token.accessToken;
      }

      return token
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async session({ session, token }) {

      if (session.user) {
        session.accessToken = token.accessToken; // include access token in session
      }

      return session
    }
  }
}
