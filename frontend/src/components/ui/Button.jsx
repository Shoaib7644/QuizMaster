import React from 'react';

const VARIANTS = {
    primary: 'bg-primary text-white hover:bg-primary-hover',
    secondary: 'bg-white text-primary border border-border hover:bg-slate-50',
    danger: 'bg-white text-danger border border-border hover:bg-red-50',
    ghost: 'text-text-secondary hover:text-text-primary hover:bg-slate-100',
};

const SIZES = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
};

const Button = ({
                    variant = 'primary',
                    size = 'md',
                    disabled = false,
                    type = 'button',
                    onClick,
                    className = '',
                    children,
                    ...rest
                }) => {
    return (
        <button
            type={type}
            disabled={disabled}
            onClick={onClick}
            className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-medium
        transition-colors duration-150 focus:outline-none focus-visible:ring-2
        focus-visible:ring-primary focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]} ${SIZES[size]} ${className}
      `}
            {...rest}
        >
            {children}
        </button>
    );
};

export default Button;