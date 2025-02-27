import React, { useState, InputHTMLAttributes, ReactNode } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

// Define types for the props of the InputField component
interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: ReactNode;
  type?: string;
  id: string;
  error?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputField: React.FC<InputFieldProps> = ({ label, type = "text", id, error, ...props }) => {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const isPassword = type === 'password';

  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          id={id}
          className={`w-full px-4 py-2.5 border rounded-xl
                    bg-white dark:bg-gray-800 
                    text-gray-900 dark:text-gray-100
                    border-gray-200 dark:border-gray-700
                    focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 
                    focus:border-transparent outline-none transition-all
                    ${error ? 'border-red-500 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'}
                    ${isPassword ? 'pr-12' : ''}
                    placeholder:text-gray-400 dark:placeholder:text-gray-500`}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 
                     dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
          >
            {showPassword ? (
              <FiEyeOff className="w-5 h-5" />
            ) : (
              <FiEye className="w-5 h-5" />
            )}
          </button>
        )}
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default InputField;
