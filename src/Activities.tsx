import { useEffect, useState } from 'react';

function Activities({ accessToken }: { accessToken: string }) {
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    let backendBase = window.location.origin;
    if (backendBase.match(/:\d+$/)) {
        backendBase = backendBase.replace(/:\d+$/, ':5050');
    }
    useEffect(() => {
        if (!accessToken) return;
        setLoading(true);
        setError(null);
        fetch(`http://${backendBase}/api/activities?access_token=${accessToken}`)
            .then((res) => {
                if (!res.ok) throw new Error('Failed to fetch activities');
                return res.json();
            })
            .then((data) => setActivities(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, [accessToken]);

    return (
        <div>
            <h2>Recent Activities</h2>
            {loading && <p>Loading...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <ul>
                {activities.map((activity) => (
                    <li key={activity.id} style={{ marginBottom: 10 }}>
                        <strong>{activity.name}</strong> — {activity.type} — {(activity.distance / 1000).toFixed(2)} km
                        <br />
                        <span>Date: {new Date(activity.start_date).toLocaleString()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default Activities;
