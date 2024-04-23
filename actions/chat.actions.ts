'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import { type Chat } from '@/lib/types'
import { db } from '@/db'
import { chats, users } from '@/db/schemas'
import { eq } from 'drizzle-orm'

export async function getChats(userId?: string | null) {
  if (!userId) {
    return []
  }

  try {

    const results = await db.select().from(chats).where(eq(chats.userId, userId));

    const chatsDb: Chat[] = results.map(chat => {
      return {
        ...chat,
        createdAt: new Date(chat.createdAt),
        messages: JSON.parse(chat?.messages || '')
      }
    })
    return chatsDb as Chat[]
  } catch (error) {
    return []
  }
}

export async function getChat(id: string = '', userId: string): Promise<Chat | null> {
  try {
    // const chat: Chat = {
    //   id: '',
    //   title: '',
    //   createdAt: new Date(),
    //   userId: '',
    //   path: '',
    //   messages: []
    // } // Here is the conetion string to db

    const chatDb = await db.select().from(chats).where(eq(chats.id, id));

    const chat: Chat = {
      id: chatDb[0]?.id,
      title: chatDb[0]?.title || '',
      createdAt: new Date(chatDb[0]?.createdAt),
      userId: userId,
      path: chatDb[0].path || '',
      messages: JSON.parse(chatDb[0].messages || '')
    }

    if (!chat || (userId && chat.userId !== userId)) {
      return null
    }

    return chat
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
  const chatDb = await db.select().from(chats).where(eq(chats.id, id));
  const uid = chatDb[0]?.userId;

  if (uid !== session?.user?.id) {
    return {
      error: 'Unauthorized'
    }
  }

  /**
   * TODO: Delete the chat
   */

  await db.delete(chats).where(eq(chats.id, id));

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

  const chatsId: string[] = (await getChats(session.user.id)).map(chat => chat.id);

  if (!chatsId.length) {
    return redirect('/')
  }


  for (const chatId of chatsId) {
    await db.delete(chats).where(eq(chats.id, chatId));
  }

  revalidatePath('/')
  return redirect('/')
}

export async function getSharedChat(id: string) {

  /**
   * TODO: Find a shared chat on db
   */

  const chatDb = await db.select().from(chats).where(eq(chats.id, id));
  console.log

  const chat: Chat = {
    id: chatDb[0]?.id,
    title: chatDb[0]?.title || '',
    createdAt: new Date(chatDb[0]?.createdAt),
    userId: chatDb[0]?.userId || '',
    path: chatDb[0].path || '',
    messages: JSON.parse(chatDb[0].messages || ''),
    sharePath: chatDb[0]?.sharePath || ''
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
  const chat = await getChat(id, session.user.id);

  if (!chat || chat?.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  if (!chat || chat?.userId !== session.user.id) {
    return {
      error: 'Something went wrong'
    }
  }

  const payload = {
    ...chat,
    messages: JSON.stringify(chat.messages),
    createdAt: JSON.stringify(chat.createdAt),
    sharePath: `/share/${chat.id}`
  }

  /**
   * TODO: Update the chat
   */
  // await kv.hmset(`chat:${chat.id}`, payload)

  await db.update(chats)
    .set(payload)
    .where(eq(chats.id, chat.id));

  return {
    ...payload,
    messages: chat.messages,
    createdAt: chat.createdAt,
  }
}

export async function saveChat(chat: Chat) {
  const session = await auth()

  if (session && session.user) {

    const existChat = await db.select().from(chats).where(eq(chats.id, chat.id));
    const saveChat = {
      ...chat,
      messages: JSON.stringify(chat.messages),
      createdAt: JSON.stringify(chat.createdAt)
    }

    if (existChat.length === 0) {
      await db.insert(chats).values(saveChat);
      return;
    }

    await db.update(chats)
      .set({ ...saveChat })
      .where(eq(chats.id, chat.id));


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
