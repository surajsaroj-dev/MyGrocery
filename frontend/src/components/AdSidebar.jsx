import { useState, useEffect } from 'react';
import axios from 'axios';

const AdSidebar = () => {
    const [ads, setAds] = useState([]);

    useEffect(() => {
        fetchAds();
    }, []);

    const fetchAds = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/advertisements');
            const sidebarAds = data.filter(ad => ad.position === 'sidebar');
            setAds(sidebarAds);
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    if (ads.length === 0) return null;

    return (
        <div className="space-y-4">
            {ads.map((ad) => (
                <div key={ad._id} className="overflow-hidden bg-white rounded-lg shadow">
                    {ad.link ? (
                        <a href={ad.link} target="_blank" rel="noopener noreferrer">
                            <img
                                src={ad.image}
                                alt={ad.title}
                                className="object-cover w-full h-48 transition-transform hover:scale-105"
                            />
                        </a>
                    ) : (
                        <img
                            src={ad.image}
                            alt={ad.title}
                            className="object-cover w-full h-48"
                        />
                    )}
                    {(ad.title || ad.description) && (
                        <div className="p-3">
                            {ad.title && <h4 className="font-bold text-gray-800">{ad.title}</h4>}
                            {ad.description && <p className="text-sm text-gray-600">{ad.description}</p>}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default AdSidebar;
