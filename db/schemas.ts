import { sql } from "drizzle-orm";
import { text, integer, sqliteTable, primaryKey } from "drizzle-orm/sqlite-core";

export const users = sqliteTable('users', {
  id: text('id').unique().primaryKey(),
  email: text('email').unique().notNull(),
  password: text('password').notNull(),
  salt: text('salt').notNull(),
});

export const chats = sqliteTable('chats', {
  id: text('id').unique().primaryKey(),
  title: text('title').notNull(),
  path: text('path').notNull(),
  sharePath: text('sharePath'),
  messages: text('messages').notNull(),
  createdAt: text('created_at').notNull().default(sql`CURRENT_TIMESTAMP`),
  userId: text('userId').references(() => users.id),
});


export const userChats = sqliteTable('user_chats ', {
  userId: text('userId').references(() => users.id),
  chatId: text('chatId').references(() => chats.id),
  score: integer('score'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.userId, table.chatId] }),
    pkWithCustomName: primaryKey({ name: 'cpk_user_chats', columns: [table.userId, table.chatId] }),
  }
});



export type User = typeof users.$inferSelect 
export type Chat = typeof chats.$inferSelect 
export type UserChat = typeof userChats.$inferSelect 