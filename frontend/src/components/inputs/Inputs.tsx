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

  // Validaciones específicas por campo
  const getValidationRules = () => {
    const baseRules = { required: "Este campo es obligatorio" };
    
    switch (id) {
      case 'email':
        return {
          ...baseRules,
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Ingrese un email válido"
          }
        };
      case 'password':
        return {
          ...baseRules,
          minLength: {
            value: 6,
            message: "La contraseña debe tener al menos 6 caracteres"
          }
        };
      case 'name':
        return {
          ...baseRules,
          minLength: {
            value: 2,
            message: "El nombre debe tener al menos 2 caracteres"
          }
        };
      default:
        return baseRules;
    }
  };

  return (
    <div className="input-wrapper">
      <label htmlFor={id} className="input-label">
        {label}
      </label>

      <input
        id={id}
        type={type}
        autoComplete={id === 'name' ? 'given-name' : id}
        disabled={disabled}
        {...register(id, getValidationRules())}
        className={`input-field ${disabled ? 'input-disabled' : ''} ${hasError ? 'input-error' : ''}`}
        placeholder={`Ingrese su ${label.toLowerCase()}`}
      />

      {hasError && error[id] && (
        <p className="input-error-message">
          {error[id]?.message as string}
        </p>
      )}
    </div>
  );
};

export default Input;