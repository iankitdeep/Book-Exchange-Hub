import type { Express, Request, Response } from "express";
import { createServer, type Server } from "node:http";
import { storage, User, UserRole } from "./storage";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.SESSION_SECRET || "bookbazaar-secret-key";

interface AuthRequest extends Request {
  user?: User;
}

function generateToken(user: User): string {
  return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
}

function verifyToken(token: string): { userId: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
}

async function authMiddleware(req: AuthRequest, res: Response, next: () => void) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: "Invalid token" });
  }

  const user = await storage.getUser(decoded.userId);
  if (!user) {
    return res.status(401).json({ error: "User not found" });
  }

  req.user = user;
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { token } = req.body;
      
      const response = await fetch(
        `https://www.googleapis.com/oauth2/v3/userinfo`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        return res.status(401).json({ error: "Invalid Google token" });
      }

      const googleUser = await response.json();
      
      let user = await storage.getUserByGoogleId(googleUser.sub);
      
      if (!user) {
        user = await storage.getUserByEmail(googleUser.email);
        
        if (!user) {
          user = await storage.createUser({
            email: googleUser.email,
            displayName: googleUser.name || googleUser.email.split("@")[0],
            avatarUrl: googleUser.picture,
            googleId: googleUser.sub,
            role: "buyer",
          });
        } else {
          user = await storage.updateUserRole(user.id, user.role);
        }
      }

      const jwtToken = generateToken(user!);
      
      res.json({ user, token: jwtToken });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.get("/api/auth/me", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    res.json(user);
  });

  app.post("/api/auth/anonymous", async (req, res) => {
    try {
      const user = await storage.createUser({
        displayName: "New User",
        role: "buyer",
      });

      const jwtToken = generateToken(user);
      res.json({ user, token: jwtToken });
    } catch (error) {
      console.error("Anonymous auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.put("/api/auth/role", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { role } = req.body as { role: UserRole };
    
    if (!["buyer", "seller", "admin"].includes(role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    const user = await storage.updateUserRole(decoded.userId, role);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  app.put("/api/auth/profile", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const { displayName, phoneNumber, email } = req.body as { displayName?: string; phoneNumber?: string; email?: string };

    const user = await storage.updateUserProfile(decoded.userId, { displayName, phoneNumber, email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  });

  app.get("/api/books", async (req, res) => {
    try {
      const books = await storage.getBooks();
      const booksWithSeller = await Promise.all(
        books.map(async (book) => {
          const seller = await storage.getUser(book.sellerId);
          return {
            ...book,
            sellerName: seller?.displayName || "Unknown Seller",
          };
        })
      );
      res.json(booksWithSeller);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch books" });
    }
  });

  app.get("/api/books/my-listings", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const books = await storage.getBooksBySeller(decoded.userId);
      res.json(books);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch listings" });
    }
  });

  app.get("/api/books/:id", async (req, res) => {
    try {
      const book = await storage.getBookById(req.params.id);
      if (!book) {
        return res.status(404).json({ error: "Book not found" });
      }

      const seller = await storage.getUser(book.sellerId);
      
      res.json({
        ...book,
        sellerName: seller?.displayName || "Unknown Seller",
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch book" });
    }
  });

  app.post("/api/books", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const { title, author, description, genre, condition, price, coverImageUrl } = req.body;
      
      const book = await storage.createBook({
        title,
        author,
        description,
        genre,
        condition,
        price,
        coverImageUrl,
        sellerId: decoded.userId,
      });

      res.status(201).json(book);
    } catch (error) {
      res.status(500).json({ error: "Failed to create book" });
    }
  });

  app.get("/api/conversations", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const conversations = await storage.getConversations(decoded.userId);
      
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const messages = await storage.getMessagesByConversation(conv.id);
          const book = conv.bookId ? await storage.getBookById(conv.bookId) : null;
          const lastMessage = messages[messages.length - 1];
          
          return {
            id: conv.id,
            bookTitle: book?.title,
            bookCoverUrl: book?.coverImageUrl,
            lastMessage: lastMessage?.content || "No messages yet",
            timestamp: formatTimestamp(conv.lastMessageAt),
            unreadCount: messages.filter(
              (m) => m.receiverId === decoded.userId && !m.isRead
            ).length,
          };
        })
      );

      res.json(conversationsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/admin/conversations", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    const currentUser = await storage.getUser(decoded.userId);
    if (!currentUser || currentUser.role !== "admin") {
      return res.status(403).json({ error: "Admin access required" });
    }

    try {
      const conversations = await storage.getAdminConversations();
      
      const conversationsWithDetails = await Promise.all(
        conversations.map(async (conv) => {
          const user = await storage.getUser(conv.userId);
          const book = conv.bookId ? await storage.getBookById(conv.bookId) : null;
          const messages = await storage.getMessagesByConversation(conv.id);
          const lastMessage = messages[messages.length - 1];
          
          return {
            id: conv.id,
            userId: conv.userId,
            userName: user?.displayName || "Unknown User",
            userRole: user?.role || "buyer",
            bookId: conv.bookId,
            bookTitle: book?.title,
            lastMessage: lastMessage?.content || "No messages yet",
            timestamp: formatTimestamp(conv.lastMessageAt),
            unreadCount: messages.filter(
              (m) => m.receiverId === decoded.userId && !m.isRead
            ).length,
          };
        })
      );

      res.json(conversationsWithDetails);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch admin conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const messages = await storage.getMessagesByConversation(conversation.id);
      const book = conversation.bookId
        ? await storage.getBookById(conversation.bookId)
        : null;

      res.json({
        id: conversation.id,
        bookId: conversation.bookId,
        bookTitle: book?.title,
        bookCoverUrl: book?.coverImageUrl,
        messages: messages.map((m) => ({
          id: m.id,
          senderId: m.senderId,
          content: m.content,
          createdAt: m.createdAt.toISOString(),
          isRead: m.isRead,
        })),
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const { bookId, message } = req.body;
      const admin = await storage.getAdminUser();
      
      if (!admin) {
        return res.status(500).json({ error: "No admin available" });
      }

      const conversation = await storage.createConversation({
        userId: decoded.userId,
        adminId: admin.id,
        bookId,
      });

      await storage.createMessage({
        senderId: decoded.userId,
        receiverId: admin.id,
        bookId,
        content: message,
      });

      res.status(201).json(conversation);
    } catch (error) {
      res.status(500).json({ error: "Failed to create conversation" });
    }
  });

  app.post("/api/conversations/:id/messages", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const token = authHeader.substring(7);
    const decoded = verifyToken(token);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }

    try {
      const conversationId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const conversation = await storage.getConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({ error: "Conversation not found" });
      }

      const { content } = req.body;
      const currentUser = await storage.getUser(decoded.userId);
      
      const receiverId =
        currentUser?.role === "admin"
          ? conversation.userId
          : conversation.adminId;

      if (!receiverId) {
        return res.status(400).json({ error: "Invalid receiver" });
      }

      const message = await storage.createMessage({
        senderId: decoded.userId,
        receiverId,
        bookId: conversation.bookId,
        content,
      });

      res.status(201).json(message);
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.get("/api/purchases", async (req: AuthRequest, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    res.json([]);
  });

  const httpServer = createServer(app);
  return httpServer;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
}
