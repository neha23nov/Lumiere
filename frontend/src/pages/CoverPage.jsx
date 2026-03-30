import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';


const PREVIEW_IMAGES = [
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&q=80",
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400&q=80",
  "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=400&q=80",
  "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=400&q=80",
  "https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=400&q=80",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?w=400&q=80",
];

const CoverPage = () => {
  const navigate = useNavigate();
  const orbRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!orbRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      orbRef.current.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="cover-root">
      {/* Ambient background orb */}
      <div className="cover-orb" ref={orbRef} />

      {/* Floating image mosaic */}
      <div className="cover-mosaic" aria-hidden="true">
        {PREVIEW_IMAGES.map((src, i) => (
          <div key={i} className={`mosaic-card mosaic-card--${i + 1}`}>
            <img src={src} alt="" loading="lazy" />
          </div>
        ))}
      </div>

      {/* Grain overlay */}
      <div className="cover-grain" aria-hidden="true" />

      {/* Hero content */}
      <main className="cover-hero">
        <div className="cover-badge">✦ Visual Storytelling</div>

        <h1 className="cover-title">
          <span className="cover-title__line cover-title__line--1">Frame</span>
          <span className="cover-title__line cover-title__line--2">
            <em>your</em> world.
          </span>
        </h1>

        <p className="cover-subtitle">
        Framr is your personal gallery — a quiet place to post, collect,<br />
          and celebrate moments that matter.
        </p>

        <div className="cover-actions">
          <button
            className="cover-btn cover-btn--primary"
            onClick={() => navigate('/create')}
          >
            <span className="cover-btn__icon">+</span>
            Create a Post
          </button>
          <button
            className="cover-btn cover-btn--ghost"
            onClick={() => navigate('/feed')}
          >
            Explore Feed →
          </button>
        </div>

        <div className="cover-stats">
          <div className="stat">
            <span className="stat__num">∞</span>
            <span className="stat__label">Moments</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat__num">1</span>
            <span className="stat__label">Your Gallery</span>
          </div>
          <div className="stat-divider" />
          <div className="stat">
            <span className="stat__num">✦</span>
            <span className="stat__label">Pure Light</span>
          </div>
        </div>
      </main>

      {/* Wordmark */}
      <div className="cover-wordmark" aria-label="Framr">Framr</div>
    </div>
  );
};

export default CoverPage;