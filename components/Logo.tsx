import React from 'react';
import { UserRole } from '../types';
import { User as UserIcon } from 'lucide-react';

interface LogoProps {
  userRole: UserRole | null;
  className?: string;
}

const RoboticLeafLogo: React.FC<{className?: string}> = ({ className = "h-8 w-8 text-green-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c2.15 0 4.14-.68 5.8-1.85C15.99 18.68 12 15.21 12 12c0-3.21 3.99-6.68 5.8-8.15C16.14 2.68 14.15 2 12 2z" />
        <circle cx="14.5" cy="9.5" r="1" fill="#111111" />
        <circle cx="16.5" cy="12" r="1" fill="#111111" />
    </svg>
);

const Logo: React.FC<LogoProps> = ({ userRole, className }) => {
  if (userRole === UserRole.Citizen) {
    return <UserIcon className={className || "h-8 w-8 text-green-400"} />;
  }
  return <RoboticLeafLogo className={className} />;
};

export default Logo;
