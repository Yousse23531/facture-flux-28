import { useState } from "react";

interface LogoProps {
  className?: string;
}

export const Logo = ({ className = "" }: LogoProps) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className={`w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center shadow-md ${className}`}>
      {!imageError ? (
        <img 
          src="/hikma.jpg" 
          alt="HEKMA Logo" 
          className={`w-10 h-10 rounded-lg object-contain transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            console.error('Failed to load logo image');
            setImageError(true);
          }}
        />
      ) : (
        // Fallback when image fails to load
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center">
          <span className="text-blue-600 font-bold text-lg">H</span>
        </div>
      )}
    </div>
  );
};