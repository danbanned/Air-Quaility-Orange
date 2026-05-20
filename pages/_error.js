export default function ErrorPage({ statusCode }) {
  return (
    <main style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', padding: '3rem 1.5rem' }}>
      <div style={{ maxWidth: 640, textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>
          {statusCode ? `Error ${statusCode}` : 'Unexpected error'}
        </h1>
        <p style={{ fontSize: '1.05rem', lineHeight: 1.6 }}>
          The request could not be completed.
        </p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }) => {
  const statusCode = res?.statusCode || err?.statusCode || 500;
  return { statusCode };
};
