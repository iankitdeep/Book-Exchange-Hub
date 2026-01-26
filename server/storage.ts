import { randomUUID } from "crypto";

export type UserRole = "buyer" | "seller" | "admin";
export type BookCondition = "like_new" | "good" | "fair" | "poor";
export type BookStatus = "active" | "pending" | "sold";

export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  googleId?: string;
  createdAt: Date;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  description?: string;
  genre: string;
  condition: BookCondition;
  price: string;
  coverImageUrl?: string;
  sellerId: string;
  status: BookStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  bookId?: string;
  content: string;
  isRead: number;
  createdAt: Date;
}

export interface Conversation {
  id: string;
  userId: string;
  adminId?: string;
  bookId?: string;
  lastMessageAt: Date;
  createdAt: Date;
}

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  createUser(user: Omit<User, "id" | "createdAt">): Promise<User>;
  updateUserRole(userId: string, role: UserRole): Promise<User | undefined>;
  
  getBooks(): Promise<Book[]>;
  getBookById(id: string): Promise<Book | undefined>;
  getBooksBySeller(sellerId: string): Promise<Book[]>;
  createBook(book: Omit<Book, "id" | "createdAt" | "updatedAt" | "status">): Promise<Book>;
  updateBook(id: string, data: Partial<Book>): Promise<Book | undefined>;
  
  getConversations(userId: string): Promise<Conversation[]>;
  getAdminConversations(): Promise<Conversation[]>;
  getConversationById(id: string): Promise<Conversation | undefined>;
  createConversation(conv: Omit<Conversation, "id" | "createdAt" | "lastMessageAt">): Promise<Conversation>;
  
  getMessagesByConversation(conversationId: string): Promise<Message[]>;
  createMessage(msg: Omit<Message, "id" | "createdAt" | "isRead">): Promise<Message>;
  
  getAdminUser(): Promise<User | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private books: Map<string, Book>;
  private messages: Map<string, Message>;
  private conversations: Map<string, Conversation>;

  constructor() {
    this.users = new Map();
    this.books = new Map();
    this.messages = new Map();
    this.conversations = new Map();
    
    this.seedData();
  }

  private seedData() {
    const adminUser: User = {
      id: "admin-1",
      email: "admin@bookbazaar.com",
      displayName: "Swaply Admin",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    const sampleBooks: Omit<Book, "id" | "createdAt" | "updatedAt">[] = [
      {
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A classic American novel set in the Jazz Age.",
        genre: "fiction",
        condition: "good",
        price: "12.99",
        sellerId: "admin-1",
        status: "active",
      },
      {
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        description: "A powerful story of racial injustice and moral growth.",
        genre: "fiction",
        condition: "like_new",
        price: "15.50",
        sellerId: "admin-1",
        status: "active",
      },
      {
        title: "Sapiens: A Brief History",
        author: "Yuval Noah Harari",
        description: "An exploration of how Homo sapiens came to dominate Earth.",
        genre: "non-fiction",
        condition: "fair",
        price: "18.00",
        sellerId: "admin-1",
        status: "active",
      },
      {
        title: "Pride and Prejudice",
        author: "Jane Austen",
        description: "A romantic novel of manners set in Georgian England.",
        genre: "romance",
        condition: "good",
        price: "9.99",
        sellerId: "admin-1",
        status: "active",
      },
      {
        title: "Dune",
        author: "Frank Herbert",
        description: "A sci-fi epic set on the desert planet Arrakis.",
        genre: "sci-fi",
        condition: "like_new",
        price: "14.99",
        sellerId: "admin-1",
        status: "active",
      },
      {
        title: "The Da Vinci Code",
        author: "Dan Brown",
        description: "A mystery thriller involving a murder in the Louvre.",
        genre: "mystery",
        condition: "poor",
        price: "7.50",
        sellerId: "admin-1",
        status: "active",
      },
    ];

    sampleBooks.forEach((book) => {
      const id = randomUUID();
      this.books.set(id, {
        ...book,
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.googleId === googleId);
  }

  async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...userData,
      id,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserRole(userId: string, role: UserRole): Promise<User | undefined> {
    const user = this.users.get(userId);
    if (!user) return undefined;
    user.role = role;
    this.users.set(userId, user);
    return user;
  }

  async getBooks(): Promise<Book[]> {
    return Array.from(this.books.values()).filter((book) => book.status === "active");
  }

  async getBookById(id: string): Promise<Book | undefined> {
    return this.books.get(id);
  }

  async getBooksBySeller(sellerId: string): Promise<Book[]> {
    return Array.from(this.books.values()).filter((book) => book.sellerId === sellerId);
  }

  async createBook(bookData: Omit<Book, "id" | "createdAt" | "updatedAt" | "status">): Promise<Book> {
    const id = randomUUID();
    const book: Book = {
      ...bookData,
      id,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.books.set(id, book);
    return book;
  }

  async updateBook(id: string, data: Partial<Book>): Promise<Book | undefined> {
    const book = this.books.get(id);
    if (!book) return undefined;
    const updated = { ...book, ...data, updatedAt: new Date() };
    this.books.set(id, updated);
    return updated;
  }

  async getConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter((conv) => conv.userId === userId)
      .sort((a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime());
  }

  async getAdminConversations(): Promise<Conversation[]> {
    return Array.from(this.conversations.values()).sort(
      (a, b) => b.lastMessageAt.getTime() - a.lastMessageAt.getTime()
    );
  }

  async getConversationById(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(
    convData: Omit<Conversation, "id" | "createdAt" | "lastMessageAt">
  ): Promise<Conversation> {
    const id = randomUUID();
    const conversation: Conversation = {
      ...convData,
      id,
      createdAt: new Date(),
      lastMessageAt: new Date(),
    };
    this.conversations.set(id, conversation);
    return conversation;
  }

  async getMessagesByConversation(conversationId: string): Promise<Message[]> {
    const conv = this.conversations.get(conversationId);
    if (!conv) return [];
    
    return Array.from(this.messages.values())
      .filter(
        (msg) =>
          (msg.senderId === conv.userId && msg.receiverId === conv.adminId) ||
          (msg.senderId === conv.adminId && msg.receiverId === conv.userId)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createMessage(msgData: Omit<Message, "id" | "createdAt" | "isRead">): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      ...msgData,
      id,
      isRead: 0,
      createdAt: new Date(),
    };
    this.messages.set(id, message);
    
    const conversations = Array.from(this.conversations.values());
    for (const conv of conversations) {
      if (
        (msgData.senderId === conv.userId && msgData.receiverId === conv.adminId) ||
        (msgData.senderId === conv.adminId && msgData.receiverId === conv.userId)
      ) {
        conv.lastMessageAt = new Date();
        this.conversations.set(conv.id, conv);
        break;
      }
    }
    
    return message;
  }

  async getAdminUser(): Promise<User | undefined> {
    return Array.from(this.users.values()).find((user) => user.role === "admin");
  }
}

export const storage = new MemStorage();
