'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import styles from '../../app/page.module.css';

export default function HeroCarousel({ slides }) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 7000);

    return () => window.clearInterval(intervalId);
  }, [slides.length]);

  const activeSlide = slides[activeIndex];
  const isExternalLink = activeSlide?.linkUrl?.startsWith('http');

  if (!activeSlide) {
    return null;
  }

  return (
    <div className={styles.heroShell}>
      <div className={styles.heroCarousel}>
        <div className={styles.heroContentBlock}>
          <span className={styles.eyebrow}>{activeSlide.badge}</span>
          <h1 className={styles.heroTitle}>Nicetown‑Tioga – Our Air, Our Health, Our Power</h1>
          <div className={styles.heroNewsBlock}>
            <h2 className={styles.heroSlideTitle}>{activeSlide.title}</h2>
            <p className={styles.heroCopy}>{activeSlide.summary}</p>
            {activeSlide.impact ? <p className={styles.heroImpact}>{activeSlide.impact}</p> : null}
            <div className={styles.heroMeta}>
              {activeSlide.source ? <span>{activeSlide.source}</span> : null}
              {activeSlide.publishedAt ? (
                <span>{new Date(activeSlide.publishedAt).toLocaleDateString('en-US')}</span>
              ) : null}
            </div>
            <div className={styles.heroButtons}>
              <Link href="/map" className="btn">
                See the Data Map
              </Link>
              {activeSlide.linkUrl ? (
                isExternalLink ? (
                  <a
                    href={activeSlide.linkUrl}
                    className={`btn ${styles.ctaSecondary}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {activeSlide.linkLabel || 'Learn More'}
                  </a>
                ) : (
                  <Link href={activeSlide.linkUrl} className={`btn ${styles.ctaSecondary}`}>
                    {activeSlide.linkLabel || 'Learn More'}
                  </Link>
                )
              ) : (
                <Link href="/voices" className={`btn ${styles.ctaSecondary}`}>
                  Share Your Story
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className={styles.heroMediaPanel}>
          {activeSlide.imageUrl ? (
            <img
              src={activeSlide.imageUrl}
              alt={activeSlide.title}
              className={styles.heroImage}
            />
          ) : (
            <div className={styles.heroImageFallback}>
              <div className={styles.heroImageGlow}></div>
              <div className={styles.heroImageText}>
                <span>Philadelphia Air Update</span>
                <strong>{activeSlide.badge}</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      {slides.length > 1 ? (
        <div className={styles.heroDots}>
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`${styles.heroDot} ${index === activeIndex ? styles.heroDotActive : ''}`}
              onClick={() => setActiveIndex(index)}
              aria-label={`Show slide ${index + 1}`}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
