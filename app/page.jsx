import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getActiveLayout } from '@/lib/layout-manager';
import { getHomePageContent } from '@/lib/admin-system';
import { listHeroSlides } from '@/lib/hero-slide-service';
import { prisma } from '@/lib/prisma';

import LayoutDefault from '@/components/homepageLayouts/LayoutDefault';
import LayoutCompact from '@/components/homepageLayouts/LayoutCompact';
import LayoutStoryFocused from '@/components/homepageLayouts/LayoutStoryFocused';
import LayoutDataHeavy from '@/components/homepageLayouts/LayoutDataHeavy';

const layoutMap = {
  'layout-1-default': LayoutDefault,
  'layout-2-compact': LayoutCompact,
  'layout-3-story-focused': LayoutStoryFocused,
  'layout-4-data-heavy': LayoutDataHeavy,
};

export default async function HomePage() {
  const [session, homeContent, slides, activeLayoutId] = await Promise.all([
    getServerSession(authOptions),
    getHomePageContent(),
    listHeroSlides(false),
    getActiveLayout(),
  ]);

  const approvedStories = await prisma.story.findMany({
    where: { status: 'APPROVED' },
    orderBy: { createdAt: 'desc' },
    take: 6,
  });

  const isStaff = session?.user?.role === 'ADMIN' || session?.user?.role === 'ADMIN_ASSISTANT';
  const LayoutComponent = layoutMap[activeLayoutId] || LayoutDefault;

  return (
    <>
      {isStaff ? (
        <>
          <div style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            zIndex: 999,
            display: 'flex',
            gap: '8px',
          }}>
            <Link
              href="/admin/homepage-editor"
              style={{
                background: '#FF6B35',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              🎨 Switch Layout
            </Link>
            <Link
              href="/admin/homepage"
              style={{
                background: '#1e293b',
                color: '#fff',
                padding: '10px 18px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
              }}
            >
              ✏️ Edit Content
            </Link>
          </div>
          <div style={{
            position: 'fixed',
            bottom: '80px',
            right: '20px',
            zIndex: 999,
            background: '#1e293b',
            color: '#fff',
            fontSize: '12px',
            padding: '6px 14px',
            borderRadius: '20px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          }}>
            ✏️ Hover any text to edit
          </div>
        </>
      ) : null}

      <LayoutComponent
        slides={slides}
        homeContent={homeContent}
        stories={approvedStories}
        isStaff={isStaff}
      />
    </>
  );
}
