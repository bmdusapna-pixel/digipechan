"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";

const sliderImages = [
  "/imageslider/imageslider1.jpg",
  "/imageslider/imageslider2.jpg",
  "/imageslider/imageslider3.jpg",
  "/imageslider/imageslider4.jpg",
];

const ImageSlider = () => {
  const [currentImage, setCurrentImage] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Handle swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    if (distance > 50) {
      setCurrentImage((prev) => (prev + 1) % sliderImages.length); // swipe left
    } else if (distance < -50) {
      setCurrentImage((prev) =>
        prev === 0 ? sliderImages.length - 1 : prev - 1
      ); // swipe right
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div className="mt-10 w-full max-w-5xl mx-auto">
      {/* Image Slider */}
      {/* <div
        className="relative w-full h-60 sm:h-80 md:h-[400px] overflow-hidden rounded-2xl shadow-xl"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {sliderImages.map((src, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-700 ${
              index === currentImage ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <Image
              src={src}
              alt={`Slide ${index + 1}`}
              fill
              className="object-cover rounded-2xl"
              priority={index === 0}
            />
          </div>
        ))}
      </div> */}

      {/* Dots */}
      {/* <div className="mt-4 flex justify-center gap-2">
        {sliderImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentImage(index)}
            className={`h-2 w-2 rounded-full transition-all duration-300 ${
              currentImage === index ? "bg-primary w-3" : "bg-gray-400"
            }`}
          />
        ))}
      </div> */}

      {/* Video Below Slider */}
      <div className="mt-8 w-full rounded-2xl overflow-hidden shadow-lg">
        <video
          controls
          className="w-full h-auto rounded-2xl"
          poster="/imageslider/digilogo.jpg" // optional thumbnail
        >
          <source src="/imageslider/hc-video.mp4" type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </div>
  );
};

export default ImageSlider;
