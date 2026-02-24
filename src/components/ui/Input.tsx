import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div>
        {label && <label className="block font-semibold mb-2">{label}</label>}
        <input
          className={`w-full p-3 rounded-md bg-bg-input border border-border-default focus:border-brand-primary focus:ring-brand-primary ${className}`}
          ref={ref}
          {...props}
        />
        {error && <p className="text-sm text-text-error mt-1">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
