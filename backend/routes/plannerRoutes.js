const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');

// Get all budget plans (with user filter)
router.get('/', plannerController.getAllPlans);

// Get single budget plan
router.get('/:id', plannerController.getPlanById);

// Get budget summary
router.get('/:id/summary', plannerController.getBudgetSummary);

// Create new budget plan
router.post('/', plannerController.createPlan);

// Update budget plan
router.put('/:id', plannerController.updatePlan);

// Add expense to budget plan
router.post('/:id/expenses', plannerController.addExpense);

// Delete budget plan
router.delete('/:id', plannerController.deletePlan);

module.exports = router;
