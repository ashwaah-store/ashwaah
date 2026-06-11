"use client";

import { useState, useEffect } from "react";

interface HoverImageCarouselProps {
  images: string[];
  defaultImage: string;
  alt: string;
  className?: string;
}

export default function HoverImageCarousel({
  images,
  defaultImage,
  alt,
  className = "",
}: HoverImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Fallback to defaultImage if images array is empty
  const allImages = images && images.length > 0 ? images : [defaultImage];

  useEffect(() => {
    if (!isHovered || allImages.length <= 1) {
      setIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % allImages.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isHovered, allImages]);

  return (
    <div
      className="relative w-full h-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {allImages.map((imgUrl, i) => (
        <img
          key={imgUrl + "-" + i}
          src={imgUrl || "/images/placeholder.png"}
          alt={alt}
          className={`${className} absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            i === index ? "opacity-100 z-10" : "opacity-0 z-0"
          }`}
          onError={(e) => {
            e.currentTarget.src = "/images/placeholder.png";
          }}
        />
      ))}

      {/* Progress Indicator Dots */}
      {isHovered && allImages.length > 1 && (
        <div className="absolute bottom-3 inset-x-0 z-20 flex justify-center space-x-1.5 pointer-events-none">
          {allImages.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === index ? "w-3 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
