import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

const RegionDetail = () => {
  const { regionId } = useParams();
  const [regionData, setRegionData] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:5000/api/regions/${regionId}`)
      .then((res) => res.json())
      .then((data) => setRegionData(data))
      .catch((err) => console.error("Failed to fetch region data", err));
  }, [regionId]);

  if (!regionData) return <p>Loading...</p>;

  return (
    <div className="region-detail-container">
      <h1>{regionData.name}</h1>
      <p>{regionData.description}</p>

      <section>
        <h2>Popular Places</h2>
        <ul>
          {regionData.places.map((place, idx) => (
            <li key={idx}>{place.name} – {place.description}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Famous Festivals</h2>
        <ul>
          {regionData.festivals.map((festival, idx) => (
            <li key={idx}>{festival.name} – {festival.description}</li>
          ))}
        </ul>
      </section>

      <section>
        <h2>Quick Facts</h2>
        <ul>
          <li>Capital: {regionData.capital}</li>
          <li>Language: {regionData.language}</li>
          <li>Best Season: {regionData.season}</li>
        </ul>
      </section>
    </div>
  );
};

export default RegionDetail;
