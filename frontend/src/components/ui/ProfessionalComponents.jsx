// Professional UI Components for Yatra360
import React from 'react';
import './ProfessionalComponents.css';

// ===== BUTTON COMPONENTS =====
export const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  icon, 
  loading = false, 
  disabled = false,
  children, 
  onClick,
  ...props 
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  
  return (
    <button
      className={`${baseClass} ${variantClass} ${sizeClass} ${disabled ? 'btn-disabled' : ''}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <span className="spinner"></span>}
      {icon && !loading && <span className="btn-icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

// ===== CARD COMPONENTS =====
export const Card = ({ className = '', hover = true, children, ...props }) => (
  <div className={`card ${hover ? 'card-hover' : ''} ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ className = '', children, ...props }) => (
  <div className={`card-header ${className}`} {...props}>
    {children}
  </div>
);

export const CardBody = ({ className = '', children, ...props }) => (
  <div className={`card-body ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className = '', children, ...props }) => (
  <div className={`card-footer ${className}`} {...props}>
    {children}
  </div>
);

// ===== INPUT COMPONENTS =====
export const Input = ({ 
  label, 
  error, 
  icon, 
  className = '', 
  ...props 
}) => (
  <div className="input-group">
    {label && <label className="label">{label}</label>}
    <div className="input-wrapper">
      {icon && <span className="input-icon">{icon}</span>}
      <input 
        className={`input ${icon ? 'input-with-icon' : ''} ${error ? 'input-error' : ''} ${className}`}
        {...props}
      />
    </div>
    {error && <span className="input-error-text">{error}</span>}
  </div>
);

export const Select = ({ 
  label, 
  error, 
  options = [], 
  className = '', 
  ...props 
}) => (
  <div className="input-group">
    {label && <label className="label">{label}</label>}
    <select 
      className={`input select ${error ? 'input-error' : ''} ${className}`}
      {...props}
    >
      {options.map((option, index) => (
        <option key={index} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="input-error-text">{error}</span>}
  </div>
);

export const Textarea = ({ 
  label, 
  error, 
  className = '', 
  ...props 
}) => (
  <div className="input-group">
    {label && <label className="label">{label}</label>}
    <textarea 
      className={`input textarea ${error ? 'input-error' : ''} ${className}`}
      {...props}
    />
    {error && <span className="input-error-text">{error}</span>}
  </div>
);

// ===== MODAL COMPONENTS =====
export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  size = 'md',
  children 
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className={`modal modal-${size}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

// ===== BADGE COMPONENTS =====
export const Badge = ({ 
  variant = 'primary', 
  size = 'md',
  children, 
  className = '' 
}) => (
  <span className={`badge badge-${variant} badge-${size} ${className}`}>
    {children}
  </span>
);

// ===== LOADING COMPONENTS =====
export const Skeleton = ({ className = '', width, height }) => (
  <div 
    className={`skeleton ${className}`}
    style={{ width, height }}
  />
);

export const LoadingSpinner = ({ size = 'md', className = '' }) => (
  <div className={`spinner spinner-${size} ${className}`} />
);

export const LoadingCard = () => (
  <Card>
    <CardBody>
      <Skeleton height="20px" className="mb-4" />
      <Skeleton height="16px" className="mb-2" />
      <Skeleton height="16px" width="60%" />
    </CardBody>
  </Card>
);

// ===== ALERT COMPONENTS =====
export const Alert = ({ 
  type = 'info', 
  title, 
  children, 
  onClose,
  className = '' 
}) => (
  <div className={`alert alert-${type} ${className}`}>
    <div className="alert-content">
      {title && <h4 className="alert-title">{title}</h4>}
      <div className="alert-message">{children}</div>
    </div>
    {onClose && (
      <button className="alert-close" onClick={onClose}>
        ×
      </button>
    )}
  </div>
);

// ===== AVATAR COMPONENTS =====
export const Avatar = ({ 
  src, 
  alt, 
  size = 'md', 
  fallback,
  className = '' 
}) => (
  <div className={`avatar avatar-${size} ${className}`}>
    {src ? (
      <img src={src} alt={alt} className="avatar-image" />
    ) : (
      <div className="avatar-fallback">
        {fallback || alt?.charAt(0)?.toUpperCase() || '?'}
      </div>
    )}
  </div>
);

// ===== TOOLTIP COMPONENT =====
export const Tooltip = ({ content, children, position = 'top' }) => (
  <div className="tooltip-wrapper">
    {children}
    <div className={`tooltip tooltip-${position}`}>
      {content}
    </div>
  </div>
);

// ===== PROGRESS COMPONENTS =====
export const ProgressBar = ({ 
  value, 
  max = 100, 
  color = 'primary',
  showLabel = true,
  className = '' 
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`progress-container ${className}`}>
      <div className="progress-bar">
        <div 
          className={`progress-fill progress-${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <span className="progress-label">{Math.round(percentage)}%</span>
      )}
    </div>
  );
};

// ===== TABS COMPONENT =====
export const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => (
  <div className={`tabs ${className}`}>
    <div className="tabs-list">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  </div>
);

// ===== EMPTY STATE COMPONENT =====
export const EmptyState = ({ 
  icon, 
  title, 
  description, 
  action,
  className = '' 
}) => (
  <div className={`empty-state ${className}`}>
    {icon && <div className="empty-state-icon">{icon}</div>}
    <h3 className="empty-state-title">{title}</h3>
    {description && <p className="empty-state-description">{description}</p>}
    {action && <div className="empty-state-action">{action}</div>}
  </div>
);

// ===== SEARCH COMPONENT =====
export const SearchInput = ({ 
  placeholder = "Search...", 
  onSearch, 
  className = '',
  ...props 
}) => {
  const [query, setQuery] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form onSubmit={handleSubmit} className={`search-form ${className}`}>
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        icon="🔍"
        {...props}
      />
    </form>
  );
};

// ===== STATS CARD COMPONENT =====
export const StatsCard = ({ 
  title, 
  value, 
  icon, 
  trend, 
  color = 'primary',
  className = '' 
}) => (
  <Card className={`stats-card stats-${color} ${className}`}>
    <CardBody>
      <div className="stats-header">
        <div className="stats-icon">{icon}</div>
        {trend && (
          <div className={`stats-trend ${trend.type}`}>
            {trend.value}
          </div>
        )}
      </div>
      <div className="stats-content">
        <h3 className="stats-value">{value}</h3>
        <p className="stats-title">{title}</p>
      </div>
    </CardBody>
  </Card>
);

export default {
  Button,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Input,
  Select,
  Textarea,
  Modal,
  Badge,
  Skeleton,
  LoadingSpinner,
  LoadingCard,
  Alert,
  Avatar,
  Tooltip,
  ProgressBar,
  Tabs,
  EmptyState,
  SearchInput,
  StatsCard
};
