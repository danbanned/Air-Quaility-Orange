import { prisma } from './prisma';

const ACTIVE_LAYOUT_KEY = 'active_homepage_layout';

const LAYOUTS = [
  {
    id: 'layout-1-default',
    name: 'Default Layout',
    description: 'Original AQO homepage layout with hero carousel, cards, stats, quote, CTA, and community stories.',
    icon: '📄',
  },
  {
    id: 'layout-2-compact',
    name: 'Compact Layout',
    description: 'Streamlined design with stacked stats, compact feature grid, and minimal sections.',
    icon: '📏',
  },
  {
    id: 'layout-3-story-focused',
    name: 'Story-Focused Layout',
    description: 'Emphasizes community stories and voices above all other content.',
    icon: '🎙️',
  },
  {
    id: 'layout-4-data-heavy',
    name: 'Data-Heavy Layout',
    description: 'Prioritizes statistics, charts, and data visualization upfront.',
    icon: '📊',
  },
];

export function getAvailableLayouts() {
  return LAYOUTS;
}

export function getLayoutInfo(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}

export async function getActiveLayout() {
  const setting = await prisma.systemSetting.findUnique({
    where: { key: ACTIVE_LAYOUT_KEY },
  });
  return setting?.value || 'layout-1-default';
}

export async function setActiveLayout(layoutId) {
  const valid = LAYOUTS.some((l) => l.id === layoutId);
  if (!valid) {
    throw new Error(`Invalid layout ID: ${layoutId}`);
  }

  await prisma.systemSetting.upsert({
    where: { key: ACTIVE_LAYOUT_KEY },
    update: { value: layoutId },
    create: { key: ACTIVE_LAYOUT_KEY, value: layoutId },
  });

  return layoutId;
}
