import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Activities from './Activities';
import MainPage from './Mainpage';

function App() {
    const [accessToken, setAccessToken] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
        const athleteId = params.get('athlete_id');
        if (token && athleteId) {
            setAccessToken(token);
            setLoading(true);
            setError(null);
            fetch(`http://localhost:5050/athlete_stats?access_token=${token}&athlete_id=${athleteId}`)
                .then((res) => {
                    if (!res.ok) throw new Error('Failed to fetch stats');
                    return res.json();
                })
                .then((data) => setStats(data))
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, []);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage accessToken={accessToken} stats={stats} loading={loading} error={error} />} />
                <Route path="/activities" element={<Activities accessToken={accessToken} />} />
            </Routes>
        </Router>
    );
}

export default App;
