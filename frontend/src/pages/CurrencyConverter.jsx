import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Loader from '../components/Loader';
import './CurrencyConverter.css';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('');
  const [fromCurrency, setFromCurrency] = useState('INR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [popularRates, setPopularRates] = useState([]);
  const [allRates, setAllRates] = useState([]);
  const [ratesLoading, setRatesLoading] = useState(true);

  const commonCurrencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
    { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
    { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
     { code: 'THB', name: 'Thai Baht', symbol: '฿' } // Updated Baht support
  ];

  useEffect(() => {
    fetchPopularRates();
    fetchAllRates();
  }, []);

  const fetchPopularRates = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/currency/popular');
      setPopularRates(response.data);
    } catch (error) {
      console.error('Error fetching popular rates:', error);
    }
  };

  const fetchAllRates = async () => {
    try {
      setRatesLoading(true);
      const response = await axios.get('http://localhost:5000/api/currency');
      setAllRates(response.data);
    } catch (error) {
      console.error('Error fetching all rates:', error);
    } finally {
      setRatesLoading(false);
    }
  };

  const handleConvert = async (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5000/api/currency/convert', {
        params: { from: fromCurrency, to: toCurrency, amount }
      });
      setResult(response.data);
    } catch (error) {
      console.error('Error converting currency:', error);
        const apiMessage = error?.response?.data?.error;
        alert(apiMessage || 'Failed to convert currency. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
  };

  const getCurrencySymbol = (currencyCode) => {
    const currency = commonCurrencies.find(c => c.code === currencyCode);
    return currency ? currency.symbol : currencyCode;
  };

  const initializeRates = async () => {
    try {
      await axios.post('http://localhost:5000/api/currency/initialize');
      fetchPopularRates();
      fetchAllRates();
      alert('Currency rates initialized successfully!');
    } catch (error) {
      console.error('Error initializing rates:', error);
      alert('Failed to initialize rates. Please try again.');
    }
  };

  return (
    <div className="currency-converter-page">
      <div className="container">
        <div className="header">
          <h1>Currency Converter</h1>
          <p>Convert between different currencies with real-time exchange rates</p>
        </div>

        <div className="converter-section">
          <div className="converter-card">
            <h2>Convert Currency</h2>
            
            <form onSubmit={handleConvert} className="converter-form">
              <div className="amount-input">
                <label>Amount</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount to convert"
                  required
                />
              </div>

              <div className="currency-row">
                <div className="currency-select">
                  <label>From</label>
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value)}
                  >
                    {commonCurrencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>

                <button 
                  type="button" 
                  onClick={swapCurrencies}
                  className="swap-btn"
                  title="Swap currencies"
                >
                  ⇄
                </button>

                <div className="currency-select">
                  <label>To</label>
                  <select
                    value={toCurrency}
                    onChange={(e) => setToCurrency(e.target.value)}
                  >
                    {commonCurrencies.map((currency) => (
                      <option key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button type="submit" className="convert-btn" disabled={loading}>
                {loading ? 'Converting...' : 'Convert'}
              </button>
            </form>

            {result && (
              <div className="result-section">
                <div className="result-card">
                  <div className="conversion-result">
                    <div className="from-amount">
                      {getCurrencySymbol(result.from)} {result.originalAmount.toLocaleString()}
                    </div>
                    <div className="equals">equals</div>
                    <div className="to-amount">
                      {getCurrencySymbol(result.to)} {result.convertedAmount.toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="exchange-rate">
                    <p>Exchange Rate: 1 {result.from} = {result.exchangeRate} {result.to}</p>
                    <p className="last-updated">
                      Last updated: {new Date(result.lastUpdated).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rates-section">
          <div className="popular-rates">
            <h2>Popular Exchange Rates</h2>
            {popularRates.length === 0 ? (
              <div className="no-rates">
                <p>No exchange rates available.</p>
                <button onClick={initializeRates} className="init-btn">
                  Initialize Default Rates
                </button>
              </div>
            ) : (
              <div className="rates-grid">
                {popularRates.map((rate, index) => (
                  <div key={index} className="rate-card">
                    <div className="rate-pair">
                      {rate.baseCurrency} → {rate.targetCurrency}
                    </div>
                    <div className="rate-value">
                      {rate.exchangeRate.toFixed(4)}
                    </div>
                    <div className="rate-updated">
                      Updated: {new Date(rate.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="all-rates">
            <h2>All Exchange Rates</h2>
            {ratesLoading ? (
              <Loader />
            ) : allRates.length === 0 ? (
              <div className="no-rates">
                <p>No exchange rates available in the database.</p>
                <button onClick={initializeRates} className="init-btn">
                  Initialize Default Rates
                </button>
              </div>
            ) : (
              <div className="rates-table">
                <div className="table-header">
                  <div>From</div>
                  <div>To</div>
                  <div>Rate</div>
                  <div>Last Updated</div>
                </div>
                <div className="table-body">
                  {allRates.map((rate, index) => (
                    <div key={index} className="table-row">
                      <div>{rate.baseCurrency}</div>
                      <div>{rate.targetCurrency}</div>
                      <div>{rate.exchangeRate.toFixed(4)}</div>
                      <div>{new Date(rate.lastUpdated).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
