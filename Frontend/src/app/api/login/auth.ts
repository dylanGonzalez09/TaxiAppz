// auth.config.ts or [...nextauth].ts
import CredentialProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import type { NextAuthOptions } from 'next-auth'

import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialProvider({
      name: 'Credentials',
      type: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials as { email: string; password: string }
        const apiBase = process.env.API_URL ?? process.env.BASE_URL

        try {
          const loginUrls: string[] = []

          if (apiBase) {
            const normalized = apiBase.replace(/\/+$/, '')

            loginUrls.push(
              normalized.endsWith('/v1/auth')
                ? `${normalized}/login`
                : normalized.endsWith('/v1')
                  ? `${normalized}/auth/login`
                  : `${normalized}/v1/auth/login`
            )
          }

          loginUrls.push(ENDPOINTS.auth.login)

          for (const loginUrl of loginUrls) {
            try {
              const res = await fetch(loginUrl, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
              })


              // Backend can return HTML for some error cases; parse JSON only if possible.
              let data: any = null

              try {
                data = await res.json()
              } catch {
                // non-json response; treat as unusable and try fallback endpoint
                if (!res.ok && res.status === 401) {
                  throw new Error('Invalid email or password')
                }

                continue
              }

              if (res.status === 401) {
                const message =
                  data?.message ||
                  data?.error ||
                  data?.data?.message ||
                  'Invalid email or password'

                throw new Error(message)
              }

              if (!res.ok) {
                continue
              }

              // Accept multiple shapes:
              // 1) { user, tokens: { access: { token } } }
              // 2) { data: { user, tokens } }
              // 3) { id, email, token, image }
              const payload = data?.data ?? data
              const rawUser = payload?.user ?? payload

              const accessToken =
                payload?.tokens?.access?.token ??
                payload?.access?.token ??
                payload?.token ??
                payload?.accessToken

              if (!accessToken) {
                // valid HTTP response but not auth payload; try next URL
                continue
              }

              return {
                id: String(rawUser?._id || rawUser?.id || ''),
                email: String(rawUser?.email || ''),
                name: String(rawUser?.firstName || rawUser?.name || rawUser?.email || ''),
                token: String(accessToken),
                image: {
                  clientId: String(rawUser?.clienId || rawUser?.clientId || payload?.image?.clientId || ''),
                  firstName: String(rawUser?.firstName || payload?.image?.firstName || ''),
                  phoneNumber: String(rawUser?.phoneNumber || payload?.image?.phoneNumber || ''),
                  role: String(rawUser?.roleIds?.[0]?.role || rawUser?.roles || payload?.image?.role || ''),
                  zoneId: String(rawUser?.zoneId || payload?.image?.zoneId || ''),
                },
              }
            } catch (err: any) {
              // preserve auth failure; otherwise continue trying next endpoint
              if ((err?.message || '').toLowerCase().includes('invalid email or password')) {
                throw err
              }
            }
          }

          throw new Error('Login succeeded but token payload is missing.')
        } catch (e: any) {
          throw new Error(e?.message || 'Login failed')
        }
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    })
  ],

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60 // 30 days
  },

  pages: {
    signIn: '/login'
  },

  callbacks: {
    jwt({ token, trigger, session, user }) {
      // Handle initial sign in
      if (user) {
        token.accessToken = user.token
        token.image = user.image
      }

      // Handle session updates
      if (trigger === "update" && session) {
        if (session.image?.zoneId) {
          // Ensure token.image exists before updating
          if (!token.image) {
            token.image = {
              clientId: '',
              firstName: '',
              phoneNumber: '',
              role: '',
              zoneId: ''
            }
          }

          token.image.zoneId = session.image.zoneId
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user && token.image) {
        session.accessToken = token.accessToken
        session.user.image = token.image
      }

      return session
    }
  }
}
