import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, getReviews, createReview } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Review form state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  
  const { addToCart } = useCart();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    loadProduct();
    loadReviews();
    setSelectedImageIndex(0); // Reset to first image when product changes
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getProduct(id);
      setProduct(response.data.data?.product || response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load product. Please try again.');
      console.error('Error loading product:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    try {
      const response = await getReviews({ productId: id });
      setReviews(response.data.data || []);
    } catch (err) {
      console.error('Error loading reviews:', err);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/products/${id}` } } });
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(product, quantity);
      alert(`Added ${quantity} ${product.name} to cart!`);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      setSubmittingReview(true);
      await createReview({
        productId: id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      
      // Reset form
      setReviewRating(5);
      setReviewTitle('');
      setReviewComment('');
      setShowReviewForm(false);
      
      // Reload reviews and product
      await loadReviews();
      await loadProduct();
      
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  const hasUserReviewed = reviews.some(r => r.userId === user?.id);

  if (loading) {
    return (
      <div className="product-detail-container">
        <div className="loading-spinner">Loading product...</div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-container">
        <div className="error-container">
          <p>{error || 'Product not found'}</p>
          <button onClick={() => navigate('/products')} className="back-button">
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="product-detail-container">
      <button onClick={() => navigate('/products')} className="back-button">
        ← Back to Products
      </button>

      <div className="product-detail">
        <div className="product-image-section">
          {(() => {
            // Get images array or fall back to single image
            const images = product.images && product.images.length > 0 
              ? product.images 
              : product.image 
                ? [product.image] 
                : [];
            
            const mainImage = images[selectedImageIndex] || images[0];
            
            return (
              <>
                <div className="product-image-placeholder">
                  {mainImage ? (
                    <img src={mainImage} alt={product.name} />
                  ) : (
                    <div className="image-placeholder">
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                
                {images.length > 1 && (
                  <div className="product-image-thumbnails">
                    {images.map((img, index) => (
                      <div
                        key={index}
                        className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
                        onClick={() => setSelectedImageIndex(index)}
                      >
                        <img src={img} alt={`${product.name} ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </>
            );
          })()}
        </div>

        <div className="product-info-section">
          <h1>{product.name}</h1>
          
          {product.rating && (
            <div className="product-rating-section">
              <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
              <span className="rating-value">({product.rating.toFixed(1)})</span>
              {product.reviewCount && (
                <span className="review-count">Based on {product.reviewCount} reviews</span>
              )}
            </div>
          )}
          
          <p className="product-price">${product.price?.toFixed(2)}</p>
          
          {product.description && (
            <div className="product-description">
              <h3>Description</h3>
              <p>{product.description}</p>
            </div>
          )}

          {product.category && (
            <div className="product-category">
              <strong>Category:</strong> {product.category.name || product.category}
            </div>
          )}

          {product.stock !== undefined && (
            <div className="product-stock">
              <strong>Stock:</strong> {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
            </div>
          )}

          <div className="product-actions">
            <div className="quantity-selector">
              <label htmlFor="quantity">Quantity:</label>
              <input
                type="number"
                id="quantity"
                min="1"
                max={product.stock || 99}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                disabled={addingToCart}
              />
            </div>

            <button
              onClick={handleAddToCart}
              disabled={addingToCart || (product.stock !== undefined && product.stock === 0)}
              className="add-to-cart-button"
            >
              {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Reviews ({reviews.length})</h2>
          {isAuthenticated && !hasUserReviewed && (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="write-review-button"
            >
              {showReviewForm ? 'Cancel' : 'Write a Review'}
            </button>
          )}
        </div>

        {showReviewForm && (
          <form onSubmit={handleSubmitReview} className="review-form">
            <div className="form-group">
              <label>Rating:</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(parseInt(e.target.value))}
                required
              >
                <option value={5}>5 - Excellent</option>
                <option value={4}>4 - Very Good</option>
                <option value={3}>3 - Good</option>
                <option value={2}>2 - Fair</option>
                <option value={1}>1 - Poor</option>
              </select>
            </div>
            <div className="form-group">
              <label>Title:</label>
              <input
                type="text"
                value={reviewTitle}
                onChange={(e) => setReviewTitle(e.target.value)}
                required
                placeholder="Review title"
              />
            </div>
            <div className="form-group">
              <label>Comment:</label>
              <textarea
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                required
                rows={4}
                placeholder="Write your review..."
              />
            </div>
            <button type="submit" disabled={submittingReview} className="submit-review-button">
              {submittingReview ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}

        {reviews.length === 0 ? (
          <div className="no-reviews">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-item">
                <div className="review-header">
                  <div className="review-rating">
                    <span className="stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                    {review.verifiedPurchase && (
                      <span className="verified-badge">Verified Purchase</span>
                    )}
                  </div>
                  <div className="review-meta">
                    <strong>{review.user?.firstName || review.user?.email || 'Anonymous'}</strong>
                    <span className="review-date">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {review.title && <h4 className="review-title">{review.title}</h4>}
                <p className="review-comment">{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
