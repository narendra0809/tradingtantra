/* eslint-disable react/prop-types */
import { FaSpinner } from "react-icons/fa";

// Enhanced Button Component with modern design, animations, and loading state
const AdminButton = ({ 
  children, 
  onClick, 
  variant = "primary", // primary, secondary, danger, success, outline, ghost
  size = "md", // sm, md, lg
  icon,
  disabled = false,
  loading = false,
  className = "",
  type = "button",
  fullWidth = false,
}) => {
  const baseStyles = "inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden";
   
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  };
  
  const variantStyles = {
    primary: "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white shadow-lg shadow-gray-500/25 hover:shadow-gray-500/40 hover:scale-[1.02] active:scale-[0.98]",
    danger: "bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:scale-[1.02] active:scale-[0.98]",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 hover:scale-[1.02] active:scale-[0.98]",
    warning: "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-[1.02] active:scale-[0.98]",
    outline: "border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white shadow-sm hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
    ghost: "text-gray-400 hover:text-white hover:bg-white/10",
    glass: "bg-white/5 border border-white/10 text-white hover:bg-white/10 hover:border-white/20 backdrop-blur-sm"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${baseStyles}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {/* Loading spinner */}
      {loading && (
        <FaSpinner className="animate-spin" />
      )}
      
      {/* Icon (not spinning when loading) */}
      {!loading && icon && <span>{icon}</span>}
      
      {/* Children/Text */}
      <span className={loading ? "opacity-70" : ""}>
        {children}
      </span>
      
      {/* Ripple effect overlay */}
      <span className="absolute inset-0 bg-white/20 opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />
    </button>
  );
};

export default AdminButton;
