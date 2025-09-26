import React, { useState, useEffect } from 'react';
import { useAnalytics } from '../services/analytics';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import './BudgetPlanner.css';

const BudgetPlanner = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(null);

  const [newPlan, setNewPlan] = useState({
    tripName: '',
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    currency: 'INR',
    categories: {
      accommodation: { budgeted: 0, spent: 0 },
      transportation: { budgeted: 0, spent: 0 },
      food: { budgeted: 0, spent: 0 },
      activities: { budgeted: 0, spent: 0 },
      shopping: { budgeted: 0, spent: 0 },
      miscellaneous: { budgeted: 0, spent: 0 }
    }
  });

  const [newExpense, setNewExpense] = useState({
    description: '',
    amount: '',
    category: 'miscellaneous',
    date: '',
    location: ''
  });
  const { post: track } = useAnalytics();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      // Replace with actual user ID from auth
      const userId = '66b1234567890abcdef12345';
      const response = await axios.get(`http://localhost:5000/api/planner?userId=${userId}`);
      setPlans(response.data);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        ...newPlan,
        userId: '66b1234567890abcdef12345', // Replace with actual user ID
        totalBudget: parseFloat(newPlan.totalBudget)
      };

      if (editingPlan) {
        await axios.put(`http://localhost:5000/api/planner/${editingPlan._id}`, planData);
      } else {
        const res = await axios.post('http://localhost:5000/api/planner', planData);
        // Analytics: budget created
        track('budget_created', { planId: res.data?._id || 'unknown', destination: planData.destination }, 'budget_planner');
      }

      setShowCreateModal(false);
      setEditingPlan(null);
      setNewPlan({
        tripName: '',
        destination: '',
        startDate: '',
        endDate: '',
        totalBudget: '',
        currency: 'INR',
        categories: {
          accommodation: { budgeted: 0, spent: 0 },
          transportation: { budgeted: 0, spent: 0 },
          food: { budgeted: 0, spent: 0 },
          activities: { budgeted: 0, spent: 0 },
          shopping: { budgeted: 0, spent: 0 },
          miscellaneous: { budgeted: 0, spent: 0 }
        }
      });
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      alert('Failed to save plan. Please try again.');
    }
  };

  const handleDeletePlan = async (planId) => {
    if (window.confirm('Are you sure you want to delete this plan?')) {
      try {
        await axios.delete(`http://localhost:5000/api/planner/${planId}`);
        fetchPlans();
      } catch (error) {
        console.error('Error deleting plan:', error);
        alert('Failed to delete plan. Please try again.');
      }
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      const expenseData = {
        ...newExpense,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date || new Date().toISOString().split('T')[0]
      };

      await axios.post(`http://localhost:5000/api/planner/${showExpenseModal}/expenses`, expenseData);
      
      setShowExpenseModal(null);
      setNewExpense({
        description: '',
        amount: '',
        category: 'miscellaneous',
        date: '',
        location: ''
      });
      fetchPlans();
    } catch (error) {
      console.error('Error adding expense:', error);
      alert('Failed to add expense. Please try again.');
    }
  };

  const openEditModal = (plan) => {
    setEditingPlan(plan);
    setNewPlan({
      tripName: plan.tripName,
      destination: plan.destination,
      startDate: plan.startDate.split('T')[0],
      endDate: plan.endDate.split('T')[0],
      totalBudget: plan.totalBudget.toString(),
      currency: plan.currency,
      categories: plan.categories
    });
    setShowCreateModal(true);
  };

  const getTotalSpent = (plan) => {
    return Object.values(plan.categories).reduce((total, cat) => total + cat.spent, 0);
  };

  const getProgressPercentage = (plan) => {
    const totalSpent = getTotalSpent(plan);
    return plan.totalBudget > 0 ? (totalSpent / plan.totalBudget * 100).toFixed(1) : 0;
  };

  if (loading) return <Loader />;

  return (
    <div className="budget-planner-page">
      <div className="container">
        <div className="header">
          <h1>Budget Planner</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="create-plan-btn"
          >
            + Create New Plan
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="empty-state">
            <h3>No budget plans yet</h3>
            <p>Create your first budget plan to start tracking your travel expenses.</p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="create-plan-btn"
            >
              Create Your First Plan
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan) => (
              <div key={plan._id} className="plan-card">
                <div className="plan-header">
                  <h3>{plan.tripName}</h3>
                  <span className="status-badge">{plan.status}</span>
                </div>

                <div className="plan-details">
                  <p><strong>📍 Destination:</strong> {plan.destination}</p>
                  <p><strong>📅 Dates:</strong> {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</p>
                  <p><strong>💰 Budget:</strong> {plan.currency} {plan.totalBudget.toLocaleString()}</p>
                  <p><strong>💸 Spent:</strong> {plan.currency} {getTotalSpent(plan).toLocaleString()}</p>
                </div>

                <div className="progress-section">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${Math.min(getProgressPercentage(plan), 100)}%` }}
                    ></div>
                  </div>
                  <span className="progress-text">{getProgressPercentage(plan)}% used</span>
                </div>

                <div className="plan-actions">
                  <Link to={`/planner/${plan._id}/summary`} className="view-summary-btn">
                    View Summary
                  </Link>
                  <button 
                    onClick={() => setShowExpenseModal(plan._id)}
                    className="add-expense-btn"
                  >
                    Add Expense
                  </button>
                  <button 
                    onClick={() => openEditModal(plan)}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDeletePlan(plan._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create/Edit Plan Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingPlan ? 'Edit Plan' : 'Create New Budget Plan'}</h2>
                <button onClick={() => setShowCreateModal(false)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleCreatePlan} className="plan-form">
                <div className="form-group">
                  <label>Trip Name</label>
                  <input
                    type="text"
                    value={newPlan.tripName}
                    onChange={(e) => setNewPlan({...newPlan, tripName: e.target.value})}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Destination</label>
                  <input
                    type="text"
                    value={newPlan.destination}
                    onChange={(e) => setNewPlan({...newPlan, destination: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <input
                      type="date"
                      value={newPlan.startDate}
                      onChange={(e) => setNewPlan({...newPlan, startDate: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      value={newPlan.endDate}
                      onChange={(e) => setNewPlan({...newPlan, endDate: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Total Budget</label>
                    <input
                      type="number"
                      value={newPlan.totalBudget}
                      onChange={(e) => setNewPlan({...newPlan, totalBudget: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Currency</label>
                    <select
                      value={newPlan.currency}
                      onChange={(e) => setNewPlan({...newPlan, currency: e.target.value})}
                    >
                      <option value="INR">INR</option>
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                    </select>
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowCreateModal(false)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    {editingPlan ? 'Update Plan' : 'Create Plan'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Expense Modal */}
        {showExpenseModal && (
          <div className="modal-overlay" onClick={() => setShowExpenseModal(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Add Expense</h2>
                <button onClick={() => setShowExpenseModal(null)} className="close-btn">×</button>
              </div>

              <form onSubmit={handleAddExpense} className="expense-form">
                <div className="form-group">
                  <label>Description</label>
                  <input
                    type="text"
                    value={newExpense.description}
                    onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Category</label>
                    <select
                      value={newExpense.category}
                      onChange={(e) => setNewExpense({...newExpense, category: e.target.value})}
                    >
                      <option value="accommodation">Accommodation</option>
                      <option value="transportation">Transportation</option>
                      <option value="food">Food</option>
                      <option value="activities">Activities</option>
                      <option value="shopping">Shopping</option>
                      <option value="miscellaneous">Miscellaneous</option>
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Date</label>
                    <input
                      type="date"
                      value={newExpense.date}
                      onChange={(e) => setNewExpense({...newExpense, date: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      value={newExpense.location}
                      onChange={(e) => setNewExpense({...newExpense, location: e.target.value})}
                    />
                  </div>
                </div>

                <div className="modal-actions">
                  <button type="button" onClick={() => setShowExpenseModal(null)} className="cancel-btn">
                    Cancel
                  </button>
                  <button type="submit" className="save-btn">
                    Add Expense
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetPlanner;