import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  showCharCount?: boolean;
  maxLength?: number;
}

export const Textarea: React.FC<TextareaProps> = ({
  label,
  error,
  showCharCount = false,
  maxLength,
  value,
  onChange,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;
  const charCount = value?.toString().length || 0;

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-1">
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            {label}
          </label>
          {showCharCount && maxLength && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {charCount}/{maxLength}
            </span>
          )}
        </div>
      )}
      <textarea
        id={inputId}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        className={`
          w-full px-4 py-2 rounded-lg border
          ${error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-gray-900 dark:border-gray-600 dark:focus:ring-white'}
          bg-white dark:bg-gray-800
          text-gray-900 dark:text-white
          placeholder-gray-400 dark:placeholder-gray-500
          focus:outline-none focus:ring-2 focus:border-transparent
          transition-all resize-none
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
};
