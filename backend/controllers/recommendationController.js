const mongoose = require('mongoose');
const Interaction = require('../models/Interaction');
const Place = require('../models/Place');

// Simple feature extractor for content-based similarity
function extractPlaceFeatures(place) {
  const tokens = [];
  if (!place) return tokens;
  if (place.category) tokens.push(place.category.toLowerCase());
  if (place.state) tokens.push(place.state.toLowerCase());
  if (place.location) tokens.push(place.location.toLowerCase());
  if (place.description) {
    // lightweight: take top keywords (very naive)
    const words = place.description.toLowerCase().split(/[^a-zA-Z]+/).filter(Boolean);
    tokens.push(...words.slice(0, 20));
  }
  if (Array.isArray(place.accommodations)) tokens.push(...place.accommodations.map(s => String(s).toLowerCase()));
  if (Array.isArray(place.foods)) tokens.push(...place.foods.map(s => String(s).toLowerCase()));
  if (Array.isArray(place.transport)) tokens.push(...place.transport.map(s => String(s).toLowerCase()));
  return tokens;
}

function toVector(tokens) {
  const vec = new Map();
  for (const t of tokens) vec.set(t, (vec.get(t) || 0) + 1);
  return vec;
}

function cosineSim(vecA, vecB) {
  let dot = 0, a2 = 0, b2 = 0;
  for (const [, v] of vecA) a2 += v * v;
  for (const [, v] of vecB) b2 += v * v;
  const denom = Math.sqrt(a2) * Math.sqrt(b2) || 1;
  for (const [k, v] of vecA) if (vecB.has(k)) dot += v * vecB.get(k);
  return dot / denom;
}

