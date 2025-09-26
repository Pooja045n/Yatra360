const mongoose = require('mongoose');

const budgetPlannerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tripName: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  totalBudget: { type: Number, required: true },
  currency: { type: String, default: 'INR' },
  categories: {
    accommodation: { 
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    transportation: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    food: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    activities: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    shopping: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    },
    miscellaneous: {
      budgeted: { type: Number, default: 0 },
      spent: { type: Number, default: 0 }
    }
  },
  expenses: [{
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    category: { type: String, required: true },
    date: { type: Date, default: Date.now },
    location: { type: String },
    receipt: { type: String } // URL to receipt image
  }],
  status: { type: String, enum: ['Planning', 'Active', 'Completed'], default: 'Planning' }
}, { timestamps: true });

module.exports = mongoose.model('BudgetPlanner', budgetPlannerSchema);
