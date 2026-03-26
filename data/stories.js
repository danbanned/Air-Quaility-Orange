// data/stories.js

const stories = [
  {
    id: 1,
    title: 'Fighting for Clean Air in Hunting Park',
    author: 'Maria Rodriguez',
    role: 'Block Captain',
    community: 'Hunting Park',
    image: '/images/story-maria.jpg',
    audioUrl: '/audio/maria-story.mp3',
    content: 'Growing up in Hunting Park, I remember when we could play outside without worrying about our breathing. Now, we organize to make that possible again. Our block captain program has brought neighbors together to demand change and plant trees where there was only concrete.',
    date: '2024-03-15',
    category: 'organizing'
  },
  {
    id: 2,
    title: 'The Day We Closed the PES Refinery',
    author: 'James Washington',
    role: 'Community Organizer',
    community: 'Eastwick',
    image: '/images/story-james.jpg',
    audioUrl: '/audio/james-story.mp3',
    content: 'After years of fighting, we finally saw the PES refinery close. But our work isn\'t done. We\'re now fighting for a just transition that includes green jobs and a healthy future for our children.',
    date: '2024-03-10',
    category: 'victory'
  },
  {
    id: 3,
    title: 'Planting Hope on Diamond Street',
    author: 'Keisha Brown',
    role: 'Youth Organizer',
    community: 'Nicetown',
    image: '/images/story-keisha.jpg',
    audioUrl: '/audio/keisha-story.mp3',
    content: 'Our youth climate justice group planted 50 trees last month. Each tree represents our commitment to a healthier future. The kids now check "their" trees every day after school.',
    date: '2024-03-05',
    category: 'action'
  },
  {
    id: 4,
    title: 'From Asthma to Activism',
    author: 'Carlos Mendez',
    role: 'Health Advocate',
    community: 'Hunting Park',
    image: '/images/story-carlos.jpg',
    audioUrl: '/audio/carlos-story.mp3',
    content: 'My daughter\'s asthma diagnosis changed everything. I started asking why so many kids in our neighborhood have breathing problems. Now I lead workshops on air quality and health.',
    date: '2024-02-28',
    category: 'health'
  }
];

export const getStoriesByCommunity = (community) => {
  if (!community) return stories;
  return stories.filter(story => story.community.toLowerCase() === community.toLowerCase());
};

export const getStoriesByCategory = (category) => {
  if (!category) return stories;
  return stories.filter(story => story.category === category);
};

export default stories;