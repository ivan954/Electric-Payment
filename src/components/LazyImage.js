import React, { useEffect, useRef, useState } from "react";

const LazyImage = ({ src, alt, className, style, onClick }) => {
  const [isInView, setIsInView] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const sentinelRef = useRef(null);
  const imgRef = useRef(null);
  const preloaderRef = useRef(null);

  useEffect(() => {
    setIsInView(false);
    setLoaded(false);
    setFailed(false);

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
      setIsInView(true);
    }
  }, [src]);

  useEffect(() => {
    if (!isInView || loaded || failed) return;

    const preloader = new Image();
    preloaderRef.current = preloader;
    const handleLoad = () => setLoaded(true);
    const handleError = () => setFailed(true);
    preloader.addEventListener("load", handleLoad);
    preloader.addEventListener("error", handleError);
    preloader.src = src;

    if (preloader.complete && preloader.naturalWidth > 0) {
      setLoaded(true);
    }

    return () => {
      preloader.removeEventListener("load", handleLoad);
      preloader.removeEventListener("error", handleError);
    };
  }, [isInView, src, loaded, failed]);

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
