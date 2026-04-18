'use client';

import { useState } from 'react';

interface UserAvatarProps {
  fullName: string;
  avatar?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  className?: string;
}

const SIZE_CLASSES = {
  xs: { wrapper: 'w-5 h-5', text: 'text-[9px]' },
  sm: { wrapper: 'w-7 h-7', text: 'text-[11px]' },
  md: { wrapper: 'w-8 h-8', text: 'text-xs' },
  lg: { wrapper: 'w-10 h-10', text: 'text-sm' },
};

export default function UserAvatar({
  fullName,
  avatar,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const { wrapper, text } = SIZE_CLASSES[size];
  const initial = fullName.charAt(0).toUpperCase();

  return (
    <div className={`relative shrink-0 ${wrapper} ${className}`}>
      {/* Fallback initials */}
      <div
        className={`absolute inset-0 rounded-full bg-linear-to-br from-primary-container to-secondary-container flex items-center justify-center text-white font-sans font-bold ${text}`}
      >
        {initial}
      </div>

      {/* Avatar image — overlays the initials */}
      {avatar && !imgError && (
        <img
          src={avatar}
          alt={fullName}
          className="absolute inset-0 w-full h-full rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      )}
    </div>
  );
}
