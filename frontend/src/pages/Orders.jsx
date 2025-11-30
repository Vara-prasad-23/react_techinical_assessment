import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      loadOrders();
    }
  }, [isAuthenticated]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getOrders();
      setOrders(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders. Please try again.');
      console.error('Error loading orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      processing: '#17a2b8',
      shipped: '#007bff',
      delivered: '#28a745',
      cancelled: '#dc3545',
    };
    return colors[status] || '#666';
  };

  if (!isAuthenticated) {
    return (
      <div className="orders-container">
        <div className="orders-empty">
          <p>Please login to view your orders.</p>
          <Link to="/login" className="login-link">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders-container">
        <div className="loading-spinner">Loading orders...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadOrders} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>Order History</h1>

      {orders.length === 0 ? (
        <div className="orders-empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="shop-link">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <div>
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
                <div className="order-status" style={{ backgroundColor: getStatusColor(order.status) + '20', color: getStatusColor(order.status) }}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </div>
              </div>

              <div className="order-items">
                {order.items?.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="order-item-info">
                      <Link to={`/products/${item.productId}`} className="order-item-name">
                        {item.name || `Product ${item.productId}`}
                      </Link>
                      <p className="order-item-details">
                        Quantity: {item.quantity} × ${item.price?.toFixed(2) || '0.00'}
                      </p>
                    </div>
                    <div className="order-item-total">
                      ${((item.quantity || 1) * (item.price || 0)).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="order-summary">
                <div className="order-summary-row">
                  <span>Subtotal:</span>
                  <span>${order.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {order.tax && (
                  <div className="order-summary-row">
                    <span>Tax:</span>
                    <span>${order.tax.toFixed(2)}</span>
                  </div>
                )}
                {order.shipping && (
                  <div className="order-summary-row">
                    <span>Shipping:</span>
                    <span>${order.shipping.toFixed(2)}</span>
                  </div>
                )}
                <div className="order-summary-row total">
                  <span>Total:</span>
                  <span>${order.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>

              {order.shippingAddress && (
                <div className="order-shipping">
                  <strong>Shipping Address:</strong>
                  <p>
                    {order.shippingAddress.line1}<br />
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;

