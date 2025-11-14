import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
  // FIX: Add optional onClick prop to make the card clickable.
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({ children, className = '', title, actions, onClick }) => {
  return (
    <div onClick={onClick} className={`bg-[#111111] rounded-lg border border-gray-800/80 p-6 transition-all duration-300 hover:border-green-500/50 hover:shadow-[0_0_15px_rgba(52,211,153,0.1)] ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
          {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default Card;
