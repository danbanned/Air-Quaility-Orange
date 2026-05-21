'use client';

export default function ParticleSystem({ active, intensity = 'low' }) {
  if (!active) {
    return null;
  }

  const count = intensity === 'high' ? 24 : intensity === 'medium' ? 16 : 10;
  const particles = Array.from({ length: count }, (_, index) => {
    const left = (index * 91) % 100;
    const duration = 10 + (index % 5) * 2;
    const delay = (index % 7) * 0.5;
    return { id: index, left, duration, delay };
  });

  return (
    <div className="aqo-particle-layer" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="aqo-particle"
          style={{
            left: `${particle.left}%`,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
