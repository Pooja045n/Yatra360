import React from 'react';
import { Link } from 'react-router-dom';

const StateCard = ({ state }) => {
  return (
    <div className="bg-white shadow-md rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300">
      <img
        src={state.image || `https://source.unsplash.com/400x200/?${state.name},landscape`}
        alt={state.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h2 className="text-xl font-semibold text-gray-800">{state.name}</h2>
        <p className="text-sm text-gray-500 mt-1">Capital: {state.capital}</p>
        <p className="text-sm text-gray-500 mt-1">Popular Cities: {state.popularCities?.join(', ')}</p>

        <Link
          to={`/state/${state._id}`}
          className="inline-block mt-4 text-white bg-blue-700 hover:bg-blue-800 px-4 py-2 rounded-xl text-sm font-medium transition"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default StateCard;
