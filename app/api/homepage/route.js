import { NextResponse } from 'next/server';
import { auth } from '../../../auth';
import { getHomePageContent, upsertHomePageContent } from '../../../lib/admin-system';

export const dynamic = 'force-dynamic';

const DEFAULTS = {
  hero: {
    slides: [
      { title: 'Air Quality Orange', subtitle: 'Environmental Justice for Nicetown, Hunting Park, and Eastwick' },
    ],
  },
  stats: {
    items: [
      { value: '21%', label: 'Childhood asthma rate' },
      { value: '41%', label: 'Black residents in high cancer zones' },
      { value: '125', label: 'Premature deaths/year from air pollution' },
      { value: 'F', label: 'Air quality grade' },
    ],
  },
  features: {
    items: [
      { title: 'The Problem', description: 'Learn about air pollution and environmental racism.', icon: '⚠️', link: '/problem' },
      { title: 'The History', description: 'Understand redlining and disinvestment.', icon: '📜', link: '/history' },
      { title: 'The Data', description: 'See the numbers behind environmental injustice.', icon: '📊', link: '/data' },
      { title: 'The Map', description: 'Explore pollution sources and solutions.', icon: '🗺️', link: '/map' },
    ],
  },
  quote: {
    text: 'The environmental challenges in our communities are not accidental. They are the result of redlining, industrial zoning, and racial inequality. But community organizing works. Grassroots action works. Environmental justice is possible.',
    author: 'Community Voices of AQO',
  },
  cta: {
    title: 'Together, We Can Make a Difference',
    description: 'Join us in building a healthier, more just future.',
    buttonText: 'Get Involved',
    buttonLink: '/get-involved',
  },
  userStories: {
    items: [
      { content: '"As a parent in Nicetown, I want to see where pollution comes from so I can keep my child safe."', author: 'Parent, Nicetown', community: 'Nicetown' },
      { content: '"As a block captain, I want visual evidence of pollution to show at community meetings."', author: 'Block Captain, Hunting Park', community: 'Hunting Park' },
    ],
  },
};

const SECTION_MAP = {
  stats: 'stats',
  features: 'cards',
  quote: 'quote',
  cta: 'cta',
  hero: 'hero',
  userStories: 'userStories',
};

export async function GET() {
  let content;
  try {
    content = await getHomePageContent();
  } catch {
    content = {};
  }

  const result = {};
  for (const [sectionKey, defaultValue] of Object.entries(DEFAULTS)) {
    const sourceKey = SECTION_MAP[sectionKey];
    const existing = content[sourceKey];
    if (existing) {
      result[sectionKey] = sectionKey === 'stats' || sectionKey === 'features' || sectionKey === 'userStories'
        ? { items: existing }
        : existing;
    } else {
      result[sectionKey] = defaultValue;
    }
  }

  return NextResponse.json(result);
}

export async function POST(request) {
  const session = await auth();
  if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'ADMIN_ASSISTANT')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { section, data } = await request.json();

  if (!section || !data) {
    return NextResponse.json({ error: 'Missing section or data' }, { status: 400 });
  }

  const currentContent = await getHomePageContent();
  const sourceKey = SECTION_MAP[section];

  if (!sourceKey) {
    return NextResponse.json({ error: `Unknown section: ${section}` }, { status: 400 });
  }

  const updatedContent = {
    ...currentContent,
    [sourceKey]: section === 'stats' || section === 'features' || section === 'userStories'
      ? (data.items || data)
      : data,
  };

  await upsertHomePageContent(updatedContent);

  return NextResponse.json({ success: true, section, data });
}
