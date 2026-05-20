'use client';

import { useEffect, useState } from 'react';

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(null);

  useEffect(() => {
    fetch('/api/site-config')
      .then((res) => res.json())
      .then((config) => {
        setTheme(config.theme || {});
        const root = document.documentElement;
        for (const [key, value] of Object.entries(config.theme || {})) {
          root.style.setProperty(key, value);
        }
      })
      .catch(() => {});
  }, []);

  return children;
}
