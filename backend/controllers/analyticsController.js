const AnalyticsEvent = require('../models/AnalyticsEvent');

exports.record = async (req, res) => {
  try {
    const { eventType, metadata, context, sessionId } = req.body;
    const userId = req.user?.id || req.body.userId || null;
    if (!eventType) return res.status(400).json({ message: 'eventType required' });
    const ev = await AnalyticsEvent.create({ eventType, metadata, context, sessionId, userId });
    res.status(201).json({ id: ev._id });
  } catch (e) {
    res.status(500).json({ message: 'Failed to record event' });
  }
};

// Summary with date range, unique-user metrics and adoption/usage rates
exports.summary = async (req, res) => {
  try {
    const { from, to } = req.query;

    // Build createdAt range filter if provided
    const range = {};
    if (from || to) {
      range.createdAt = {};
      if (from) {
        const fromDate = new Date(from);
        if (!isNaN(fromDate)) range.createdAt.$gte = fromDate;
      }
      if (to) {
        const toDate = new Date(to);
        if (!isNaN(toDate)) range.createdAt.$lte = toDate;
      }
      if (Object.keys(range.createdAt).length === 0) delete range.createdAt;
    }

    // Event-specific filters
    const base = { ...range };
    const withUser = (f) => ({ ...f, userId: { $ne: null } });

    const filters = {
      impressions: { eventType: 'rec_impression', ...base },
      clicks: { eventType: 'rec_click', ...base },
      budgets: { eventType: 'budget_created', ...base },
      connects: { eventType: 'connect_clicked', ...base },
      any: { ...base },
      recAny: { eventType: { $in: ['rec_impression', 'rec_click'] }, ...base }
    };

    // Counts
    const [impressions, clicks, budgets, connects] = await Promise.all([
      AnalyticsEvent.countDocuments(filters.impressions),
      AnalyticsEvent.countDocuments(filters.clicks),
      AnalyticsEvent.countDocuments(filters.budgets),
      AnalyticsEvent.countDocuments(filters.connects)
    ]);

    // Unique users per event category and overall
    const [
      uniqueUsersAll,
      uniqueBudgetUsers,
      uniqueConnectUsers,
      uniqueRecUsers,
      uniqueClickUsers
    ] = await Promise.all([
      AnalyticsEvent.distinct('userId', withUser(filters.any)),
      AnalyticsEvent.distinct('userId', withUser(filters.budgets)),
      AnalyticsEvent.distinct('userId', withUser(filters.connects)),
      AnalyticsEvent.distinct('userId', withUser(filters.recAny)),
      AnalyticsEvent.distinct('userId', withUser(filters.clicks))
    ]);

    const totalUniqueUsers = uniqueUsersAll.length;
    const budgetAdoptionPct = totalUniqueUsers > 0
      ? +((uniqueBudgetUsers.length / totalUniqueUsers) * 100).toFixed(2)
      : 0;
    const connectUsagePct = totalUniqueUsers > 0
      ? +((uniqueConnectUsers.length / totalUniqueUsers) * 100).toFixed(2)
      : 0;
    const ctr = impressions > 0 ? +((clicks / impressions) * 100).toFixed(2) : 0;

    res.json({
      from: from || null,
      to: to || null,
      impressions,
      clicks,
      ctr,
      budgets,
      connects,
      uniqueUsers: totalUniqueUsers,
      uniqueBudgetUsers: uniqueBudgetUsers.length,
      uniqueConnectUsers: uniqueConnectUsers.length,
      uniqueRecUsers: uniqueRecUsers.length,
      uniqueClickUsers: uniqueClickUsers.length,
      budgetAdoptionPct,
      connectUsagePct
    });
  } catch (e) {
    res.status(500).json({ message: 'Failed to get summary' });
  }
};
