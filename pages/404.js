export default function Custom404() {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 640, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Page not found</h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
          The page you requested could not be found.
        </p>
      </div>
    </main>
  );
}
