import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const StateDetails = () => {
  const { stateId } = useParams();
  const [stateData, setStateData] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/regions/${stateId}`)
      .then(res => setStateData(res.data))
      .catch(err => console.error("Error fetching state:", err));
  }, [stateId]);

  if (!stateData) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-800 mb-4">{stateData.name}</h1>
      <p className="text-gray-600 mb-6">Capital: {stateData.capital}</p>

      {/* Popular Places */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Popular Places</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {stateData.places?.map(place => (
            <div key={place._id} className="bg-white p-4 shadow rounded-2xl">
              <img src={place.image} alt={place.name} className="w-full h-40 object-cover rounded-md mb-2" />
              <h3 className="text-lg font-semibold">{place.name}</h3>
              <p className="text-sm text-gray-600">{place.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Festivals */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Festivals</h2>
        <div className="grid md:grid-cols-3 gap-4">
          {stateData.festivals?.map(festival => (
            <div key={festival._id} className="bg-yellow-50 p-4 shadow rounded-2xl">
              <h3 className="text-lg font-semibold">{festival.name}</h3>
              <p className="text-sm text-gray-700">{festival.description}</p>
              <p className="text-xs text-gray-500 mt-1">Celebrated on: {festival.date}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guides */}
      <section className="mb-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-3">Local Guides</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {stateData.guides?.map(guide => (
            <div key={guide._id} className="bg-green-50 p-4 shadow rounded-2xl">
              <h3 className="text-lg font-semibold">{guide.name}</h3>
              <p className="text-sm text-gray-700">Languages: {guide.languages?.join(', ')}</p>
              <p className="text-sm text-gray-500">Contact: {guide.phone}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Alerts */}
      {stateData.alerts?.length > 0 && (
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-red-700 mb-3">Live Alerts</h2>
          <ul className="list-disc list-inside text-red-600">
            {stateData.alerts.map(alert => (
              <li key={alert._id}>
                {alert.message} — <span className="text-sm text-gray-500">{alert.date}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
};

export default StateDetails;
