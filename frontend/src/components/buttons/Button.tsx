import React from 'react';
import '../../utils/Button.css';

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
      className={`btn ${fullWidth ? 'btn-full' : ''} ${disabled ? 'btn-disabled' : 'btn-active'}`}
    >
      {children}
    </button>
  );
};

export default Button;
