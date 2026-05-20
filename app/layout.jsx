import '../styles/globals.css';
import Layout from '../components/Layout/Layout';
import Providers from './providers';
import ThemeProvider from '../components/ThemeProvider';

export const metadata = {
  title: 'Air Quality Orange',
  description: 'Environmental justice, community stories, and interactive air quality mapping for Philadelphia neighborhoods.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ThemeProvider>
            <Layout>{children}</Layout>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
