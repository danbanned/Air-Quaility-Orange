const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

const prisma = new PrismaClient({ adapter });

async function main() {
  const generatedPassword = crypto.randomBytes(24).toString('base64url');
  const rawPassword = process.env.ADMIN_PASSWORD || generatedPassword;
  const password = await bcrypt.hash(rawPassword, 12);
  const assistantPassword = await bcrypt.hash(process.env.ADMIN_ASSISTANT_PASSWORD || 'assistant-demo-password', 12);
  const userPassword = await bcrypt.hash(process.env.USER_PASSWORD || 'user-demo-password', 12);

  await prisma.user.upsert({
    where: { email: 'admin@airqualityorange.org' },
    update: {
      password,
      role: 'ADMIN',
      name: 'AQO Admin',
      contactInfo: 'admin@airqualityorange.org',
    },
    create: {
      email: 'admin@airqualityorange.org',
      password,
      role: 'ADMIN',
      name: 'AQO Admin',
      contactInfo: 'admin@airqualityorange.org',
    },
  });

  await prisma.user.upsert({
    where: { email: 'assistant@airqualityorange.org' },
    update: {
      password: assistantPassword,
      role: 'ADMIN_ASSISTANT',
      name: 'AQO Assistant',
      contactInfo: 'assistant@airqualityorange.org',
    },
    create: {
      email: 'assistant@airqualityorange.org',
      password: assistantPassword,
      role: 'ADMIN_ASSISTANT',
      name: 'AQO Assistant',
      contactInfo: 'assistant@airqualityorange.org',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@airqualityorange.org' },
    update: {
      password: userPassword,
      role: 'USER',
      name: 'AQO Community User',
      contactInfo: 'user@airqualityorange.org',
    },
    create: {
      email: 'user@airqualityorange.org',
      password: userPassword,
      role: 'USER',
      name: 'AQO Community User',
      contactInfo: 'user@airqualityorange.org',
    },
  });

  await prisma.heroSlide.deleteMany({});
  await prisma.solution.deleteMany({});
  await prisma.event.deleteMany({});
  await prisma.opportunity.deleteMany({});
  await prisma.location.deleteMany({});
  await prisma.homePageContent.deleteMany({});
  await prisma.systemSetting.deleteMany({});

  await prisma.homePageContent.create({
    data: {
      key: 'home-page',
      data: {
        cards: [
          {
            title: 'Community Voices',
            description: 'Read and submit resident stories about air quality, heat, health, and organizing.',
            icon: '🎙️',
            link: '/voices',
          },
          {
            title: 'Local Solutions',
            description: 'Explore neighborhood-led projects and the resources that support them.',
            icon: '🌿',
            link: '/solutions',
          },
          {
            title: 'Get Involved',
            description: 'Find opportunities, events, and action steps for supporting AQO communities.',
            icon: '🤝',
            link: '/get-involved',
          },
        ],
        stats: [
          { value: '3', label: 'Priority communities' },
          { value: '6', label: 'Starter solution tracks' },
          { value: '24/7', label: 'Resident access to updates' },
        ],
        quote: {
          text: 'The strongest environmental health tools are the ones residents can use and change themselves.',
          author: 'Air Quality Orange',
        },
        cta: {
          title: 'Help shape AQO.',
          body: 'Share what your block is experiencing, find local projects, and join upcoming events.',
          primaryText: 'Submit a Story',
          primaryHref: '/voices',
          secondaryText: 'See Events',
          secondaryHref: '/events',
        },
      },
    },
  });

  await prisma.systemSetting.upsert({
    where: { key: 'active_homepage_layout' },
    update: {},
    create: { key: 'active_homepage_layout', value: 'layout-1-default' },
  });

  await prisma.heroSlide.createMany({
    data: [
      {
        badge: 'AQO Update',
        title: 'AQO is turning neighborhood air data into resident-facing updates.',
        summary: 'The homepage hero now rotates through project updates, local alerts, and action links.',
        impact: 'Residents can find urgent context and action steps from the first screen.',
        source: 'Air Quality Orange platform update',
        imageUrl: '/images/hero-fallback.jpg',
        linkUrl: '/map',
        linkLabel: 'Open the map',
        sortOrder: 1,
        isActive: true,
        publishedAt: new Date('2026-05-12T00:00:00.000Z'),
      },
      {
        badge: 'Philadelphia Air Monitoring',
        title: 'Breathe Philly expanded neighborhood-level air monitoring across the city.',
        summary: 'AQO can use more local particulate and nitrogen dioxide monitoring context for resident storytelling and advocacy.',
        impact: 'More localized monitoring helps compare neighborhood conditions and support accountability.',
        source: 'City of Philadelphia',
        imageUrl: '/images/hero-fallback.jpg',
        linkUrl: '/data',
        linkLabel: 'Explore the data',
        sortOrder: 2,
        isActive: true,
        publishedAt: new Date('2026-02-18T00:00:00.000Z'),
      },
    ],
  });

  await prisma.solution.createMany({
    data: [
      {
        title: 'Tree Planting Initiative',
        description: 'Community-led tree planting to increase canopy coverage.',
        icon: '🌳',
        imageUrl: null,
        category: 'greening',
        resources: {
          links: [{ url: 'https://example.org/tree-care', title: 'Learn More' }],
          emails: ['trees@airqualityorange.org'],
          classes: [{ name: 'Tree Care Workshop', date: '2026-06-01', signupUrl: 'https://example.org/workshop' }],
          actionButtons: [{ text: 'Volunteer', url: '/get-involved' }],
        },
      },
      {
        title: 'Furtick Farms',
        description: 'Urban farm providing fresh food and education.',
        icon: '🥕',
        imageUrl: null,
        category: 'food',
        resources: {
          links: [{ url: 'https://example.org/farm', title: 'Farm Updates' }],
          emails: ['farm@airqualityorange.org'],
          classes: [],
          actionButtons: [{ text: 'Support Food Access', url: '/get-involved' }],
        },
      },
      {
        title: 'CoolSeal Pavement Project',
        description: 'Reflective pavement to reduce heat exposure.',
        icon: '🛣️',
        imageUrl: null,
        category: 'infrastructure',
        resources: { links: [], emails: [], classes: [], actionButtons: [] },
      },
      {
        title: 'Block Captain Program',
        description: 'Residents leading environmental action on their blocks.',
        icon: '🏘️',
        imageUrl: null,
        category: 'organizing',
        resources: { links: [], emails: ['captains@airqualityorange.org'], classes: [], actionButtons: [] },
      },
      {
        title: 'GSI Stormwater Projects',
        description: 'Green infrastructure for stormwater and cooler blocks.',
        icon: '💧',
        imageUrl: null,
        category: 'infrastructure',
        resources: { links: [], emails: [], classes: [], actionButtons: [] },
      },
      {
        title: 'Youth Climate Justice Program',
        description: 'Training the next generation of environmental leaders.',
        icon: '👥',
        imageUrl: null,
        category: 'education',
        resources: { links: [], emails: [], classes: [], actionButtons: [] },
      },
    ],
  });

  await prisma.event.createMany({
    data: [
      {
        title: 'Community Cleanup Day',
        description: 'Join neighbors to clean up parks and streets.',
        date: new Date('2026-06-20T00:00:00.000Z'),
        time: '9:00 AM - 12:00 PM',
        location: 'Hunting Park',
        address: '900 W Hunting Park Ave, Philadelphia, PA 19140',
        category: 'cleanup',
        organizer: 'Hunting Park Neighborhood Association',
        spots: 50,
        registered: 18,
        status: 'ACTIVE',
      },
      {
        title: 'Environmental Justice Panel',
        description: 'Panel discussion with community leaders on environmental justice wins and challenges.',
        date: new Date('2026-06-25T00:00:00.000Z'),
        time: '6:00 PM - 8:00 PM',
        location: 'Nicetown CDC',
        address: '4300 Germantown Ave, Philadelphia, PA 19140',
        category: 'education',
        organizer: 'Philly Thrive',
        spots: 100,
        registered: 44,
        status: 'ACTIVE',
      },
      {
        title: 'Tree Planting Workshop',
        description: 'Learn how to plant and care for trees with local greening leaders.',
        date: new Date('2026-07-10T00:00:00.000Z'),
        time: '10:00 AM - 1:00 PM',
        location: 'Furtick Farms',
        address: '200 E Wyoming Ave, Philadelphia, PA 19120',
        category: 'workshop',
        organizer: 'AQO Greening Team',
        spots: 40,
        registered: 12,
        status: 'ACTIVE',
      },
    ],
  });

  await prisma.location.createMany({
    data: [
      {
        name: 'Roosevelt Extension Roadway',
        address: 'Roosevelt Blvd & Wissahickon Ave, Philadelphia, PA 19144',
        lat: 40.02345,
        lng: -75.15234,
        type: 'pollution',
        isActive: true,
      },
      {
        name: 'SEPTA Midvale Natural Gas Plant',
        address: '4300 Wissahickon Ave, Philadelphia, PA 19129',
        lat: 40.01678,
        lng: -75.1589,
        type: 'pollution',
        isActive: true,
      },
      {
        name: 'Wayne Junction Rail Station',
        address: '2900 Windrim Ave, Philadelphia, PA 19132',
        lat: 40.02123,
        lng: -75.14876,
        type: 'pollution',
        isActive: true,
      },
      {
        name: 'Former PES Refinery Site',
        address: '3144 W Passyunk Ave, Philadelphia, PA 19145',
        lat: 40.01789,
        lng: -75.16234,
        type: 'pollution',
        isActive: true,
      },
      {
        name: 'Furtick Farms',
        address: '200 E Wyoming Ave, Philadelphia, PA 19120',
        lat: 40.02234,
        lng: -75.15123,
        type: 'solution',
        isActive: true,
      },
      {
        name: 'Hunting Park Community Garden',
        address: '1100 W Hunting Park Ave, Philadelphia, PA 19140',
        lat: 40.01876,
        lng: -75.15789,
        type: 'solution',
        isActive: true,
      },
      {
        name: 'Tree Planting Site - Diamond Street',
        address: 'Diamond St & N 15th St, Philadelphia, PA 19121',
        lat: 40.02045,
        lng: -75.14987,
        type: 'solution',
        isActive: true,
      },
      {
        name: 'GSI Stormwater Project',
        address: 'Nicetown, Philadelphia, PA 19140',
        lat: 40.01912,
        lng: -75.15567,
        type: 'solution',
        isActive: true,
      },
    ],
  });

  await prisma.opportunity.createMany({
    data: [
      {
        title: 'Volunteer',
        description: 'Join community cleanups and neighborhood events.',
        icon: '🤝',
        imageUrl: null,
        commitments: [{ text: 'One-time events', skillLevel: 'beginner' }],
        skills: [{ name: 'No experience needed', howToGet: 'Training provided on site' }],
        category: 'volunteer',
        actionUrl: '/events',
      },
      {
        title: 'Block Captain',
        description: 'Lead environmental action on your block.',
        icon: '🏘️',
        imageUrl: null,
        commitments: [{ text: 'Monthly check-ins', skillLevel: 'intermediate' }],
        skills: [{ name: 'Leadership', howToGet: 'Free leadership workshop every Tuesday at Nicetown CDC' }],
        category: 'block-captain',
        actionUrl: '/get-involved',
      },
      {
        title: 'Donate',
        description: 'Support AQO programs and local campaigns.',
        icon: '💰',
        imageUrl: null,
        commitments: [{ text: 'One-time or monthly', skillLevel: 'all' }],
        skills: [{ name: 'Financial support', howToGet: 'Direct donation or sponsorship' }],
        category: 'donate',
        actionUrl: '/contact',
      },
    ],
  });

  console.log('Admin user ensured: admin@airqualityorange.org');
  console.log('Assistant user ensured: assistant@airqualityorange.org');
  console.log('Demo user ensured: user@airqualityorange.org');
  console.log('AQO admin system seed complete.');
  if (!process.env.ADMIN_PASSWORD) {
    console.log(`Generated admin password: ${generatedPassword}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
  