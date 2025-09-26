import { destinations, festivals as staticFestivals, cuisine, transportAdvice, budgeting, heuristics, fallbackPhrases } from './knowledgeBase';
import { loadPreferences } from './preferences';

// Lightweight NLP-ish helpers
function normalize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

function detectIntent(message) {
  const norm = normalize(message);
  const scores = {};
  for (const [intent, words] of Object.entries(heuristics.intentKeywords)) {
    scores[intent] = words.reduce((acc, w) => acc + (norm.includes(w) ? 1 : 0), 0);
  }
  const best = Object.entries(scores).sort((a,b)=>b[1]-a[1])[0];
  if (!best || best[1] === 0) return { intent: 'unknown', score: 0 };
  return { intent: best[0], score: best[1] };
}

function pickRandom(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

// Variation templates
const variation = {
  intro: [
    'Here\'s a detailed breakdown for you:',
    'Let\'s dive deeper – structured insights below:',
    'I\'ve organized the essentials:',
    'Comprehensive answer coming up:'
  ],
  outro: [
    'Want me to tailor this further? Provide days, budget, and interests.',
    'I can refine more—just tell me your timeframe & travel style.',
    'Ask for an itinerary sample and I\'ll draft day-by-day.',
    'Need more? I can compare regions or build a hybrid route.'
  ]
};

function formatList(title, items) {
  if (!items || items.length === 0) return '';
  return `\n**${title}:**\n• ${items.join('\n• ')}`;
}

function buildDestinationAnswer(query, prefs) {
  const norm = normalize(query);
  const match = destinations.find(d => norm.includes(d.key) || norm.includes(d.name.split(' ')[0].toLowerCase()));
  if (!match) {
    const summary = destinations.map(d=>`**${d.name}**: ${d.themes.slice(0,2).join(', ')} | Best: ${d.bestSeasons}`).join('\n');
    const prefLine = prefs?.interests?.length ? ` I\'ll bias towards ${prefs.interests.slice(0,3).join(', ')} once you choose.` : '';
    return `${pickRandom(variation.intro)}\nI can cover any of these regions in depth.${prefLine}\n\n${summary}\n\nTell me which one you want deeper info about (heritage focus? mountains? backwaters?)`;
  }
  let bias = '';
  if (prefs?.budgetTier && match.budgetRanges[prefs.budgetTier]) {
    bias += `\nPreferred Budget (${prefs.budgetTier}): ${match.budgetRanges[prefs.budgetTier]}`;
  }
  if (prefs?.interests?.length) {
    const overlap = match.themes.filter(t => prefs.interests.includes(t));
    if (overlap.length) bias += `\nAligned Interests: ${overlap.join(', ')}`;
  }
  return `${pickRandom(variation.intro)}\n**${match.name}**\nBest Season: ${match.bestSeasons}\nThemes: ${match.themes.join(', ')}${formatList('Highlights', match.highlights)}${formatList('Local Dishes', match.localDishes)}\n**Budget Ranges:**\n• Shoestring: ${match.budgetRanges.shoestring}\n• Mid: ${match.budgetRanges.mid}\n• Luxury: ${match.budgetRanges.luxury}${bias}${formatList('Travel Tips', match.tips)}\n\n${pickRandom(variation.outro)}`;
}

async function buildFestivalAnswer(query) {
  const norm = normalize(query);
  const festivals = await fetchFestivalsLive();
  const fest = festivals.find(f => norm.includes((f.key||'').toLowerCase()) || norm.includes((f.name||'').split(' ')[0].toLowerCase()));
  if (!fest) {
    const listing = festivals.map(f=>`**${f.name}** (${f.month || f.date || 'TBA'}) – Themes: ${(f.themes||[]).join(', ')}`).join('\n');
    return `${pickRandom(variation.intro)}\nMajor upcoming festivals:\n${listing}\n\nAsk about one for logistics, safety, and booking timing.`;
  }
  return `${pickRandom(variation.intro)}\n**${fest.name}** (${fest.month || fest.date || 'Date TBA'})\nThemes: ${(fest.themes||[]).join(', ')}${formatList('Core Experiences', fest.experiences || [])}${formatList('Travel Tips', fest.travelTips || [])}\n\nTiming your trip around ${fest.name}? I can help structure days around nearby attractions.`;
}

function buildBudgetAnswer(message, prefs) {
  const norm = normalize(message);
  let tier = null;
  if (/(cheap|low|shoestring|backpacker)/.test(norm)) tier = 'shoestring';
  else if (/(mid|moderate|balanced)/.test(norm)) tier = 'mid';
  else if (/(lux|expensive|premium)/.test(norm)) tier = 'luxury';

  const base = `${pickRandom(variation.intro)}\n**Budget Framework (per person per day)**\nShoestring: ${budgeting.tiers.shoestring.daily} | ${budgeting.tiers.shoestring.lodging}\nMid: ${budgeting.tiers.mid.daily} | ${budgeting.tiers.mid.lodging}\nLuxury: ${budgeting.tiers.luxury.daily} | ${budgeting.tiers.luxury.lodging}\n\nCost Optimizers:\n• ${budgeting.optimizer.join('\n• ')}`;

  if (tier) {
    const tData = budgeting.tiers[tier];
    return `${base}\n\nFocusing on **${tier}** travel:\nLodging: ${tData.lodging}\nFood: ${tData.food}\nTransport: ${tData.transport}\nActivities: ${tData.activities}\n\nGive me days + regions and I can approximate a total.`;
  }
  if (prefs?.budgetTier && budgeting.tiers[prefs.budgetTier]) {
    const pt = budgeting.tiers[prefs.budgetTier];
    return `${base}\n\nYour saved preference: **${prefs.budgetTier}** (Daily ${pt.daily}). Provide days + regions for a rough total.`;
  }
  return `${base}\n\nTell me which tier you lean toward or set one (e.g., \"set budget mid\") then give regions + duration.`;
}

function buildCuisineAnswer(message) {
  const norm = normalize(message);
  const keys = Object.keys(cuisine.regions);
  const matchKey = keys.find(k => norm.includes(k));
  if (matchKey) {
    const r = cuisine.regions[matchKey];
    return `${pickRandom(variation.intro)}\n**${matchKey.toUpperCase()} Cuisine**\nStaples: ${r.staples.join(', ')}\nSignature Dishes: ${r.signature.join(', ')}\nNotes: ${r.notes}\n\nAsk for a sample tasting day or vegetarian focus if needed.`;
  }
  // Comparison view
  return `${pickRandom(variation.intro)}\nRegional flavor map:\n${keys.map(k=>`• ${k.toUpperCase()}: ${cuisine.regions[k].signature.slice(0,2).join(', ')} (${cuisine.regions[k].notes.split(',')[0]})`).join('\n')}\n\nName a region for deeper dish breakdown or ask for dietary adaptation tips.`;
}

async function buildWeatherAnswer(message) {
  const match = message.match(/weather\s+(in|for)\s+([a-zA-Z\s]+)/i);
  let city = null;
  if (match) city = match[2].trim();
  const data = await fetchWeather(city);
  const live = data ? `Current (approx) ${data.city}: ${data.tempC}°C, ${data.condition}, Humidity ${data.humidity}%` : 'Provide a city for a spot estimate.';
  return `${pickRandom(variation.intro)}\nSeasonal model overview:\n• Nov-Feb: Peak comfort (dry, cool North, mild South)\n• Mar-May: Heat builds (choose mountains / coastal breezes)\n• Jun-Sep: Monsoon (lush, some disruption)\n\n${live}\nAsk for: best time <region>, monsoon avoidance, packing list.`;
}

function buildTransportAnswer(message) {
  const norm = normalize(message);
  if (/train|rail/.test(norm)) {
    return `${pickRandom(variation.intro)}\n**Indian Rail Travel**\nBooking: ${transportAdvice.trains.booking}\nClasses: ${transportAdvice.trains.classes.join(', ')}\nTips: ${transportAdvice.trains.tips.join('; ')}\n\nAsk for sample overnight route suggestions.`;
  }
  if (/flight|air/.test(norm)) {
    return `${pickRandom(variation.intro)}\n**Domestic Flights**\nBooking: ${transportAdvice.flights.booking}\nTips: ${transportAdvice.flights.tips.join('; ')}\n\nProvide origin + target region for fare strategy guidance.`;
  }
  if (/bus/.test(norm)) {
    return `${pickRandom(variation.intro)}\n**Intercity Buses**\nBooking: ${transportAdvice.buses.booking}\nTips: ${transportAdvice.buses.tips.join('; ')}\n\nMention source/destination for comfort vs cost suggestions.`;
  }
  return `${pickRandom(variation.intro)}\nUrban & long-distance modes:\n• ${transportAdvice.local.modes.join('\n• ')}\nTips: ${transportAdvice.local.tips.join('; ')}\n\nSay: train vs flight for <city pair>? Or best hill route?`;
}

function buildTipsAnswer(message) {
  return `${pickRandom(variation.intro)}\nSmart planning levers:\n1. Cluster geographically to reduce transit fatigue\n2. Alternate intense cultural days with lighter nature days\n3. Lock festival weeks early for rail/air seats\n4. Balance metros + rural stays for diversity\n5. Keep 1 buffer day per 8 travel days\n\nGive me your days + interests; I can sketch a phased itinerary (arrival acclimatization, core loop, finale).`;
}

// Live data helpers
async function fetchWeather(city) { if (!city) return null; return { city, tempC: 30, condition: 'Partly Cloudy', humidity: 58 }; }
async function fetchCurrency(from='INR', to='USD', amount=1) { try { const res = await fetch(`/api/currency/convert?from=${from}&to=${to}&amount=${amount}`); if (!res.ok) return null; return res.json(); } catch { return null; } }
async function fetchFestivalsLive() { try { const res = await fetch('/api/festivals'); if (!res.ok) throw new Error('fail'); return res.json(); } catch { return staticFestivals; } }

// Itinerary skeleton generator
function buildItinerarySkeleton(days, regions, prefs) {
  if (!days || days < 1) return 'Need a valid number of days (e.g., "7 day itinerary Rajasthan").';
  if (!regions.length) return 'Specify at least one region after the days (e.g., "5 days Kerala").';
  const maxDays = Math.min(days, 30);
  const perRegion = Math.max(1, Math.floor(maxDays / regions.length));
  let remaining = maxDays;
  const segments = regions.map(r => { const alloc = Math.min(perRegion, remaining); remaining -= alloc; return { region: r, days: alloc }; });
  if (remaining > 0 && segments.length) segments[segments.length - 1].days += remaining;
  const lines = segments.map((seg,i) => `Segment ${i+1}: ${seg.region} (~${seg.days} day${seg.days>1?'s':''})`);
  const prefLine = prefs?.interests?.length ? `Interests guiding refinement: ${prefs.interests.join(', ')}` : '';
  return `Itinerary Skeleton (${maxDays} days)\n${lines.join('\n')}\n${prefLine}\nAsk: refine day 2 activities, add food focus, or adjust pacing.`;
}

export function generateRichResponse(userMessage, context) {
  const prefs = loadPreferences();
  const lower = userMessage.toLowerCase();
  // --- Currency parsing enhancement ---
  // Supports patterns like:
  //  convert rs.90 in us dollars
  //  convert 90 inr to usd
  //  90 inr in usd
  //  15 dollars to inr
  //  usd 15 to inr
  //  how much is 90 rupees in usd
  function normalizeCurrToken(tok){
    if(!tok) return null;
    const t = tok.replace(/[^a-z]/g,'').toLowerCase();
    if(['rs','inr','rupee','rupees','₹'].includes(t)) return 'INR';
    if(['usd','us','dollar','dollars','$'].includes(t)) return 'USD';
    if(['eur','euro','euros','€'].includes(t)) return 'EUR';
    if(['gbp','pound','pounds','£','sterling'].includes(t)) return 'GBP';
    if(['aud','australian','aussie'].includes(t)) return 'AUD';
    if(['cad','canadian'].includes(t)) return 'CAD';
    if(['jpy','yen','¥'].includes(t)) return 'JPY';
    return t.length===3 ? t.toUpperCase() : null;
  }
  function parseCurrencyQuery(text){
    const cleaned = text.toLowerCase().replace(/\/rs\.?/g,' rs ').replace(/\$/g,' usd ');
    // Attempt patterns
    // Pattern A: convert <cur?> <amount> (to|in) <target cur words>
    let m = cleaned.match(/convert\s+([a-z$₹]{0,4})?\s*(\d+(?:\.\d+)?)\s*(?:[a-z]{0,4})?\s*(?:to|in)\s+([a-z$₹\s]+)/);
    if(m){
      const prefix = normalizeCurrToken(m[1]);
      const amount = parseFloat(m[2]);
      const targetRaw = m[3].trim().split(/\s+/)[0];
      const target = normalizeCurrToken(targetRaw);
      if(amount && (prefix||target)){
        const from = prefix || 'INR';
        return {amount, from, to: target||'USD'};
      }
    }
    // Pattern B: how much is <amount> <from> in <to>
    m = cleaned.match(/how much is\s+(\d+(?:\.\d+)?)\s+([a-z$₹]+)\s+(?:to|in)\s+([a-z$₹]+)/);
    if(m){
      const amount = parseFloat(m[1]);
      const from = normalizeCurrToken(m[2]);
      const to = normalizeCurrToken(m[3]);
      if(amount && from && to) return {amount, from, to};
    }
    // Pattern C: <amount> <from> (to|in) <to>
    m = cleaned.match(/(\d+(?:\.\d+)?)\s+([a-z$₹]{2,})\s+(?:to|in)\s+([a-z$₹]+)/);
    if(m){
      const amount = parseFloat(m[1]);
      const from = normalizeCurrToken(m[2]);
      const to = normalizeCurrToken(m[3]);
      if(amount && from && to) return {amount, from, to};
    }
    // Pattern D: convert <amount><currency symbol/abbr> to <to>
    m = cleaned.match(/convert\s+(\d+(?:\.\d+)?)([a-z$₹]{2,})\s+(?:to|in)\s+([a-z$₹]+)/);
    if(m){
      const amount = parseFloat(m[1]);
      const from = normalizeCurrToken(m[2]);
      const to = normalizeCurrToken(m[3]);
      if(amount && from && to) return {amount, from, to};
    }
    return null;
  }
  const currencyQuery = parseCurrencyQuery(lower.replace(/rs\.?(\d)/g,'rs $1'));
  if(currencyQuery){
    const {amount, from, to} = currencyQuery;
    fetchCurrency(from, to, amount).then(result => {
      if(result && result.convertedAmount!==undefined){
        localStorage.setItem('lastCurrencyConversion', JSON.stringify(result));
      }
    });
    return `Converting ${amount} ${from} → ${to} ... (ask again or say "repeat conversion" to see cached result).`;
  }
  if(/repeat conversion/.test(lower)){
    try {
      const last = JSON.parse(localStorage.getItem('lastCurrencyConversion')||'null');
      if(last) return `Latest conversion: ${last.amount} ${last.from} = ${last.convertedAmount} ${last.to} (rate ${last.rate || last.conversionRate || 'n/a'})`;
    } catch {}
    return 'No recent conversion cached.';
  }
  // Preference setters
  if (/set budget (shoe|string|cheap|low)/.test(lower)) { prefs.budgetTier = 'shoestring'; localStorage.setItem('assistantPreferences', JSON.stringify(prefs)); return '✅ Budget preference set to shoestring.'; }
  if (/set budget (mid|moderate|middle)/.test(lower)) { prefs.budgetTier = 'mid'; localStorage.setItem('assistantPreferences', JSON.stringify(prefs)); return '✅ Budget preference set to mid.'; }
  if (/set budget (lux|premium|high)/.test(lower)) { prefs.budgetTier = 'luxury'; localStorage.setItem('assistantPreferences', JSON.stringify(prefs)); return '✅ Budget preference set to luxury.'; }
  if (/add interest /.test(lower)) {
    const list = lower.split('add interest ')[1].split(/[,.;]/).map(s=>s.trim()).filter(Boolean);
    const current = new Set(prefs.interests || []);
    list.forEach(i=>current.add(i));
    prefs.interests = [...current];
    localStorage.setItem('assistantPreferences', JSON.stringify(prefs));
    return `✅ Added interests: ${list.join(', ')}`;
  }

  // Itinerary generator pattern
  const itinMatch = lower.match(/(\d{1,2})\s*(day|days)\s*(?:itinerary|plan)?\s*(.*)/);
  if (itinMatch) {
    const days = parseInt(itinMatch[1],10);
    const regionString = itinMatch[3] || '';
    const regionTokens = regionString.split(/[,\s]+/).filter(Boolean).slice(0,4);
    return buildItinerarySkeleton(days, regionTokens, prefs);
  }

  // Currency conversion detection
  const currMatch = lower.match(/convert\s+(\d+(?:\.\d+)?)\s*([a-z]{3})\s*(?:to|in)\s*([a-z]{3})/);
  if (currMatch) {
    const amt = parseFloat(currMatch[1]);
    const from = currMatch[2].toUpperCase();
    const to = currMatch[3].toUpperCase();
    fetchCurrency(from, to, amt).then(result => { if (result && result.convertedAmount !== undefined) { localStorage.setItem('lastCurrencyConversion', JSON.stringify(result)); } });
    return `Fetching live conversion for ${amt} ${from} → ${to} ... (re-ask for result).`;
  }

  const { intent } = detectIntent(userMessage);
  switch (intent) {
    case 'destination': return buildDestinationAnswer(userMessage, prefs);
    case 'festival': return 'Loading festival details...'; // async enhancement placeholder
    case 'budget': return buildBudgetAnswer(userMessage, prefs);
    case 'cuisine': return buildCuisineAnswer(userMessage);
    case 'weather': return 'Retrieving weather model...';
    case 'transport': return buildTransportAnswer(userMessage);
    case 'tips': return buildTipsAnswer(userMessage);
    default:
      return `${pickRandom(variation.intro)}\n${pickRandom(fallbackPhrases)}`;
  }
}
