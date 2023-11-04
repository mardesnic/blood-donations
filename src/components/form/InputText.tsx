import React, { ChangeEvent } from 'react';

interface Props {
  name?: string;
  value?: string;
  placeholder?: string;
  type?: 'email' | 'text' | 'password';
  disabled?: boolean;
  autoFocus?: boolean;
  required?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}

export const InputText = ({
  name,
  type,
  onChange,
  value,
  placeholder,
  autoFocus,
  disabled,
  required,
}: Props) => {
  return (
    <input
      placeholder={placeholder}
      name={name}
      type={type}
      onChange={onChange}
      value={value}
      autoFocus={autoFocus}
      required={required}
      disabled={disabled}
      className='shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 focus:outline-none focus:shadow-outline'
    />
  );
};
