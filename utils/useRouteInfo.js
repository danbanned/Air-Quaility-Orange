'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/compat/router';

export default function useRouteInfo() {
  const router = useRouter();

  return useMemo(() => {
    const search =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search)
        : null;

    const queryUserId =
      typeof router?.query?.userId === 'string'
        ? router.query.userId
        : search?.get('userId') || '';

    const pathname =
      router?.pathname ||
      (typeof window !== 'undefined' ? window.location.pathname : '/');

    const push = (href) => {
      if (router) {
        router.push(href);
        return;
      }

      if (typeof window !== 'undefined') {
        window.location.assign(href);
      }
    };

    return {
      pathname,
      push,
      userId: queryUserId,
    };
  }, [router]);
}
