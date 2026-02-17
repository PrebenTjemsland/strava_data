import React from 'react';
import { useNavigate } from 'react-router-dom';
import './AthletePage.css';
import './styles/Button.css';
import GearImageUpload from './components/GearImageUpload';

interface Athlete {
    id: number;
    firstname: string;
    lastname: string;
    profile: string;
    city: string;
    country: string;
    stats: {
        totalDistance: number;
        totalRides: number;
        totalRunTime: number;
    };
    bikes: Array<{
        id: string;
        name: string;
        distance: number;
    }>;
    shoes?: Array<{
        id: string;
        name: string;
        distance: number;
    }>;
}

const AthletePage: React.FC<{ accessToken: string | null; stats: any }> = ({ accessToken, stats }) => {
    const [athlete, setAthlete] = React.useState<Athlete | null>(null);
    const [loading, setLoading] = React.useState(true);

    const [gearImages, setGearImages] = React.useState<Array<{ gearId: string; imageUrl: string }>>(() => {
        const saved = localStorage.getItem('gearImages') || sessionStorage.getItem('gearImages');
        return saved ? JSON.parse(saved) : [];
    });
    const [storageError, setStorageError] = React.useState<string | null>(null);

    const navigate = useNavigate();

    React.useEffect(() => {
        if (!accessToken) return;

        let backendBase = window.location.origin;
        if (backendBase.match(/:\d+$/)) {
            backendBase = backendBase.replace(/:\d+$/, ':5050');
        }

        fetch(`${backendBase}/api/athlete?access_token=${accessToken}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch stats');
                return res.json();
            })
            .then((data) => setAthlete(data))
            .finally(() => setLoading(false));
    }, [accessToken]);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (!athlete) {
        return <div>Error loading athlete data</div>;
    }

    const handleImageUpload = (gearId: string, imageUrl: string) => {
        setGearImages((prev) => {
            const newImages = [...prev.filter((img) => img.gearId !== gearId), { gearId, imageUrl }];
            // Try to persist to localStorage, but handle quota errors gracefully
            try {
                localStorage.setItem('gearImages', JSON.stringify(newImages));
            } catch (e: any) {
                console.warn('Failed to persist gearImages to localStorage:', e);
                try {
                    // Fallback to sessionStorage
                    sessionStorage.setItem('gearImages', JSON.stringify(newImages));
                    setStorageError('Local storage full — saved for this session only.');
                } catch (e2) {
                    console.warn('Failed to persist gearImages to sessionStorage:', e2);
                    setStorageError('Unable to save images in browser storage. They will not persist after reload.');
                }
                // Clear the error after a few seconds
                setTimeout(() => setStorageError(null), 7000);
            }
            return newImages;
        });
    };

    const getGearImage = (gearId: string) => {
        return gearImages.find((img) => img.gearId === gearId)?.imageUrl;
    };
    const totalDistance = stats ? stats.all_ride_totals.distance + stats.all_run_totals.distance : 0;
    const totalActivities = stats ? stats.all_ride_totals.count + (stats.all_run_totals?.count || 0) : 0;
    const totalActivityTime = stats ? stats.all_run_totals.moving_time + stats.all_ride_totals.moving_time : 0;
    const formatActivityTime = (seconds: number) => {
        const s = Math.max(0, Math.floor(seconds || 0));
        const YEAR = 365 * 24 * 3600;
        const MONTH = 30 * 24 * 3600;
        const DAY = 24 * 3600;
        const HOUR = 3600;
        let rem = s;
        const years = Math.floor(rem / YEAR);
        rem %= YEAR;
        const months = Math.floor(rem / MONTH);
        rem %= MONTH;
        const days = Math.floor(rem / DAY);
        rem %= DAY;
        const hours = Math.floor(rem / HOUR);
        const parts: string[] = [];
        if (years) parts.push(`${years}y`);
        if (months) parts.push(`${months}mo`);
        if (days) parts.push(`${days}d`);
        if (hours) parts.push(`${hours}h`);
        if (parts.length === 0) parts.push('0h');
        return parts.join(' ');
    };
    const formattedActivityTime = formatActivityTime(totalActivityTime);

    console.log('%c ##Custom log:', 'color: #bada55;', 'athlete --->', athlete);
    return (
        <div className="athlete-page">
            <div className="athlete-header">
                <img src={athlete.profile} alt={`${athlete.firstname} ${athlete.lastname}`} className="profile-image" />
                <h1>{`${athlete.firstname} ${athlete.lastname}`}</h1>
                <p>{`${athlete.city}, ${athlete.country}`}</p>
                <button onClick={() => navigate('/')} className="modern-button">
                    ← Back
                </button>
                {storageError && <div style={{ color: 'tomato', marginTop: '0.5rem' }}>{storageError}</div>}
            </div>

            <div className="athlete-stats">
                <h2>Statistics</h2>
                <div className="stats-grid">
                    <div className="stat-item">
                        <h3>Total Distance</h3>
                        <p>{`${(totalDistance / 1000).toFixed(1)} km`}</p>
                    </div>
                    <div className="stat-item">
                        <h3>Total Activeties</h3>
                        <p>{totalActivities}</p>
                    </div>
                    <div className="stat-item">
                        <h3>Total Activity Time</h3>
                        <p>{formattedActivityTime}</p>
                    </div>
                </div>
            </div>

            <div className="athlete-gear">
                <h2>My Gear</h2>
                <div className="gear-list">
                    {athlete.bikes.map((bike) => (
                        <div key={bike.id} className="gear-item">
                            <div className="gear-info">
                                <div className="gear-header">
                                    <h3>{bike.name}</h3>
                                </div>
                                <div className="gear-details">
                                    <p>{`${(bike.distance / 1000).toFixed(1)} km`}</p>
                                </div>
                            </div>
                            <GearImageUpload
                                gearId={bike.id}
                                currentImage={getGearImage(bike.id)}
                                onImageUpload={handleImageUpload}
                                size={120}
                            />
                        </div>
                    ))}
                </div>
                {athlete.shoes && athlete.shoes.length > 0 && (
                    <>
                        <h2>My Shoes</h2>
                        <div className="gear-list">
                            {athlete.shoes.map((shoe) => (
                                <div key={shoe.id} className="gear-item">
                                    <div className="gear-info">
                                        <div className="gear-header">
                                            <h3>{shoe.name}</h3>
                                        </div>
                                        <div className="gear-details">
                                            <p>{`${(shoe.distance / 1000).toFixed(1)} km`}</p>
                                        </div>
                                    </div>
                                    <GearImageUpload
                                        gearId={shoe.id}
                                        currentImage={getGearImage(shoe.id)}
                                        onImageUpload={handleImageUpload}
                                        size={120}
                                    />
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default AthletePage;
