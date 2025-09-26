const BudgetPlanner = require('../models/BudgetPlanner');

// Get all budget plans for a user
exports.getAllPlans = async (req, res) => {
  try {
    const { userId } = req.query;
    let filter = {};
    
    if (userId) filter.userId = userId;

    const plans = await BudgetPlanner.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });

    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get single budget plan
exports.getPlanById = async (req, res) => {
  try {
    const plan = await BudgetPlanner.findById(req.params.id)
      .populate('userId', 'name email');

    if (!plan) {
      return res.status(404).json({ error: 'Budget plan not found' });
    }

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Create new budget plan
exports.createPlan = async (req, res) => {
  try {
    const plan = new BudgetPlanner(req.body);
    const savedPlan = await plan.save();
    res.status(201).json(savedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update budget plan
exports.updatePlan = async (req, res) => {
  try {
    const updatedPlan = await BudgetPlanner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!updatedPlan) {
      return res.status(404).json({ error: 'Budget plan not found' });
    }

    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Add expense to budget plan
exports.addExpense = async (req, res) => {
  try {
    const plan = await BudgetPlanner.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Budget plan not found' });
    }

    plan.expenses.push(req.body);
    
    // Update spent amount in the category
    const category = req.body.category;
    if (plan.categories[category]) {
      plan.categories[category].spent += req.body.amount;
    }

    const updatedPlan = await plan.save();
    res.json(updatedPlan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get budget summary
exports.getBudgetSummary = async (req, res) => {
  try {
    const plan = await BudgetPlanner.findById(req.params.id);
    
    if (!plan) {
      return res.status(404).json({ error: 'Budget plan not found' });
    }

    const summary = {
      totalBudgeted: plan.totalBudget,
      totalSpent: 0,
      categoryBreakdown: {}
    };

    // Calculate totals
    Object.keys(plan.categories).forEach(category => {
      const cat = plan.categories[category];
      summary.totalSpent += cat.spent;
      summary.categoryBreakdown[category] = {
        budgeted: cat.budgeted,
        spent: cat.spent,
        remaining: cat.budgeted - cat.spent,
        percentageUsed: cat.budgeted > 0 ? (cat.spent / cat.budgeted * 100).toFixed(2) : 0
      };
    });

    summary.remainingBudget = plan.totalBudget - summary.totalSpent;
    summary.percentageUsed = (summary.totalSpent / plan.totalBudget * 100).toFixed(2);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete budget plan
exports.deletePlan = async (req, res) => {
  try {
    await BudgetPlanner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Budget plan deleted successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
