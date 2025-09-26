// Structured domain knowledge for deeper AI assistant answers
// Lightweight local knowledge base; can be replaced or augmented by backend endpoints later.

export const destinations = [
  {
    key: 'rajasthan',
    name: 'Rajasthan',
    highlights: ['Jaipur (Pink City)', 'Udaipur lakes', 'Jaisalmer desert fort', 'Mehrangarh Fort'],
    bestSeasons: 'October to March',
    themes: ['heritage', 'culture', 'desert', 'architecture'],
    budgetRanges: {
      shoestring: '₹1500-2500/day',
      mid: '₹3000-6000/day',
      luxury: '₹8000+/day'
    },
    tips: [
      'Book desert safari at sunset for cooler temperatures',
      'Carry a light scarf for dust in desert regions',
      'Advance book popular haveli stays in peak season'
    ],
    localDishes: ['Dal Baati Churma', 'Laal Maas', 'Ghewar']
  },
  {
    key: 'kerala',
    name: 'Kerala',
    highlights: ['Alleppey backwaters', 'Munnar tea gardens', 'Kochi heritage zones', 'Periyar wildlife'],
    bestSeasons: 'September to March (monsoon rejuvenation June-August)',
    themes: ['backwaters', 'spice', 'ayurveda', 'ecotourism'],
    budgetRanges: {
      shoestring: '₹1400-2300/day',
      mid: '₹2800-5500/day',
      luxury: '₹7500+/day'
    },
    tips: [
      'Choose a smaller kettuvallam (houseboat) for quieter canals',
      'Pre-book ayurvedic therapies and verify certifications',
      'Try early morning canoe village tours for authentic life scenes'
    ],
    localDishes: ['Appam & Stew', 'Puttu & Kadala', 'Karimeen Pollichathu']
  },
  {
    key: 'himachal',
    name: 'Himachal Pradesh',
    highlights: ['Manali valleys', 'Spiti rugged terrain', 'Dharamshala monasteries', 'Shimla ridge'],
    bestSeasons: 'March-June (pleasant), Oct-Nov (clear skies), avoid heavy snow closures mid-winter in high passes',
    themes: ['mountains', 'trekking', 'spiritual', 'adventure'],
    budgetRanges: {
      shoestring: '₹1200-2000/day',
      mid: '₹2500-4500/day',
      luxury: '₹6500+/day'
    },
    tips: [
      'Acclimatize gradually before entering high-altitude Spiti',
      'Layer clothing; weather shifts rapidly',
      'Pre-book permits if exploring restricted valleys'
    ],
    localDishes: ['Siddu', 'Trout Masala', 'Chha Gosht']
  }
];

export const festivals = [
  {
    key: 'diwali',
    name: 'Diwali',
    month: 'Oct/Nov',
    regions: ['Pan-India'],
    themes: ['light', 'family', 'tradition'],
    travelTips: [
      'Book trains & flights well ahead—peak demand week',
      'Smog can increase in North India; carry a light mask if sensitive',
      'Experience diyas by visiting smaller towns for authentic ambience'
    ],
    experiences: ['Rangoli art', 'Oil lamp lighting', 'Sweet exchanges', 'Fireworks (now moderated)']
  },
  {
    key: 'holi',
    name: 'Holi',
    month: 'March',
    regions: ['Vrindavan', 'Barsana', 'Jaipur', 'Shantiniketan'],
    themes: ['color', 'spring', 'joy'],
    travelTips: [
      'Use organic colors to avoid skin irritation',
      'Protect camera/phone in waterproof pouch',
      'Wear old clothing and light oil on hair/skin'
    ],
    experiences: ['Color play', 'Folk music', 'Temple rituals']
  }
];

