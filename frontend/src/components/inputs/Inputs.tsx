import React from 'react';
import type {FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';

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
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={id}
        disabled={disabled}
        {...register(id, { required: true })}
        className={`form-input block w-full rounded-md border border-gray-300 shadow-sm py-2 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-sm
          ${disabled ? "bg-gray-100 cursor-not-allowed" : ""}
          ${error[id] ? "border-red-500 focus:ring-red-500" : ""}
        `}
      />
      {error[id] && (
        <p className="mt-1 text-xs text-red-500">Este campo es obligatorio</p>
      )}
    </div>
  );
};

export default Input;
