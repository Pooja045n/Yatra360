import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Loader from '../components/Loader';
import './BudgetSummary.css';

const BudgetSummary = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlanAndSummary();
  }, [id]);

  const fetchPlanAndSummary = async () => {
    try {
      setLoading(true);
      const [planResponse, summaryResponse] = await Promise.all([
        axios.get(`http://localhost:5000/api/planner/${id}`),
        axios.get(`http://localhost:5000/api/planner/${id}/summary`)
      ]);
      
      setPlan(planResponse.data);
      setSummary(summaryResponse.data);
    } catch (error) {
      console.error('Error fetching plan summary:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      accommodation: '🏨',
      transportation: '🚗',
      food: '🍽️',
      activities: '🎯',
      shopping: '🛍️',
      miscellaneous: '📦'
    };
    return icons[category] || '📦';
  };

  const getCategoryColor = (category) => {
    const colors = {
      accommodation: '#3182ce',
      transportation: '#805ad5',
      food: '#38a169',
      activities: '#ed8936',
      shopping: '#e53e3e',
      miscellaneous: '#718096'
    };
    return colors[category] || '#718096';
  };

  if (loading) return <Loader />;
  if (!plan || !summary) return <div className="error">Plan not found</div>;

  return (
    <div className="budget-summary-page">
      <div className="container">
        <button onClick={() => navigate(-1)} className="back-btn">
          ← Back to Budget Planner
        </button>

        <div className="summary-header">
          <h1>{plan.tripName}</h1>
          <div className="trip-info">
            <span>📍 {plan.destination}</span>
            <span>📅 {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}</span>
            <span className="status-badge">{plan.status}</span>
          </div>
        </div>

        <div className="overview-cards">
          <div className="overview-card">
            <h3>Total Budget</h3>
            <div className="amount">{plan.currency} {summary.totalBudgeted.toLocaleString()}</div>
          </div>
          
          <div className="overview-card">
            <h3>Total Spent</h3>
            <div className="amount spent">{plan.currency} {summary.totalSpent.toLocaleString()}</div>
          </div>
          
          <div className="overview-card">
            <h3>Remaining</h3>
            <div className={`amount ${summary.remainingBudget < 0 ? 'over-budget' : 'remaining'}`}>
              {plan.currency} {summary.remainingBudget.toLocaleString()}
            </div>
          </div>
          
          <div className="overview-card">
            <h3>Budget Used</h3>
            <div className="percentage">{summary.percentageUsed}%</div>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${Math.min(summary.percentageUsed, 100)}%`,
                  backgroundColor: summary.percentageUsed > 100 ? '#e53e3e' : '#48bb78'
                }}
              ></div>
            </div>
          </div>
        </div>

        <div className="categories-section">
          <h2>Category Breakdown</h2>
          <div className="categories-grid">
            {Object.entries(summary.categoryBreakdown).map(([category, data]) => (
              <div key={category} className="category-card">
                <div className="category-header">
                  <span className="category-icon">{getCategoryIcon(category)}</span>
                  <h4>{category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                </div>
                
                <div className="category-amounts">
                  <div className="amount-row">
                    <span>Budgeted:</span>
                    <span>{plan.currency} {data.budgeted.toLocaleString()}</span>
                  </div>
                  <div className="amount-row">
                    <span>Spent:</span>
                    <span className="spent">{plan.currency} {data.spent.toLocaleString()}</span>
                  </div>
                  <div className="amount-row">
                    <span>Remaining:</span>
                    <span className={data.remaining < 0 ? 'over-budget' : 'remaining'}>
                      {plan.currency} {data.remaining.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="category-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${Math.min(data.percentageUsed, 100)}%`,
                        backgroundColor: getCategoryColor(category)
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">{data.percentageUsed}% used</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {plan.expenses && plan.expenses.length > 0 && (
          <div className="expenses-section">
            <h2>Recent Expenses</h2>
            <div className="expenses-list">
              {plan.expenses.slice(-10).reverse().map((expense, index) => (
                <div key={index} className="expense-item">
                  <div className="expense-icon">
                    {getCategoryIcon(expense.category)}
                  </div>
                  <div className="expense-details">
                    <h5>{expense.description}</h5>
                    <p>{expense.category} • {expense.location || 'No location'}</p>
                    <span className="expense-date">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="expense-amount">
                    {plan.currency} {expense.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {summary.remainingBudget < 0 && (
          <div className="warning-banner">
            <h3>⚠️ Over Budget Alert</h3>
            <p>You have exceeded your budget by {plan.currency} {Math.abs(summary.remainingBudget).toLocaleString()}. Consider adjusting your spending or increasing your budget.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BudgetSummary;
