import './ProductCard.css';

const ProductCard = ({ product }) => {
  // Get the first image from images array, or fall back to image property
  const getImageSrc = () => {
    if (product.images && product.images.length > 0) {
      return product.images[0];
    }
    return product.image;
  };

  const imageSrc = getImageSrc();
  const hasMultipleImages = product.images && product.images.length > 1;

  return (
    <div className="product-card">
      <div className="product-image">
        {imageSrc ? (
          <>
            <img src={imageSrc} alt={product.name} />
            {hasMultipleImages && (
              <div className="image-count-badge">
                {product.images.length} images
              </div>
            )}
          </>
        ) : (
          <div className="image-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        {product.rating && (
          <div className="product-rating">
            <span className="stars">{'★'.repeat(Math.floor(product.rating))}{'☆'.repeat(5 - Math.floor(product.rating))}</span>
            <span className="rating-value">({product.rating.toFixed(1)})</span>
            {product.reviewCount && (
              <span className="review-count">{product.reviewCount} reviews</span>
            )}
          </div>
        )}
        <p className="product-price">${product.price?.toFixed(2)}</p>
        {product.featured && (
          <span className="featured-badge">Featured</span>
        )}
        {product.description && (
          <p className="product-description">
            {product.description.length > 100
              ? `${product.description.substring(0, 100)}...`
              : product.description}
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;

