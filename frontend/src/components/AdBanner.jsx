import { useState, useEffect } from 'react';
import axios from 'axios';

const AdBanner = () => {
    const [ads, setAds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        fetchAds();
    }, []);

    useEffect(() => {
        if (ads.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % ads.length);
            }, 5000); // Change ad every 5 seconds

            return () => clearInterval(interval);
        }
    }, [ads.length]);

    const fetchAds = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/advertisements');
            const bannerAds = data.filter(ad => ad.position === 'banner');
            setAds(bannerAds);
        } catch (error) {
            console.error('Error fetching ads:', error);
        }
    };

    if (ads.length === 0) return null;

    const currentAd = ads[currentIndex];

    return (
        <div className="relative w-full mb-8 overflow-hidden bg-gray-100 rounded-lg shadow-lg">
            {currentAd.link ? (
                <a href={currentAd.link} target="_blank" rel="noopener noreferrer">
                    <img
                        src={currentAd.image}
                        alt={currentAd.title}
                        className="object-cover w-full h-64 transition-opacity duration-500"
                    />
                </a>
            ) : (
                <img
                    src={currentAd.image}
                    alt={currentAd.title}
                    className="object-cover w-full h-64"
                />
            )}
            {currentAd.title && (
                <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black to-transparent">
                    <h3 className="text-xl font-bold">{currentAd.title}</h3>
                    {currentAd.description && <p className="text-sm">{currentAd.description}</p>}
                </div>
            )}
            {ads.length > 1 && (
                <div className="absolute flex gap-2 transform -translate-x-1/2 bottom-4 left-1/2">
                    {ads.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdBanner;
