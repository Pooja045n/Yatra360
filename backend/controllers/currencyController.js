const Currency = require('../models/Currency');

// Get all currency rates
exports.getAllRates = async (req, res) => {
  try {
    const { base, target } = req.query;
    let filter = {};

    if (base) filter.baseCurrency = base.toUpperCase();
    if (target) filter.targetCurrency = target.toUpperCase();

    const rates = await Currency.find(filter).sort({ lastUpdated: -1 });
    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get specific currency rate
exports.getRate = async (req, res) => {
  try {
    const { from, to } = req.params;
    
    const rate = await Currency.findOne({
      baseCurrency: from.toUpperCase(),
      targetCurrency: to.toUpperCase()
    }).sort({ lastUpdated: -1 });

    if (!rate) {
      return res.status(404).json({ error: 'Currency rate not found' });
    }

    res.json(rate);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Convert currency with alias & reciprocal fallback
exports.convertCurrency = async (req, res) => {
  try {
    let { from, to, amount } = req.query;

    if (!from || !to || !amount) {
      return res.status(400).json({ error: 'Missing required parameters: from, to, amount' });
    }

    // Normalize and alias (BAHT -> THB etc.)
    const aliases = {
      BAHT: 'THB',
      RUPEE: 'INR',
      YUAN: 'CNY',
      RENMINBI: 'CNY'
    };
    const normalize = (code) => {
      const upper = code.toUpperCase();
      return aliases[upper] || upper;
    };

    from = normalize(from);
    to = normalize(to);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return res.status(400).json({ error: 'Amount must be a positive number' });
    }

    // Try direct rate first
    let rate = await Currency.findOne({
      baseCurrency: from,
      targetCurrency: to
    }).sort({ lastUpdated: -1 });

    let usedReciprocal = false;
    let effectiveRate;
    let lastUpdated;

    if (rate) {
      effectiveRate = rate.exchangeRate;
      lastUpdated = rate.lastUpdated;
    } else {
      // Try reciprocal
      const inverse = await Currency.findOne({
        baseCurrency: to,
        targetCurrency: from
      }).sort({ lastUpdated: -1 });
      if (inverse) {
        effectiveRate = 1 / inverse.exchangeRate;
        lastUpdated = inverse.lastUpdated;
        usedReciprocal = true;
      }
    }

    if (!effectiveRate) {
      return res.status(404).json({ error: `Exchange rate not found for ${from} -> ${to}` });
    }

    const convertedAmount = numericAmount * effectiveRate;

    res.json({
      from,
      to,
      originalAmount: numericAmount,
      exchangeRate: parseFloat(effectiveRate.toFixed(6)),
      convertedAmount: parseFloat(convertedAmount.toFixed(2)),
      lastUpdated,
      via: usedReciprocal ? 'reciprocal' : 'direct'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add or update currency rate
exports.updateRate = async (req, res) => {
  try {
    const { baseCurrency, targetCurrency, exchangeRate } = req.body;

    const filter = {
      baseCurrency: baseCurrency.toUpperCase(),
      targetCurrency: targetCurrency.toUpperCase()
    };

    const update = {
      ...filter,
      exchangeRate,
      lastUpdated: new Date()
    };

    const rate = await Currency.findOneAndUpdate(
      filter,
      update,
      { new: true, upsert: true, runValidators: true }
    );

    res.json(rate);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get popular currency pairs
exports.getPopularPairs = async (req, res) => {
  try {
    const popularPairs = [
      'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'
    ];

    const rates = await Currency.find({
      baseCurrency: 'INR',
      targetCurrency: { $in: popularPairs }
    }).sort({ lastUpdated: -1 });

    res.json(rates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Initialize common currency rates (for setup) with reciprocal auto-generation
exports.initializeRates = async (req, res) => {
  try {
    const seedPairs = [
      { baseCurrency: 'INR', targetCurrency: 'USD', exchangeRate: 0.012 },
      { baseCurrency: 'INR', targetCurrency: 'EUR', exchangeRate: 0.011 },
      { baseCurrency: 'INR', targetCurrency: 'GBP', exchangeRate: 0.0095 },
      { baseCurrency: 'INR', targetCurrency: 'JPY', exchangeRate: 1.75 },
      { baseCurrency: 'INR', targetCurrency: 'AUD', exchangeRate: 0.018 },
      { baseCurrency: 'INR', targetCurrency: 'THB', exchangeRate: 0.43 } // Added Thai Baht
    ];

    const allToProcess = [];
    const now = new Date();

    // Push direct pairs and reciprocals
    for (const p of seedPairs) {
      allToProcess.push(p);
      // create reciprocal if meaningful and rate > 0
      if (p.exchangeRate && p.exchangeRate > 0) {
        const reciprocal = {
          baseCurrency: p.targetCurrency,
            targetCurrency: p.baseCurrency,
          exchangeRate: parseFloat((1 / p.exchangeRate).toFixed(6))
        };
        allToProcess.push(reciprocal);
      }
    }

    const results = [];
    for (const rateData of allToProcess) {
      const filter = {
        baseCurrency: rateData.baseCurrency,
        targetCurrency: rateData.targetCurrency
      };
      const rate = await Currency.findOneAndUpdate(
        filter,
        { ...rateData, lastUpdated: now },
        { new: true, upsert: true }
      );
      results.push(rate);
    }

    res.json({ message: 'Currency rates (with reciprocals) initialized', count: results.length, rates: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
