/* eslint-disable react/prop-types */

// Enhanced Admin Card Component with modern design and hover effects
const AdminCard = ({ 
  children, 
  title, 
  icon,
  subtitle,
  action,
  className = "",
  hoverEffect = true,
  padding = "p-4 md:p-6",
  gradient = false,
}) => {
  return (
    <div 
      className={`
        ${gradient ? 'bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-transparent' : 'bg-gradient-to-br from-[#0f172a] to-[#1e293b]'}
        rounded-2xl shadow-lg border border-white/5 
        ${hoverEffect ? 'hover:shadow-2xl hover:border-blue-500/30 hover:-translate-y-1' : ''}
        transition-all duration-300 ease-in-out
        ${padding}
        ${className}
      `}
      style={hoverEffect ? {
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      } : {}}
    >
      {(title || action) && (
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                <span className="text-lg">{icon}</span>
              </div>
            )}
            <div>
              {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
            </div>
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </div>
  );
};

export default AdminCard;