// POST /api/recommendations/interactions
// Now derives userId from req.user (auth middleware) instead of trusting client body
// Like / bookmark / rate are idempotent (upsert) while 'view' creates a new document (stores multiple views)
exports.recordInteraction = async (req, res) => {
  try {
    const authUserId = req.user?.id;
    if (!authUserId) return res.status(401).json({ message: 'Unauthorized' });

    let { itemType, itemId, action, value, metadata } = req.body;
    if (!itemType || !itemId || !action) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Normalize ObjectId fields
    try {
      itemId = new mongoose.Types.ObjectId(itemId);
    } catch (e) {
      return res.status(400).json({ message: 'Invalid itemId' });
    }

    const allowedActions = ['view', 'like', 'bookmark', 'rate'];
    if (!allowedActions.includes(action)) {
      return res.status(400).json({ message: 'Unsupported action' });
    }
    if (action === 'rate') {
      const num = Number(value);
      if (Number.isNaN(num) || num < 0 || num > 5) {
        return res.status(400).json({ message: 'Rating value must be 0-5' });
      }
      value = num;
    }

    let doc;
    if (action === 'view') {
      // store every view event (no upsert) for potential dwell-time / frequency modeling later
      doc = await Interaction.create({ userId: authUserId, itemType, itemId, action, value, metadata });
    } else {
      doc = await Interaction.findOneAndUpdate(
        { userId: authUserId, itemType, itemId, action },
        { $set: { value, metadata } },
        { new: true, upsert: true, setDefaultsOnInsert: true }
      );
    }
    res.status(201).json(doc);
  } catch (err) {
    console.error('recordInteraction error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

async function getContentBased(userId, limit) {
  // Get user positive interactions on places
  const posActions = ['like', 'bookmark', 'rate'];
  const interactions = await Interaction.find({ userId, itemType: 'place', action: { $in: posActions } })
    .sort({ createdAt: -1 }).limit(100);
  const placeIds = interactions.map(i => i.itemId);

  const [likedPlaces, allPlaces] = await Promise.all([
    Place.find({ _id: { $in: placeIds } }),
    Place.find()
  ]);

  // Build user preference vector
  const userTokens = likedPlaces.flatMap(extractPlaceFeatures);
  const userVec = toVector(userTokens);

  // Score all places not already liked/viewed
  const likedIdSet = new Set(placeIds.map(id => String(id)));
  const scored = allPlaces
    .filter(p => !likedIdSet.has(String(p._id)))
    .map(p => {
      const vec = toVector(extractPlaceFeatures(p));
      return { place: p, score: cosineSim(userVec, vec) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ place, score }) => ({
      id: place._id,
      type: 'content',
      destination: `${place.name}, ${place.state}`,
      title: place.category || 'Recommended Place',
      description: place.description || '',
      image: '🎯',
      confidence: Math.max(0, Math.min(score, 1)),
      details: {
        bestTime: undefined,
        duration: undefined,
        budget: undefined,
        highlights: place.accommodations?.slice(0, 3) || []
      }
    }));

  return scored;
}

// GET /api/recommendations/content?limit=10 (userId derived from token unless explicitly provided for debugging)
exports.contentBased = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const limit = parseInt(req.query.limit || '10', 10);
    if (!userId) return res.status(400).json({ message: 'user context required' });
    const data = await getContentBased(userId, limit);
    res.json(data);
  } catch (err) {
    console.error('contentBased error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

async function getCollaborative(userId, limit) {
  // Simple item-item collaborative filtering using co-occurrence counts
  const posActions = ['like', 'bookmark', 'rate'];

  // Get user positive items
  const userItems = await Interaction.find({ userId, itemType: 'place', action: { $in: posActions } })
    .distinct('itemId');
  if (userItems.length === 0) return [];

  // Find other interactions for those items
  const others = await Interaction.aggregate([
    { $match: { itemType: 'place', action: { $in: posActions }, itemId: { $in: userItems } } },
    { $group: { _id: { userId: '$userId', itemId: '$itemId' } } },
    { $group: { _id: '$_id.userId', items: { $addToSet: '$_id.itemId' } } }
  ]);

  // Build co-occurrence counts for items
  const coCounts = new Map();
  for (const row of others) {
    const items = row.items.map(id => String(id));
    for (let i = 0; i < items.length; i++) {
      for (let j = 0; j < items.length; j++) {
        if (i === j) continue;
        const key = `${items[i]}|${items[j]}`;
        coCounts.set(key, (coCounts.get(key) || 0) + 1);
      }
    }
  }

  // Score candidates not yet in user's set
  const userSet = new Set(userItems.map(id => String(id)));
  const candidateScores = new Map();
  for (const [key, cnt] of coCounts) {
    const [src, dst] = key.split('|');
    if (userSet.has(dst)) continue; // already interacted
    candidateScores.set(dst, (candidateScores.get(dst) || 0) + cnt);
  }

  const sorted = [...candidateScores.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit);
  const ids = sorted.map(([id]) => new mongoose.Types.ObjectId(id));
  const places = await Place.find({ _id: { $in: ids } });
  const placeById = new Map(places.map(p => [String(p._id), p]));

  const results = sorted.map(([id, score]) => {
    const p = placeById.get(id);
    if (!p) return null;
    return {
      id: p._id,
      type: 'collaborative',
      destination: `${p.name}, ${p.state}`,
      title: p.category || 'Popular Among Similar Users',
      description: p.description || '',
      image: '👥',
      confidence: Math.min(0.99, 0.6 + Math.log10(1 + score) / 2),
      details: {
        highlights: p.accommodations?.slice(0, 3) || []
      }
    };
  }).filter(Boolean);

  return results;
}

// GET /api/recommendations/collaborative?limit=10 (userId from token)
exports.collaborative = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const limit = parseInt(req.query.limit || '10', 10);
    if (!userId) return res.status(400).json({ message: 'user context required' });
    const data = await getCollaborative(userId, limit);
    res.json(data);
  } catch (err) {
    console.error('collaborative error', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/recommendations/hybrid?limit=10 (userId from token)
exports.hybrid = async (req, res) => {
  try {
    const userId = req.query.userId || req.user?.id;
    const limit = parseInt(req.query.limit || '10', 10);
    if (!userId) return res.status(400).json({ message: 'user context required' });

    // Run both in parallel using helpers
    const [listA, listB] = await Promise.all([
      getContentBased(userId, limit),
      getCollaborative(userId, limit)
    ]);

    // Merge by destination id with weights
    const wContent = 0.6; const wCollab = 0.4;
    const map = new Map();
    for (const r of listA) map.set(String(r.id), { rec: r, score: (r.confidence || 0) * wContent });
    for (const r of listB) {
      const key = String(r.id);
      if (map.has(key)) map.get(key).score += (r.confidence || 0) * wCollab;
      else map.set(key, { rec: r, score: (r.confidence || 0) * wCollab });
    }
    const merged = [...map.values()]
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ rec, score }) => ({ ...rec, type: 'hybrid', confidence: Math.min(0.99, score) }));

    res.json(merged);
  } catch (err) {
    console.error('hybrid error', err);
    res.status(500).json({ message: 'Server error' });
  }
};
