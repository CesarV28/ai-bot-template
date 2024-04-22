'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {

    const results: Chat[] = [] // Conection DB

    return results as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string, userId: string): Promise<Chat | null> {
  try {
    const chat: Chat = {
      id: '',
      title: '',
      createdAt: new Date(),
      userId: '',
      path: '',
      messages: []
    } // Here is the conetion string to db

    if (!chat || (userId && chat.userId !== userId)) {
      return null
    }

    return null
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function removeChat({ id, path }: { id: string; path: string }) {
  const session = await auth()

  if (!session) {
    return {
      error: 'Unauthorized'
    }
  }

  //Convert uid to string for consistent comparison with session.user.id
  // const uid = String(await kv.hget(`chat:${id}`, 'userId'))
  const uid = ''

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  /**
   * TODO: Delete the chat
   */

  revalidatePath('/')
  return revalidatePath(path)
}

export async function clearChats() {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  /**
   * TODO: Search all chats
   */
  const chats: string[] = [];

  if (!chats.length) {
    return redirect('/')
  }


  for (const chat of chats) {
    /**
     * TODO: Delete all chats
     */
  }

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {

  /**
   * TODO: Find a shared chat on db
   */
  const chat: Chat = {
    id: '',
    title: '',
    createdAt: new Date(),
    userId: '',
    path: '',
    messages: []
  } 

  if (!chat || !chat.sharePath) {
    return null
  }

  return chat
}

export async function shareChat(id: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }
  /**
   * TODO: Find a shared chat on db
   */
  const chat: Chat = {
    id: '',
    title: '',
    createdAt: new Date(),
    userId: '',
    path: '',
    messages: []
  } 

  if (!chat || chat.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    sharePath: `/share/${chat.id}`
  }

  /**
   * TODO: Update the chat
   */
  // await kv.hmset(`chat:${chat.id}`, payload)

  return payload
}

export async function saveChat(chat: Chat) {
  const session = await auth()
 
  if (session && session.user) {
    // const pipeline = kv.pipeline()
    // pipeline.hmset(`chat:${chat.id}`, chat)
    // pipeline.zadd(`user:chat:${chat.userId}`, {
    //   score: Date.now(),
    //   member: `chat:${chat.id}`
    // })
    // await pipeline.exec()
  } else {
    return
  }
}

export async function refreshHistory(path: string) {
  redirect(path)
}

export async function getMissingKeys() {
  const keysRequired = ['OPENAI_API_KEY']
  return keysRequired
    .map(key => (process.env[key] ? '' : key))
    .filter(key => key !== '')
}
