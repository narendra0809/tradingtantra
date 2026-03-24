/* eslint-disable react/prop-types */
import { useState } from "react";

// Reusable Input Component with modern design
const AdminInput = ({ 
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  error,
  icon,
  required = false,
  className = "",
  ...props
}) => {
  return (
    <div className={`w-full ${className} relative`}>
      {label && (
        <label className="block text-sm text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] 
            text-white rounded-xl outline-none transition-all duration-300
            border border-white/10 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20
            ${icon ? 'pl-10' : 'pl-4'}
            py-3 pr-4
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}
            hover:border-white/20
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// Textarea Component for longer content
const AdminTextarea = ({ 
  label,
  value,
  onChange,
  placeholder,
  name,
  error,
  icon,
  required = false,
  className = "",
  rows = 4,
  ...props
}) => {
  return (
    <div className={`w-full ${className} relative`}>
      {label && (
        <label className="block text-sm text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-3 text-gray-500 z-10">
            {icon}
          </div>
        )}
        <textarea
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`
            w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] 
            text-white rounded-xl outline-none transition-all duration-300
            border border-white/10 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20
            ${icon ? 'pl-10' : 'pl-4'}
            py-3 pr-4
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}
            hover:border-white/20 resize-none
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// Input with Copy Button
const AdminInputWithCopy = ({ 
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  name,
  error,
  icon,
  required = false,
  className = "",
  ...props
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (value) {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  return (
    <div className={`w-full ${className} relative`}>
      {label && (
        <label className="block text-sm text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
            {icon}
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value || ""}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] 
            text-white rounded-xl outline-none transition-all duration-300
            border border-white/10 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20
            ${icon ? 'pl-10' : 'pl-4'}
            py-3 pr-16
            ${error ? 'border-red-500 focus:border-red-500 focus:shadow-red-500/20' : ''}
            hover:border-white/20
          `}
          {...props}
        />
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
          <span className="w-1 h-1 bg-red-400 rounded-full"></span>
          {error}
        </p>
      )}
    </div>
  );
};

// Search Input Component with search icon
const AdminSearchInput = ({ 
  value,
  onChange,
  placeholder = "Search...",
  icon,
  className = "",
  ...props
}) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10">
        {icon || (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
      </div>
      <input
        type="text"
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-gradient-to-r from-[#0f172a] to-[#1e293b] text-white rounded-xl outline-none transition-all duration-300 border border-white/10 focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 pl-10 pr-4 py-3 text-sm"
        {...props}
      />
    </div>
  );
};

export default AdminInput;
export { AdminSearchInput, AdminTextarea, AdminInputWithCopy };
