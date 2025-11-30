/**
 * Reusable button component with multiple variants.
 * @module components/ui/Button
 */

import React from 'react';

/**
 * Button component props.
 */
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Visual variant of the button */
  variant?: 'primary' | 'secondary' | 'danger';
  /** Whether the button is in loading state */
  isLoading?: boolean;
}

/**
 * A styled button component with support for multiple variants and loading state.
 * 
 * @param props.variant - Visual style variant ('primary' | 'secondary' | 'danger'). Defaults to 'primary'.
 * @param props.isLoading - When true, shows a loading spinner and disables interaction.
 * @param props.children - Button content.
 * @param props.className - Additional CSS classes to apply.
 * 
 * @example
 * <Button variant="primary" onClick={handleSubmit}>
 *   Submit
 * </Button>
 * 
 * @example
 * <Button variant="secondary" isLoading={true}>
 *   Processing...
 * </Button>
 */
export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-6 py-2.5 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";
  
  const variants = {
    primary: "bg-[hsl(var(--primary))] hover:bg-[hsl(var(--primary-hover))] text-white shadow-[0px_1px_0px_rgba(255,255,255,0.2)_inset,0px_-1px_0px_rgba(0,0,0,0.2)_inset,0px_4px_12px_rgba(0,0,0,0.4)]",
    secondary: "bg-[hsl(var(--surface-3))] hover:bg-[hsl(var(--surface-2))] text-[hsl(var(--text-main))] border border-[hsl(var(--surface-1))]",
    danger: "bg-red-900/50 hover:bg-red-900/70 text-red-200 border border-red-900",
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
};
