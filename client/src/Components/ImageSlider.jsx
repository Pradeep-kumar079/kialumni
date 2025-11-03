import React, { useState, useEffect } from "react";
import "./ImageSlider.css";

const images = [
  "https://i.pinimg.com/1200x/22/4d/9f/224d9ff0336d4d44d4f395a68f6a2c1c.jpg",
"https://i.pinimg.com/1200x/22/4d/9f/224d9ff0336d4d44d4f395a68f6a2c1c.jpg",
   "https://i.pinimg.com/1200x/22/4d/9f/224d9ff0336d4d44d4f395a68f6a2c1c.jpg",];

const ImageSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Automatically change slide every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToPrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className="slider">
      <button className="prev" onClick={goToPrev}>
        &#10094;
      </button>
      <img src={images[currentIndex]} alt="slide" className="slide-image" />
      <button className="next" onClick={goToNext}>
        &#10095;
      </button>
    </div>
  );
};

export default ImageSlider;
