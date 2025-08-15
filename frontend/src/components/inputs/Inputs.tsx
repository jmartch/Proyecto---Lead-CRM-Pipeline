import React from 'react';
import type { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import '../../utils/Input.css';

interface InputProps {
  id: string;
  label: string;
  type?: string;
  disabled?: boolean;
  register: UseFormRegister<FieldValues>;
  error: FieldErrors;
}

const Input: React.FC<InputProps> = ({
  id,
  label,
  type = "text",
  disabled,
  register,
  error
}) => {
  const hasError = !!error[id];

  return (
    <div className="input-wrapper">
      <label htmlFor={id} className="input-label">
        {label}
      </label>

      <input
        id={id}
        type={type}
        autoComplete={id}
        disabled={disabled}
        {...register(id, { required: true })}
        className={`input-field ${disabled ? 'input-disabled' : ''} ${hasError ? 'input-error' : ''}`}
      />

      {hasError && (
        <p className="input-error-message">Este campo es obligatorio</p>
      )}
    </div>
  );
};

export default Input;
