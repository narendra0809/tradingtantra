/* eslint-disable react/prop-types */

// Reusable Status Badge Component for consistent status display
const StatusBadge = ({ 
  status,
  type = "status", // status, payment, user, custom
  size = "md", // sm, md, lg
  pulse = false,
}) => {
  // Status type configurations
  const statusConfig = {
    // General status
    active: { label: "Active", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    inactive: { label: "Inactive", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
    pending: { label: "Pending", bg: "bg-yellow-500/20", text: "text-yellow-400", border: "border-yellow-500/30" },
    processing: { label: "Processing", bg: "bg-blue-500/20", text: "text-blue-400", border: "border-blue-500/30" },
    completed: { label: "Completed", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    cancelled: { label: "Cancelled", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    rejected: { label: "Rejected", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    failed: { label: "Failed", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    
    // Payment status
    paid: { label: "Paid", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    unpaid: { label: "Unpaid", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    refunded: { label: "Refunded", bg: "bg-purple-500/20", text: "text-purple-400", border: "border-purple-500/30" },
    verified: { label: "Verified", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    
    // User status
    premium: { label: "Premium", bg: "bg-gradient-to-r from-amber-500/20 to-orange-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    free: { label: "Free", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
    subscribed: { label: "Subscribed", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    expired: { label: "Expired", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    
    // Custom
    yes: { label: "Yes", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    no: { label: "No", bg: "bg-red-500/20", text: "text-red-400", border: "border-red-500/30" },
    enabled: { label: "Enabled", bg: "bg-green-500/20", text: "text-green-400", border: "border-green-500/30" },
    disabled: { label: "Disabled", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" },
  };

  // Get config based on status
  const config = statusConfig[status?.toLowerCase()] || { 
    label: status, 
    bg: "bg-blue-500/20", 
    text: "text-blue-400", 
    border: "border-blue-500/30" 
  };

  const sizeStyles = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-xs",
    lg: "px-3 py-1.5 text-sm"
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 rounded-full font-medium
        ${config.bg} ${config.text} ${config.border}
        border ${sizeStyles[size]}
        transition-all duration-200 hover:scale-105
      `}
    >
      {pulse && (
        <span className={`w-1.5 h-1.5 rounded-full ${config.text.replace('text-', 'bg-')} animate-pulse`} />
      )}
      {config.label}
    </span>
  );
};

export default StatusBadge;
