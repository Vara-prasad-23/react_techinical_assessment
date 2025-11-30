import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import {
  getCart as getCartAPI,
  addToCart as addToCartAPI,
  updateCartItem as updateCartItemAPI,
  removeFromCart as removeFromCartAPI,
  clearCart as clearCartAPI,
} from '../services/api';

const CartContext = createContext(null);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load cart from API when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      // Use local storage for unauthenticated users
      const localCart = localStorage.getItem('cart');
      if (localCart) {
        try {
          setCartItems(JSON.parse(localCart));
        } catch (error) {
          console.error('Error loading local cart:', error);
        }
      }
    }
  }, [isAuthenticated]);

  const loadCart = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const response = await getCartAPI();
      setCartItems(response.data.data?.items || []);
    } catch (error) {
      console.error('Error loading cart:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        await addToCartAPI(product.id, quantity);
        await loadCart();
      } catch (error) {
        throw error;
      }
    } else {
      // Local storage for unauthenticated users
      const existingItem = cartItems.find(item => item.productId === product.id);
      let newCartItems;
      
      if (existingItem) {
        newCartItems = cartItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newCartItems = [
          ...cartItems,
          {
            productId: product.id,
            product: product,
            quantity,
          },
        ];
      }
      
      setCartItems(newCartItems);
      localStorage.setItem('cart', JSON.stringify(newCartItems));
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    if (isAuthenticated) {
      try {
        await updateCartItemAPI(productId, quantity);
        await loadCart();
      } catch (error) {
        throw error;
      }
    } else {
      const newCartItems = cartItems.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      );
      setCartItems(newCartItems);
      localStorage.setItem('cart', JSON.stringify(newCartItems));
    }
  };

  const removeItem = async (productId) => {
    if (isAuthenticated) {
      try {
        await removeFromCartAPI(productId);
        await loadCart();
      } catch (error) {
        throw error;
      }
    } else {
      const newCartItems = cartItems.filter(item => item.productId !== productId);
      setCartItems(newCartItems);
      localStorage.setItem('cart', JSON.stringify(newCartItems));
    }
  };

  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        await clearCartAPI();
        await loadCart();
      } catch (error) {
        throw error;
      }
    } else {
      setCartItems([]);
      localStorage.removeItem('cart');
    }
  };

  const getCartItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const price = item.product?.price || item.price || 0;
      return total + price * item.quantity;
    }, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        getCartItemCount,
        getCartTotal,
        loading,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

