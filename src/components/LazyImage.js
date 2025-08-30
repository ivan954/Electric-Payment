import React, { useEffect, useRef, useState } from "react";

const LazyImage = ({ src, alt, className, style, onClick }) => {
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinelRef = useRef(null);
  const imgRef = useRef(null);
  const preloaderRef = useRef(null);

  // Reset when src changes
  useEffect(() => {
    setIsInView(false);
    setLoaded(false);
    setFailed(false);
  }, [src]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    if ("IntersectionObserver" in window) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsInView(true);
              observer.unobserve(entry.target);
            }
          });
        },
        { root: null, rootMargin: "200px", threshold: 0.1 }
      );
      observer.observe(sentinelRef.current);
      return () => observer.disconnect();
    } else {
      // Fallback: load immediately
      setIsInView(true);
    }
  }, []);

  // Start preloading when in view
  useEffect(() => {
    if (!isInView || loaded || failed) return;

    const preloader = new Image();
    preloaderRef.current = preloader;
    const handleLoad = () => setLoaded(true);
    const handleError = () => setFailed(true);
    preloader.addEventListener("load", handleLoad);
    preloader.addEventListener("error", handleError);
    preloader.src = src;

    // If cached
    if (preloader.complete && preloader.naturalWidth > 0) {
      setLoaded(true);
    }

    return () => {
      preloader.removeEventListener("load", handleLoad);
      preloader.removeEventListener("error", handleError);
    };
  }, [isInView, src, loaded, failed]);

  // If the image is already cached, ensure we mark it loaded
  useEffect(() => {
    if (
      isInView &&
      imgRef.current &&
      imgRef.current.complete &&
      imgRef.current.naturalWidth > 0
    ) {
      setLoaded(true);
    }
  }, [isInView]);

  return (
    <span ref={sentinelRef} style={{ display: "inline-block" }}>
      {!loaded && !failed && (
        <div
          className={`${className ? className : ""} img-skeleton`}
          style={style}
        />
      )}
      {failed && (
        <div
          className={`${className ? className : ""} img-fallback`}
          style={style}
          aria-label="image failed to load"
        />
      )}
      {isInView && loaded && !failed && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`${className ? className : ""} img-fade-in`}
          style={{ ...style }}
          onClick={onClick}
        />
      )}
    </span>
  );
};

export default LazyImage;
