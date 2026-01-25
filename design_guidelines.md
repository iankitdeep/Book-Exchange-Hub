# Book Marketplace Mobile App - Design Guidelines

## Brand Identity

**Purpose**: A secure marketplace for buying and selling used books with admin-mediated transactions, ensuring trust and safety.

**Aesthetic Direction**: Editorial/Literary - Clean typographic hierarchy, curated feel, sophisticated yet approachable. Think independent bookstore meets modern marketplace.

**Memorable Element**: Book spine color blocks as visual accents throughout the app, creating a library shelf aesthetic that's instantly recognizable.

## Navigation Architecture

**Root Navigation**: Tab Navigation (4 tabs with floating action button for core action)

**Tabs**:
1. Browse (Home) - Search and discover books
2. My Books - User's listings (Seller) or purchases (Buyer)
3. Messages - Communication with admin
4. Profile - Account settings and role management

**Core Action**: Floating Action Button (FAB) - "List Book" (visible only for Sellers)

## Screen Specifications

### 1. Authentication Flow (Stack-Only)
**Welcome Screen**
- Header: None (full-screen)
- Layout: Vertically centered content with welcome illustration at top
- Components: App logo, tagline, "Sign in with Google" button
- Safe Area: top: insets.top + Spacing.xl, bottom: insets.bottom + Spacing.xl

**Role Selection Screen** (post-authentication, first-time users)
- Header: Default navigation, title "Choose Your Role"
- Layout: Scrollable form
- Components: Radio buttons for Buyer/Seller/Admin (Admin requires approval code), Continue button below form
- Safe Area: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

### 2. Browse Screen (Home Tab)
- Header: Custom transparent header with search bar, filter button (right)
- Layout: Scrollable list
- Components: 
  - Search bar (sticky)
  - Filter chips (Genre, Condition, Price Range)
  - Book cards in grid (2 columns) showing cover, title, author, price, condition badge
- Empty State: "No books match your search" with search tips illustration
- Safe Area: top: headerHeight + Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Book Detail Screen** (Modal)
- Header: Default navigation with close button (left), share button (right)
- Layout: Scrollable
- Components: Book cover, title, author, description, condition, price, seller rating, "Contact Admin to Buy" button (floating at bottom)
- Safe Area: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

### 3. My Books Screen (Tab)
**For Sellers:**
- Header: Default navigation, title "My Listings", add button (right)
- Layout: Scrollable list
- Components: Book cards with status badges (Active/Sold/Pending), edit/delete actions
- Empty State: "List your first book" illustration with CTA
- Safe Area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

**For Buyers:**
- Header: Default navigation, title "My Purchases"
- Layout: Scrollable list
- Components: Purchase history cards with order status
- Empty State: "No purchases yet" illustration
- Safe Area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

**List Book Screen** (Modal from FAB)
- Header: Default navigation, "Cancel" (left), "Post" (right)
- Layout: Scrollable form
- Components: Photo upload, title, author, ISBN scanner, genre picker, condition dropdown, price input, description textarea
- Safe Area: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

### 4. Messages Screen (Tab)
- Header: Default navigation, title "Admin Messages"
- Layout: List of conversations
- Components: Message thread cards showing last message, book thumbnail, unread badge
- Empty State: "No messages yet" illustration
- Safe Area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

**Chat Screen** (Stack)
- Header: Default navigation with book thumbnail and title
- Layout: Chat interface
- Components: Message bubbles (user vs admin), input field with send button, attachment option
- Safe Area: top: Spacing.xl, bottom: insets.bottom + Spacing.xl

### 5. Profile Screen (Tab)
- Header: Default navigation, title "Profile"
- Layout: Scrollable
- Components:
  - User avatar (editable), display name, role badge
  - Stats section (books listed/bought, rating)
  - Settings list: Notifications, Privacy, Terms, Delete Account (nested)
  - Log Out button (destructive style)
- Safe Area: top: Spacing.xl, bottom: tabBarHeight + Spacing.xl

## Color Palette

- **Primary**: #8B4513 (Rich Saddle Brown - evokes leather-bound books)
- **Primary Light**: #C19A6B (Tan for subtle accents)
- **Background**: #FFFEF9 (Warm off-white, like aged paper)
- **Surface**: #FFFFFF
- **Text Primary**: #2C1810 (Deep brown, high contrast)
- **Text Secondary**: #6B5C56
- **Accent**: #D4762E (Warm terracotta for CTA buttons)
- **Success**: #4A7C59 (Muted green)
- **Error**: #C44536
- **Border**: #E8DCD0 (Soft beige)

## Typography

**Primary Font**: Literata (Google Font) - Serif for headings
**Secondary Font**: Inter (Google Font) - Sans-serif for body text

**Type Scale**:
- Display: Literata Bold, 32px
- H1: Literata Bold, 24px
- H2: Literata SemiBold, 20px
- H3: Inter SemiBold, 18px
- Body: Inter Regular, 16px
- Caption: Inter Regular, 14px
- Label: Inter Medium, 12px (uppercase)

## Visual Design

- Use Feather icons from @expo/vector-icons
- FAB shadow: shadowOffset {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
- Book cards: subtle border, no shadow
- Touchable feedback: subtle background color change
- Condition badges: pill-shaped with border (Like New: green, Good: blue, Fair: orange, Poor: gray)

## Assets to Generate

1. **icon.png** - App icon: Stack of books with bookmark
2. **splash-icon.png** - Launch screen: Simplified book icon
3. **welcome-books.png** - Welcome screen: Cozy reading nook illustration
4. **empty-browse.png** - Browse screen: Open book with magnifying glass
5. **empty-listings.png** - Seller's My Books: Empty shelf illustration
6. **empty-purchases.png** - Buyer's My Books: Empty shopping bag with book
7. **empty-messages.png** - Messages screen: Envelope with admin badge
8. **avatar-buyer.png** - Default buyer avatar: Reader icon
9. **avatar-seller.png** - Default seller avatar: Bookseller icon
10. **avatar-admin.png** - Admin avatar: Shield with book icon

**Asset Style**: Simple line illustrations with warm brown tones, minimal detail, book-themed motifs.