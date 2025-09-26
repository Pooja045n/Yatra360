import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import './PlaceDetail.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import Loader from '../components/Loader';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const PlaceDetail = () => {
    const { id } = useParams();
    const [place, setPlace] = useState(null);

    useEffect(() => {
        axios.get(`http://localhost:5000/api/places/${id}`) 
            .then(res => setPlace(res.data))
            .catch(err => console.error(err));
    }, [id]);

    if (!place) return <Loader />;

    return (
        <div className="place-detail-page">
            <div className="banner">
                <img src={place.imageUrl} alt={place.name} />
                <div className="overlay">
                    <h1>{place.name}</h1>
                    <p>{place.location}</p>
                </div>
            </div>

            <div className="place-description">
                <h2>About {place.name}</h2>
                <p>{place.description}</p>

                <div className="map-section">
                    <h3>Location on Map</h3>
                    <MapContainer center={[place.latitude, place.longitude]} zoom={13} scrollWheelZoom={false} style={{ height: '300px', width: '100%' }}>
                        <TileLayer
                            attribution='&copy; OpenStreetMap contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={[place.latitude, place.longitude]}>
                            <Popup>
                                {place.name} <br /> {place.location}
                            </Popup>
                        </Marker>
                    </MapContainer>
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="direction-btn"
                    >
                        Get Directions on Google Maps
                    </a>
                </div>
            </div>

            <div className="extras-section">
                <div className="extra-card">
                    <h3>Nearby Accommodations</h3>
                    <ul>
                        {place.accommodations.map((hotel, index) => (
                            <li key={index}>{hotel}</li>
                        ))}
                    </ul>
                </div>

                <div className="extra-card">
                    <h3>Local Foods to Try</h3>
                    <ul>
                        {place.foods.map((food, index) => (
                            <li key={index}>{food}</li>
                        ))}
                    </ul>
                </div>

                <div className="extra-card">
                    <h3>Best Travel Options</h3>
                    <ul>
                        {place.transport.map((option, index) => (
                            <li key={index}>{option}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default PlaceDetail;
