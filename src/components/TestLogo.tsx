import { useEffect, useState } from "react";

export const TestLogo = () => {
  const [imageExists, setImageExists] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageExists(true);
      setError(null);
    };
    img.onerror = () => {
      setImageExists(false);
      setError("Failed to load image");
    };
    img.src = "/hikma.jpg";
  }, []);

  return (
    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
      <h3 className="font-bold text-lg mb-2">Logo Test</h3>
      <div className="flex items-center gap-4">
        <div>
          <p>Image path: /hikma.jpg</p>
          <p>Status: {imageExists === null ? "Checking..." : imageExists ? "✅ Loaded" : "❌ Failed"}</p>
          {error && <p className="text-red-500">Error: {error}</p>}
        </div>
        <img 
          src="/hikma.jpg" 
          alt="Test logo" 
          className="w-16 h-16 rounded border"
          onError={(e) => console.log("Image error:", e)}
        />
      </div>
    </div>
  );
};