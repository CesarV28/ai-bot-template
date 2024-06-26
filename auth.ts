import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { authConfig } from './auth.config'
import { z } from 'zod'
import { getStringFromBuffer } from './lib/utils'
import { getUser } from './actions/auth.actions'
import { User } from './lib/types'

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            email: z.string().email(),
            password: z.string().min(6)
          })
          .safeParse(credentials)
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data
          // const user = await getUser(email)
          const user: User = {
            id: '4234552',
            email: 'CesarVargas27@outlook.com',
            password: '123456',
            salt: '34344534'
          }

          if (!user) return null

          // const encoder = new TextEncoder()
          // const saltedPassword = encoder.encode(password + user.salt)
          // const hashedPasswordBuffer = await crypto.subtle.digest(
          //   'SHA-256',
          //   saltedPassword
          // )
          // const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

          return user;
          // if (hashedPassword === user.password) {
          //   return user
          // } else {
          //   return null
          // }
        }

        return null
      }
    })
  ]
})