export const cuisine = {
  regions: {
    north: {
      staples: ['Wheat breads', 'Rich gravies', 'Yogurt drinks'],
      signature: ['Butter Chicken', 'Rogan Josh', 'Chole Bhature'],
      notes: 'Dairy-rich, aromatic whole spices, tandoor influence'
    },
    south: {
      staples: ['Rice', 'Lentils', 'Coconut'],
      signature: ['Masala Dosa', 'Sambar', 'Chettinad Chicken'],
      notes: 'Fermented batters, tempered spices, curry leaves'
    },
    east: {
      staples: ['Rice', 'Fish', 'Mustard oil'],
      signature: ['Machher Jhol', 'Rasgulla', 'Mishti Doi'],
      notes: 'Delicate flavors, sweets emphasis, river fish focus'
    },
    west: {
      staples: ['Millets', 'Seafood', 'Legumes'],
      signature: ['Dhokla', 'Vada Pav', 'Goan Fish Curry'],
      notes: 'Coastal spice blends, fermented snacks'
    },
    northeast: {
      staples: ['Rice', 'Herbs', 'Bamboo shoots'],
      signature: ['Momos', 'Thukpa', 'Smoked Pork'],
      notes: 'Smoked techniques, lighter spice, tribal diversity'
    }
  }
};

export const transportAdvice = {
  trains: {
    booking: 'Use IRCTC or authorized apps; Tatkal quota opens 1 day before travel (fast filling).',
    classes: ['Sleeper (budget)', '3AC (value comfort)', '2AC (quiet)', '1AC (premium)'],
    tips: ['Carry chain & lock for berth luggage', 'Download offline coach layout']
  },
  flights: {
    booking: 'Compare via metasearch then book direct for flexible changes.',
    tips: ['Arrive 2h domestic / 3h international', 'Check festive surcharges early']
  },
  buses: {
    booking: 'Use Redbus or state portals; Volvo/Scania for hill comfort.',
    tips: ['Night buses save daytime but rest stops are brief', 'Avoid front seats on ghat roads if motion-sensitive']
  },
  local: {
    modes: ['Metro (major cities)', 'Auto-rickshaw', 'App cabs', 'E-rickshaw'],
    tips: ['Insist on meter or pre-negotiate fare', 'Carry small change']
  }
};

export const budgeting = {
  tiers: {
    shoestring: {
      daily: '₹1200-2000',
      lodging: 'Hostels / guesthouses',
      food: 'Local dhabas & street food',
      transport: 'Sleeper trains, state buses',
      activities: 'Free walks, public temples'
    },
    mid: {
      daily: '₹3000-6000',
      lodging: 'Boutique hotels / homestays',
      food: 'Mix of local + some premium',
      transport: '3AC trains, occasional flights',
      activities: 'Guided tours, heritage tickets'
    },
    luxury: {
      daily: '₹8000+',
      lodging: 'Upscale resorts / heritage palaces',
      food: 'Fine dining, curated tastings',
      transport: 'Flights, 2AC/1AC rail, private car',
      activities: 'Private guides, wellness retreats'
    }
  },
  optimizer: [
    'Travel overnight to save lodging cost',
    'Cluster nearby regions to reduce transit spend',
    'Use prepaid data SIM for app-based transport savings',
    'Eat main meal at lunch when prices can be lower'
  ]
};

export const heuristics = {
  intentKeywords: {
    destination: ['go to', 'visit', 'destination', 'place', 'where', 'itinerary'],
    festival: ['festival', 'diwali', 'holi', 'celebration', 'event'],
    budget: ['budget', 'cost', 'price', 'expense', 'spend'],
    cuisine: ['food', 'dish', 'eat', 'cuisine', 'restaurant'],
    weather: ['weather', 'temperature', 'climate', 'season'],
    transport: ['train', 'flight', 'bus', 'transport', 'how to get'],
    tips: ['tip', 'advice', 'safety', 'plan', 'optimize']
  }
};

export const fallbackPhrases = [
  "I can break that down further—are you asking about destinations, budgeting, logistics, or culture?",
  "Could you clarify your priority: scenery, culture immersion, food, adventure, or relaxation?",
  "Tell me roughly how many days and your budget style so I can tailor better."
];
