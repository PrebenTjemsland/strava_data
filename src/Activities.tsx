import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Activities.css';
import './styles/Button.css';
import ActivityMap from './components/ActivityMap';

interface ActivityMap {
    id: string;
    summary_polyline: string;
    resource_state: number;
}

interface Activity {
    id: number;
    name: string;
    type: string;
    sport_type: string;
    distance: number;
    moving_time: number;
    total_elevation_gain: number;
    start_date: string;
    achievement_count: number;
    kudos_count: number;
    average_speed: number;
    max_speed: number;
    has_heartrate: boolean;
    average_heartrate?: number;
    max_heartrate?: number;
    average_watts?: number;
    pr_count: number;
    map: ActivityMap;
    start_latlng?: [number, number];
    end_latlng?: [number, number];
}

function Activities({ accessToken }: { accessToken: string | null }) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    let backendBase = window.location.origin;
    if (backendBase.match(/:\d+$/)) {
        backendBase = backendBase.replace(/:\d+$/, ':5050');
    }
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        fetch(`${backendBase}/api/activities?access_token=${accessToken}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch activities');
                return res.json();
            })
            .then((data) => setActivities(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [accessToken]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const formatPace = (speedMps: number) => {
        const pacePerKm = 1000 / (speedMps * 60);
        const minutes = Math.floor(pacePerKm);
        const seconds = Math.round((pacePerKm - minutes) * 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
    };

    return (
        <div className="activities-container">
            <div className="activities-header">
                <button onClick={() => navigate('/')} className="modern-button">
                    ← Back
                </button>
                <h2>Recent Activities</h2>
            </div>

            {loading && <div className="loading">Loading your activities...</div>}
            {error && <div className="error">{error}</div>}

            <ul className="activity-list">
                {activities.map((activity: Activity) => (
                    <li key={activity.id} className="activity-card">
                        <div className="activity-title">
                            <span className={`activity-type-badge activity-type-${activity.type}`}>{activity.type}</span>
                            {activity.name}
                        </div>

                        <div className="activity-meta">
                            <span>
                                {new Date(activity.start_date).toLocaleDateString(undefined, {
                                    weekday: 'short',
                                    month: 'short',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                })}
                            </span>
                        </div>

                        <div className="activity-stats">
                            <div className="stat-item">
                                <span className="stat-label">Distance</span>
                                <span className="stat-value">{(activity.distance / 1000).toFixed(1)} km</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Time</span>
                                <span className="stat-value">{formatDuration(activity.moving_time)}</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-label">Elevation</span>
                                <span className="stat-value">{Math.round(activity.total_elevation_gain)}m</span>
                            </div>
                            {activity.type === 'Run' && (
                                <div className="stat-item">
                                    <span className="stat-label">Pace</span>
                                    <span className="stat-value">{formatPace(activity.average_speed)}</span>
                                </div>
                            )}
                            {activity.has_heartrate && (
                                <div className="stat-item">
                                    <span className="stat-label">Avg HR</span>
                                    <span className="stat-value">{Math.round(activity.average_heartrate || 0)} bpm</span>
                                </div>
                            )}
                            {activity.average_watts && (
                                <div className="stat-item">
                                    <span className="stat-label">Avg Power</span>
                                    <span className="stat-value">{Math.round(activity.average_watts)} W</span>
                                </div>
                            )}
                        </div>

                        {(activity.achievement_count > 0 || activity.pr_count > 0) && (
                            <div className="achievements">
                                {activity.achievement_count > 0 && (
                                    <span className="achievement-badge">
                                        🏆 {activity.achievement_count} {activity.achievement_count === 1 ? 'achievement' : 'achievements'}
                                    </span>
                                )}
                                {activity.pr_count > 0 && (
                                    <span className="achievement-badge">
                                        ⚡ {activity.pr_count} {activity.pr_count === 1 ? 'PR' : 'PRs'}
                                    </span>
                                )}
                            </div>
                        )}

                        {activity.map?.summary_polyline && (
                            <div style={{ marginTop: '16px' }}>
                                <ActivityMap
                                    polyline={activity.map.summary_polyline}
                                    startLatlng={activity.start_latlng}
                                    endLatlng={activity.end_latlng}
                                />
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Activities;
