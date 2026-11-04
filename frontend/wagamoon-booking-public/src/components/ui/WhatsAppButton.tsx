import React from 'react';

export interface WhatsAppButtonProps {
  url?: string;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fullWidth?: boolean;
  style?: React.CSSProperties;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  url = 'https://wa.me/919876543210?text=Hi%2C%20I%20would%20like%20to%20enquire%20about%20Wagamon%20Booking.',
  label = 'Enquire on WhatsApp',
  size = 'md',
  className = '',
  fullWidth = false,
  style,
}) => {
  const sizeClasses = {
    sm: 'btn-sm',
    md: '',
    lg: 'btn-lg',
  }[size];

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn btn-whatsapp ${sizeClasses} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        width: fullWidth ? '100%' : 'auto',
        ...style,
      }}
    >
      <svg
        viewBox="0 0 24 24"
        width="19"
        height="19"
        fill="currentColor"
        style={{ flexShrink: 0 }}
      >
        <path d="M12.031 2C6.495 2 2 6.493 2 12.027c0 1.956.564 3.784 1.542 5.334L2 22l4.814-1.508c1.479.88 3.197 1.385 5.217 1.385 5.536 0 10.031-4.493 10.031-10.027C22.062 6.493 17.567 2 12.031 2zm5.836 14.195c-.244.686-1.42 1.309-1.956 1.353-.518.042-1.193.187-3.91-1.01-3.266-1.439-5.326-4.783-5.488-5.002-.162-.218-1.32-1.758-1.32-3.353 0-1.595.835-2.38 1.13-2.697.294-.318.643-.398.857-.398.215 0 .429.002.617.011.198.01.463-.075.725.553.272.653.927 2.261 1.008 2.428.082.167.137.362.027.58-.11.218-.165.353-.327.545-.162.192-.342.428-.488.574-.162.162-.331.339-.142.664.189.325.84 1.387 1.802 2.245 1.238 1.103 2.282 1.444 2.607 1.607.325.163.515.136.705-.082.19-.218.814-.951 1.031-1.278.217-.327.434-.272.733-.163.299.109 1.898.895 2.224 1.058.326.163.543.245.625.381.082.136.082.789-.162 1.475z" />
      </svg>
      <span>{label}</span>
    </a>
  );
};
