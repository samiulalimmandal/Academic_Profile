import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

interface SafeImageProps {
  src?: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
  loading?: 'lazy' | 'eager';
}

export const SafeImage: React.FC<SafeImageProps> = ({
  src,
  alt,
  className = '',
  fallbackLabel,
  loading = 'lazy',
}) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    const initials = (fallbackLabel || alt)
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join('');

    return (
      <div
        className={`flex flex-col items-center justify-center bg-[#F2EFE9] text-[#57534E] dark:bg-[#192130] dark:text-[#94A3B8] ${className}`}
        role="img"
        aria-label={alt}
      >
        {initials ? (
          <span className="font-serif text-2xl font-semibold tracking-tight">
            {initials}
          </span>
        ) : (
          <ImageIcon className="h-6 w-6 opacity-60" aria-hidden="true" />
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading={loading}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
