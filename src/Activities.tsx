import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Activities.css';
import './styles/Button.css';
import ActivityMap from './components/ActivityMap';
import { apiUrl } from './lib/api';
import type { StravaActivity } from './types/strava';

function Activities({ accessToken }: { accessToken: string | null }) {
    const [activities, setActivities] = useState<StravaActivity[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!accessToken) return;

        const controller = new AbortController();
        setLoading(true);
        setError(null);
        fetch(apiUrl(`/api/activities?access_token=${accessToken}`), { signal: controller.signal })
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch activities');
                return res.json() as Promise<StravaActivity[]>;
            })
            .then((data) => setActivities(data))
            .catch((err: unknown) => {
                if (controller.signal.aborted) return;
                setError(err instanceof Error ? err.message : 'Failed to fetch activities');
            })
            .finally(() => setLoading(false));

        return () => controller.abort();
    }, [accessToken]);

    const formatDuration = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    };

    const formatPace = (speedMps: number) => {
        if (!speedMps) return 'N/A';
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
                {activities.map((activity) => (
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
