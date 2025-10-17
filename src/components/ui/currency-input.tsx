'use client';

import { Input } from './input';
import { forwardRef } from 'react';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, ...props }, ref) => {
    const formatNumber = (num: number) => {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const parseNumber = (str: string) => {
      return parseInt(str.replace(/\./g, '')) || 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\./g, '');
      if (/^\d*$/.test(rawValue)) {
        onChange(parseInt(rawValue) || 0);
      }
    };

    return (
      <Input
        ref={ref}
        type="text"
        value={value ? formatNumber(value) : ''}
        onChange={handleChange}
        {...props}
      />
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };