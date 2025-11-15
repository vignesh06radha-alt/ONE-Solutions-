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
    <div 
      onClick={onClick} 
      className={`bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 transition-all duration-500 hover:border-green-500/50 hover:shadow-[0_0_30px_rgba(52,211,153,0.2)] hover:scale-[1.01] transform ${onClick ? 'cursor-pointer' : ''} ${className}`}
      style={{
        animation: 'fadeInUp 0.6s ease-out forwards',
      }}
    >
      {(title || actions) && (
        <div className="flex items-center justify-between mb-4 border-b border-gray-700/50 pb-4 animate-slideDown">
          {title && <h3 className="text-lg font-bold text-gray-100 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{title}</h3>}
          {actions && <div className="flex items-center space-x-2">{actions}</div>}
        </div>
      )}
      <div className="animate-fadeIn">
        {children}
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(20px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes slideDown {
          from { 
            opacity: 0; 
            transform: translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default Card;
