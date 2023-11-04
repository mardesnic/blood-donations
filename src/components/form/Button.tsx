import React, { MouseEventHandler, ReactNode } from 'react';

interface Props {
  color?: 'standard' | 'danger' | 'primary';
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  onClick?: MouseEventHandler<HTMLButtonElement> | undefined;
  children?: ReactNode;
}

export const Button = ({
  type = 'button',
  disabled,
  onClick,
  children,
  color: variant = 'standard',
}: Props) => {
  const baseClasses =
    'text-white font-bold py-2 px-3 rounded focus:outline-none focus:shadow-outline shadow';
  const colorClasses = {
    primary: 'bg-blue-500 hover:bg-blue-600',
    danger: 'bg-red-500 hover:bg-red-600',
    standard: 'bg-gray-400 hover:bg-gray-500',
  };
  const disabledClasses = disabled ? 'opacity-40 cursor-not-allowed' : '';

  const className = `${baseClasses} ${colorClasses[variant]} ${disabledClasses}`;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={className}
    >
      <div className='flex items-center gap-2'>{children}</div>
    </button>
  );
};
