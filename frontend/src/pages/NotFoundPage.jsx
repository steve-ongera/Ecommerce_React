import { Link } from 'react-router-dom';
import '../styles/not-found.css'; // Import the new CSS file

export default function NotFoundPage() {
  return (
    <div className="not-found-container">
      <div className="not-found-number">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-message">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="not-found-actions">
        <Link to="/" className="btn-primary not-found-btn--primary">
          <i className="bi bi-house"></i> Back to Home
        </Link>
        <Link to="/products" className="btn-outline not-found-btn--outline">
          <i className="bi bi-search"></i> Browse Products
        </Link>
      </div>
    </div>
  );
}