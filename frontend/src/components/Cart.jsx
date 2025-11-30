import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/api';
import './Cart.css';

const Cart = () => {
  const { cartItems, updateQuantity, removeItem, getCartTotal, clearCart, loading } = useCart();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [checkingOut, setCheckingOut] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [shippingAddress, setShippingAddress] = useState({
    line1: user?.address?.line1 || '',
    city: user?.address?.city || '',
    state: user?.address?.state || '',
    postalCode: user?.address?.postalCode || '',
    country: user?.address?.country || 'USA',
  });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    try {
      setCheckingOut(true);
      const items = cartItems.map((item) => ({
        productId: item.productId || item.id,
        quantity: item.quantity,
      }));

      const response = await createOrder({
        items,
        shippingAddress,
        paymentMethod,
      });

      // Clear cart
      await clearCart();

      // Redirect to orders page
      navigate('/orders', { state: { orderId: response.data.data?.id } });
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="cart-container">
        <div className="cart-empty">
          <p>Please login to view your cart.</p>
          <Link to="/login" className="login-link">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="cart-container">
        <div className="loading-spinner">Loading cart...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="cart-container">
        <h1>Your Cart</h1>
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/products" className="shop-link">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1>Your Cart</h1>
      
      <div className="cart-items">
        {cartItems.map((item) => {
          const product = item.product || {};
          const price = product.price || item.price || 0;
          const subtotal = price * item.quantity;

          return (
            <div key={item.productId || item.id} className="cart-item">
              <div className="cart-item-image">
                {product.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="image-placeholder">No Image</div>
                )}
              </div>

              <div className="cart-item-info">
                <h3>{product.name || 'Product'}</h3>
                <p className="cart-item-price">${price.toFixed(2)} each</p>
              </div>

              <div className="cart-item-quantity">
                <label>Quantity:</label>
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => {
                    const qty = parseInt(e.target.value) || 1;
                    updateQuantity(item.productId || item.id, qty);
                  }}
                />
                <button
                  onClick={() => removeItem(item.productId || item.id)}
                  className="remove-button"
                >
                  Remove
                </button>
              </div>

              <div className="cart-item-subtotal">
                <strong>${subtotal.toFixed(2)}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-summary">
        <div className="cart-total">
          <strong>Total: ${getCartTotal().toFixed(2)}</strong>
        </div>
        <div className="cart-actions">
          <Link to="/products" className="continue-shopping">
            Continue Shopping
          </Link>
          <button
            onClick={() => setShowCheckoutForm(!showCheckoutForm)}
            className="checkout-button"
          >
            {showCheckoutForm ? 'Cancel' : 'Proceed to Checkout'}
          </button>
        </div>
      </div>

      {showCheckoutForm && (
        <div className="checkout-form-container">
          <h2>Checkout</h2>
          <form
            onSubmit={handleCheckout}
            className="checkout-form"
          >
            <div className="form-section">
              <h3>Shipping Address</h3>
              <div className="form-group">
                <label>Street Address</label>
                <input
                  type="text"
                  value={shippingAddress.line1}
                  onChange={(e) =>
                    setShippingAddress({ ...shippingAddress, line1: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, city: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input
                    type="text"
                    value={shippingAddress.state}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, state: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Postal Code</label>
                  <input
                    type="text"
                    value={shippingAddress.postalCode}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, postalCode: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    value={shippingAddress.country}
                    onChange={(e) =>
                      setShippingAddress({ ...shippingAddress, country: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Payment Method</h3>
              <div className="form-group">
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  required
                >
                  <option value="credit_card">Credit Card</option>
                  <option value="debit_card">Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="bank_transfer">Bank Transfer</option>
                </select>
              </div>
            </div>

            <div className="checkout-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Tax (8%):</span>
                <span>${(getCartTotal() * 0.08).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping:</span>
                <span>$15.99</span>
              </div>
              <div className="summary-row total">
                <span>Total:</span>
                <span>${(getCartTotal() * 1.08 + 15.99).toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={checkingOut}
              className="place-order-button"
            >
              {checkingOut ? 'Processing...' : 'Place Order'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Cart;

