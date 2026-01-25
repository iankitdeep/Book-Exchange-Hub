import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const userRoleEnum = z.enum(["buyer", "seller", "admin"]);
export type UserRole = z.infer<typeof userRoleEnum>;

export const bookConditionEnum = z.enum(["like_new", "good", "fair", "poor"]);
export type BookCondition = z.infer<typeof bookConditionEnum>;

export const bookStatusEnum = z.enum(["active", "pending", "sold"]);
export type BookStatus = z.infer<typeof bookStatusEnum>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url"),
  role: text("role").notNull().default("buyer"),
  googleId: text("google_id").unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const books = pgTable("books", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  author: text("author").notNull(),
  description: text("description"),
  genre: text("genre").notNull(),
  condition: text("condition").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  coverImageUrl: text("cover_image_url"),
  sellerId: varchar("seller_id").notNull().references(() => users.id),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  senderId: varchar("sender_id").notNull().references(() => users.id),
  receiverId: varchar("receiver_id").notNull().references(() => users.id),
  bookId: varchar("book_id").references(() => books.id),
  content: text("content").notNull(),
  isRead: integer("is_read").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const conversations = pgTable("conversations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  adminId: varchar("admin_id").references(() => users.id),
  bookId: varchar("book_id").references(() => books.id),
  lastMessageAt: timestamp("last_message_at").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  displayName: true,
  avatarUrl: true,
  role: true,
  googleId: true,
});

export const insertBookSchema = createInsertSchema(books).pick({
  title: true,
  author: true,
  description: true,
  genre: true,
  condition: true,
  price: true,
  coverImageUrl: true,
  sellerId: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  senderId: true,
  receiverId: true,
  bookId: true,
  content: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertBook = z.infer<typeof insertBookSchema>;
export type Book = typeof books.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type Conversation = typeof conversations.$inferSelect;
