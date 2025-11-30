import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getCategories } from '../services/api';
import './Categories.css';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getCategories();
      setCategories(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load categories. Please try again.');
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="categories-container">
        <div className="loading-spinner">Loading categories...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="categories-container">
        <div className="error-container">
          <p>{error}</p>
          <button onClick={loadCategories} className="retry-button">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="categories-container">
      <div className="categories-header">
        <h1>Categories</h1>
        <p className="categories-count">{categories.length} categories available</p>
      </div>

      {categories.length === 0 ? (
        <div className="empty-state">
          <p>No categories found.</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className="category-card"
            >
              <div className="category-image">
                {category.image ? (
                  <img src={category.image} alt={category.name} />
                ) : (
                  <div className="image-placeholder">
                    <span>{category.name.charAt(0)}</span>
                  </div>
                )}
              </div>
              <div className="category-info">
                <h3>{category.name}</h3>
                {category.description && (
                  <p>{category.description}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Categories;

