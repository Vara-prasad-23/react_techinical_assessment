# Marketplace Frontend

A React application for the Marketplace Backend API built with Vite, React Router, and Context API.

## Features

 **Authentication**
- Login with JWT token storage
- Protected routes
- User session management

**Products**
- Browse all products
- View product details
- Product images and descriptions

 **Shopping Cart**
- Add items to cart
- Update quantities
- Remove items
- View cart total

 **UI/UX**
- Responsive design
- Loading states
- Error handling
- Clean, modern interface

## Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Build for production:**
   ```bash
   npm run build
   ```

## Configuration

Make sure the backend API is running on `http://localhost:3000` (or update the API_URL in `src/services/api.js`).

## Test Credentials

- Email: `john.doe@example.com`
- Password: `password123`

## Project Structure

```
src/
├── components/        # Reusable components
│   ├── Cart.jsx
│   ├── Navbar.jsx
│   ├── ProductCard.jsx
│   └── ProtectedRoute.jsx
├── context/          # React Context providers
│   ├── AuthContext.jsx
│   └── CartContext.jsx
├── pages/            # Page components
│   ├── Login.jsx
│   ├── Products.jsx
│   └── ProductDetail.jsx
├── services/         # API service layer
│   └── api.js
├── App.jsx           # Main app component
├── main.jsx          # Entry point
└── index.css         # Global styles
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Routing
- **Axios** - HTTP client
- **Context API** - State management

