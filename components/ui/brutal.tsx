import React, { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes, HTMLAttributes } from 'react';

// ============================================================================
// BRUTAL BUTTON
// ============================================================================

type BrutalButtonVariant = 'primary' | 'secondary' | 'accent';

interface BrutalButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BrutalButtonVariant;
  children: React.ReactNode;
}

const variantStyles: Record<BrutalButtonVariant, string> = {
  primary: 'bg-white text-black border-black hover:bg-black hover:text-white',
  secondary: 'bg-transparent text-black border-black hover:bg-black hover:text-white',
  accent: 'bg-green-500 text-black border-black hover:bg-black hover:text-green-500 hover:border-green-500',
};

export const BrutalButton = forwardRef<HTMLButtonElement, BrutalButtonProps>(
  ({ variant = 'primary', className = '', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          border-4
          px-8
          py-4
          font-bold
          uppercase
          tracking-widest
          transition-all
          duration-150
          active:translate-y-1
          disabled:opacity-50
          disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

BrutalButton.displayName = 'BrutalButton';

// ============================================================================
// BRUTAL INPUT
// ============================================================================

interface BrutalInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const BrutalInput = forwardRef<HTMLInputElement, BrutalInputProps>(
  ({ className = '', error = false, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`
          w-full
          border-4
          ${error ? 'border-red-500' : 'border-black'}
          bg-white
          px-4
          py-3
          font-mono
          text-black
          placeholder:text-gray-400
          focus:outline-none
          focus:ring-0
          focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
          transition-shadow
          duration-150
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      />
    );
  }
);

BrutalInput.displayName = 'BrutalInput';

// ============================================================================
// BRUTAL CARD
// ============================================================================

interface BrutalCardProps extends HTMLAttributes<HTMLDivElement> {
  asciiCorners?: boolean;
  children: React.ReactNode;
}

export const BrutalCard = forwardRef<HTMLDivElement, BrutalCardProps>(
  ({ asciiCorners = false, className = '', children, ...props }, ref) => {
    if (asciiCorners) {
      return (
        <div
          ref={ref}
          className={`relative font-mono ${className}`}
          {...props}
        >
          {/* ASCII corner decorations */}
          <span className="absolute -top-1 -left-1 text-black select-none" aria-hidden="true">
            +--
          </span>
          <span className="absolute -top-1 -right-1 text-black select-none" aria-hidden="true">
            --+
          </span>
          <span className="absolute -bottom-1 -left-1 text-black select-none" aria-hidden="true">
            +--
          </span>
          <span className="absolute -bottom-1 -right-1 text-black select-none" aria-hidden="true">
            --+
          </span>

          <div className="border-4 border-black bg-white p-6">
            {children}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={`
          border-4
          border-black
          bg-white
          p-6
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

BrutalCard.displayName = 'BrutalCard';

// ============================================================================
// BRUTAL BADGE
// ============================================================================

type BrutalBadgeVariant = 'default' | 'success' | 'warning' | 'error';

interface BrutalBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BrutalBadgeVariant;
  children: React.ReactNode;
}

const badgeVariantStyles: Record<BrutalBadgeVariant, string> = {
  default: 'bg-white text-black border-black',
  success: 'bg-green-500 text-black border-black',
  warning: 'bg-yellow-400 text-black border-black',
  error: 'bg-red-500 text-white border-black',
};

export const BrutalBadge = forwardRef<HTMLSpanElement, BrutalBadgeProps>(
  ({ variant = 'default', className = '', children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={`
          inline-block
          border-2
          px-2
          py-0.5
          font-mono
          text-xs
          font-bold
          uppercase
          tracking-wider
          ${badgeVariantStyles[variant]}
          ${className}
        `.replace(/\s+/g, ' ').trim()}
        {...props}
      >
        {children}
      </span>
    );
  }
);

BrutalBadge.displayName = 'BrutalBadge';
