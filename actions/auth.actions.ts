'use server'

import { signIn } from '@/auth'
import { User } from '@/lib/types'
import { AuthError } from 'next-auth'
import { z } from 'zod'
import { ResultCode, getStringFromBuffer } from '@/lib/utils'
import { createNewUser, getUserByEmail } from './user.actions'

export async function createUser(
    email: string,
    hashedPassword: string,
    salt: string
) {
    try {
        const existingUser = await getUserByEmail(email)

        if (existingUser) {
            return {
                type: 'error',
                resultCode: ResultCode.UserAlreadyExists
            }
        } else {
            const user = {
                id: crypto.randomUUID(),
                email,
                password: hashedPassword,
                salt
            }

            console.log(user)

            await createNewUser(user);

            return {
                type: 'success',
                resultCode: ResultCode.UserCreated
            }
        }
    } catch (error) {
        console.log(error);
        return {
            type: 'error',
            resultCode: ResultCode.UnknownError
        }
    }
}

interface Result {
    type: string
    resultCode: ResultCode
}

export async function signup(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const parsedCredentials = z
        .object({
            email: z.string().email(),
            password: z.string().min(6)
        })
        .safeParse({
            email,
            password
        })

    if (parsedCredentials.success) {
        const salt = crypto.randomUUID()

        const encoder = new TextEncoder()
        const saltedPassword = encoder.encode(password + salt)
        const hashedPasswordBuffer = await crypto.subtle.digest(
            'SHA-256',
            saltedPassword
        )
        const hashedPassword = getStringFromBuffer(hashedPasswordBuffer)

        try {
            const result = await createUser(email, hashedPassword, salt)

            if (result.resultCode === ResultCode.UserCreated) {
                await signIn('credentials', {
                    email,
                    password,
                    redirect: false
                })
            }

            return result
        } catch (error) {
            if (error instanceof AuthError) {
                switch (error.type) {
                    case 'CredentialsSignin':
                        return {
                            type: 'error',
                            resultCode: ResultCode.InvalidCredentials
                        }
                    default:
                        return {
                            type: 'error',
                            resultCode: ResultCode.UnknownError
                        }
                }
            } else {
                return {
                    type: 'error',
                    resultCode: ResultCode.UnknownError
                }
            }
        }
    } else {
        return {
            type: 'error',
            resultCode: ResultCode.InvalidCredentials
        }
    }
}




interface Result {
    type: string
    resultCode: ResultCode
}

export async function authenticate(
    _prevState: Result | undefined,
    formData: FormData
): Promise<Result | undefined> {
    try {
        const email = formData.get('email')
        const password = formData.get('password')

        const parsedCredentials = z
            .object({
                email: z.string().email(),
                password: z.string().min(6)
            })
            .safeParse({
                email,
                password
            })

        if (parsedCredentials.success) {
            await signIn('credentials', {
                email,
                password,
                redirect: false
            })

            return {
                type: 'success',
                resultCode: ResultCode.UserLoggedIn
            }
        } else {
            return {
                type: 'error',
                resultCode: ResultCode.InvalidCredentials
            }
        }
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return {
                        type: 'error',
                        resultCode: ResultCode.InvalidCredentials
                    }
                default:
                    return {
                        type: 'error',
                        resultCode: ResultCode.UnknownError
                    }
            }
        }
    }
}
