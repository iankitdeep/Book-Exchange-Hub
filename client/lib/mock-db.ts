import { BookCondition } from "@/screens/ListBookScreen";

export interface Book {
    id: string;
    title: string;
    author: string;
    description: string;
    genre: string;
    condition: BookCondition;
    price: string;
    coverImageUrl?: string;
    sellerId: string;
    sellerName: string;
    sellerPhoneNumber?: string;
    createdAt: string;
}

// Initial mock data
const initialBooks: Book[] = [
    {
        id: "1",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        description: "A classic novel of the Jazz Age.",
        genre: "fiction",
        condition: "good",
        price: "450",
        coverImageUrl: "https://covers.openlibrary.org/b/id/7222246-L.jpg",
        sellerId: "user_2",
        sellerName: "Jane Doe",
        createdAt: new Date().toISOString(),
    },
    {
        id: "2",
        title: "Sapiens",
        author: "Yuval Noah Harari",
        description: "A brief history of humankind.",
        genre: "non-fiction",
        condition: "like_new",
        price: "800",
        coverImageUrl: "https://covers.openlibrary.org/b/id/8259443-L.jpg",
        sellerId: "user_3",
        sellerName: "John Smith",
        createdAt: new Date().toISOString(),
    },
    {
        id: "3",
        title: "Atomic Habits",
        author: "James Clear",
        description: "An easy & proven way to build good habits & break bad ones.",
        genre: "self-help",
        condition: "like_new",
        price: "600",
        coverImageUrl: "https://covers.openlibrary.org/b/id/10515783-L.jpg",
        sellerId: "user_4",
        sellerName: "Alice Wonderland",
        createdAt: new Date().toISOString(),
    },
];

let books: Book[] = [...initialBooks];

export const mockDb = {
    getBooks: async (): Promise<Book[]> => {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        return [...books]; // Return copy
    },

    addBook: async (book: Omit<Book, "id" | "createdAt" | "sellerName"> & { sellerName?: string }): Promise<Book> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const newBook: Book = {
            ...book,
            id: "book_" + Date.now(),
            createdAt: new Date().toISOString(),
            sellerName: book.sellerName || "Current User", // Fallback
        };
        books.unshift(newBook); // Add to beginning
        return newBook;
    },

    getBookById: async (id: string): Promise<Book | undefined> => {
        await new Promise((resolve) => setTimeout(resolve, 200));
        return books.find((b) => b.id === id);
    }
};
