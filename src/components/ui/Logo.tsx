// src/components/ui/Logo.tsx
const Logo = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="32"
    height="32"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 2.5a10 10 0 100 20 10 10 0 000-20zm-2.9 14.3l-3.4-3.4a.5.5 0 01.7-.7l3 3 7.1-7.2a.5.5 0 01.7.7l-7.5 7.6z"
      fill="#64FFDA"
    />
  </svg>
);

export default Logo;
