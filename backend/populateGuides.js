const mongoose = require('mongoose');
const Guide = require('./models/Guide');

// Connect to MongoDB using the same database name as the main app
mongoose.connect('mongodb://127.0.0.1:27017/Yatra360');

const sampleGuides = [
  {
    name: 'Rajesh Kumar',
    type: 'Physical',
    region: 'Rajasthan',
    city: 'Jaipur',
    specializations: ['Heritage Tours', 'Palace Tours', 'Cultural Experiences'],
    languages: ['Hindi', 'English', 'Marwari'],
    experience: '8 years',
    rating: 4.8,
    contact: '+91 98765 43210',
    email: 'rajesh.guide@gmail.com',
    price: '₹2000/day',
    profileImage: '/images/guide1.jpg',
    description: 'Expert in Rajasthan heritage sites with deep knowledge of local history and culture.',
    available: true
  },
  {
    name: 'Virtual Kedarnath Trek',
    type: 'Virtual',
    region: 'Uttarakhand',
    city: 'Kedarnath',
    specializations: ['Virtual Tours', 'Spiritual Journeys', 'Mountain Trekking'],
    languages: ['Hindi', 'English'],
    experience: 'VR Experience',
    rating: 4.6,
    contact: 'virtual@yatra360.com',
    email: 'virtual@yatra360.com',
    price: '₹500/session',
    profileImage: '/images/kedarnath-vr.jpg',
    description: 'Immersive virtual reality experience of the sacred Kedarnath temple and trek.',
    available: true
  },
  {
    name: 'Priya Sharma',
    type: 'Physical',
    region: 'Kerala',
    city: 'Kochi',
    specializations: ['Backwater Tours', 'Spice Plantation', 'Ayurveda Tours'],
    languages: ['Malayalam', 'English', 'Tamil'],
    experience: '6 years',
    rating: 4.9,
    contact: '+91 87654 32109',
    email: 'priya.kerala@gmail.com',
    price: '₹1800/day',
    profileImage: '/images/guide2.jpg',
    description: 'Specialist in Kerala backwaters and traditional Ayurvedic wellness tours.',
    available: true
  },
  {
    name: 'Mumbai Heritage Walk',
    type: 'Virtual',
    region: 'Maharashtra',
    city: 'Mumbai',
    specializations: ['Heritage Walks', 'Colonial Architecture', 'Street Food Tours'],
    languages: ['Hindi', 'English', 'Marathi'],
    experience: 'AR Experience',
    rating: 4.7,
    contact: 'mumbai@yatra360.com',
    email: 'mumbai@yatra360.com',
    price: '₹300/session',
    profileImage: '/images/mumbai-ar.jpg',
    description: 'Augmented reality guided tour through Mumbai\'s iconic heritage sites and markets.',
    available: true
  },
  {
    name: 'Amit Singh',
    type: 'Physical',
    region: 'Himachal Pradesh',
    city: 'Manali',
    specializations: ['Adventure Tours', 'Mountain Climbing', 'River Rafting'],
    languages: ['Hindi', 'English', 'Punjabi'],
    experience: '10 years',
    rating: 4.8,
    contact: '+91 76543 21098',
    email: 'amit.adventure@gmail.com',
    price: '₹2500/day',
    profileImage: '/images/guide3.jpg',
    description: 'Adventure sports expert specializing in Himalayan treks and extreme sports.',
    available: true
  },
  {
    name: 'Meera Patel',
    type: 'Physical',
    region: 'Gujarat',
    city: 'Ahmedabad',
    specializations: ['Cultural Tours', 'Textile Heritage', 'Gandhi Circuit'],
    languages: ['Gujarati', 'Hindi', 'English'],
    experience: '5 years',
    rating: 4.7,
    contact: '+91 65432 10987',
    email: 'meera.gujarat@gmail.com',
    price: '₹1500/day',
    profileImage: '/images/guide4.jpg',
    description: 'Cultural heritage expert with focus on Gujarat\'s rich textile and Gandhi legacy.',
    available: true
  },
  {
    name: 'Arjun Reddy',
    type: 'Physical',
    region: 'Andhra Pradesh',
    city: 'Tirupati',
    specializations: ['Temple Tours', 'Spiritual Guidance', 'Religious History'],
    languages: ['Telugu', 'Hindi', 'English'],
    experience: '7 years',
    rating: 4.6,
    contact: '+91 98765 12345',
    email: 'arjun.tirupati@gmail.com',
    price: '₹1200/day',
    description: 'Specialized in temple tours and spiritual journeys across Andhra Pradesh.',
    available: true
  },
  {
    name: 'Kashmiri Valley Explorer',
    type: 'Virtual',
    region: 'Jammu & Kashmir',
    city: 'Srinagar',
    specializations: ['Virtual Kashmir Tours', 'Dal Lake Experience', 'Himalayan Views'],
    languages: ['Kashmiri', 'Hindi', 'English'],
    experience: '360° Experience',
    rating: 4.8,
    contact: 'kashmir@yatra360.com',
    email: 'kashmir@yatra360.com',
    price: '₹600/session',
    description: 'Experience the breathtaking beauty of Kashmir through immersive virtual tours.',
    available: true
  }
];

async function populateGuides() {
  try {
    // Clear existing guides
    await Guide.deleteMany({});
    console.log('Cleared existing guides');
    
    // Insert sample guides
    const insertedGuides = await Guide.insertMany(sampleGuides);
    console.log(`Inserted ${insertedGuides.length} sample guides`);
    
    console.log('Sample guides populated successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error populating guides:', error);
    process.exit(1);
  }
}

populateGuides();
