import React from 'react';
import clsx from 'clsx';

interface ButtonProps {
  type?: "button" | "submit" | "reset";
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  type = "button",
  fullWidth,
  children,
  onClick,
  disabled
}) => {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={clsx(
        "flex justify-center rounded-md px-3 py-2 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        fullWidth && "w-full",
        disabled
          ? "bg-gray-300 text-gray-500 cursor-not-allowed"
          : "bg-indigo-500 text-white hover:bg-indigo-600 focus-visible:outline-indigo-600"
      )}
    >
      {children}
    </button>
  );
};

export default Button;
