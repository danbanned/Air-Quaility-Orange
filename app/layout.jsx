import '../styles/globals.css';
import Layout from '../components/Layout/Layout';

export const metadata = {
  title: 'Air Quality Orange',
  description: 'Environmental justice, community stories, and interactive air quality mapping for Philadelphia neighborhoods.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Layout>{children}</Layout>
      </body>
    </html>
  );
}
