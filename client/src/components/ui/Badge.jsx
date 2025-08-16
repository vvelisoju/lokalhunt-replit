const Badge = ({ 
  children, 
  variant = "default", 
  size = "sm", 
  className = "" 
}) => {
  const variants = {
    default: "bg-gray-100 text-gray-800",
    primary: "bg-blue-100 text-blue-800",
    secondary: "bg-gray-100 text-gray-800",
    success: "bg-green-100 text-green-800",
    warning: "bg-yellow-100 text-yellow-800",
    error: "bg-red-100 text-red-800",
    info: "bg-blue-100 text-blue-800"
  };

  const sizes = {
    xs: "px-1.5 py-0.5 text-xs",
    sm: "px-2.5 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-sm"
  };

  return (
    <span
      className={`
        inline-flex items-center rounded-full font-medium
        ${variants[variant] || variants.default}
        ${sizes[size] || sizes.sm}
        ${className}
      `}
    >
      {children}
    </span>
  );
};

export default Badge;