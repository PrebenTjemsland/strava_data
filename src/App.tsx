import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Activities from './Activities';
import MainPage from './Mainpage';
import AthletePage from './AthletePage';

function App() {
    const [accessToken, setAccessToken] = useState<string>(() => localStorage.getItem('accessToken') || '');
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    let backendBase = window.location.origin;
    if (backendBase.match(/:\d+$/)) {
        backendBase = backendBase.replace(/:\d+$/, ':5050');
    }

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('access_token');
        const athleteId = params.get('athlete_id');
        if (token) {
            localStorage.setItem('accessToken', token);
            setAccessToken(token);
        }
        if (athleteId) {
            localStorage.setItem('athleteId', athleteId);
        }
        if (token || athleteId) {
            params.delete('access_token');
            params.delete('athlete_id');
            const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
            window.history.replaceState({}, '', newUrl);
        }
    }, []);

    useEffect(() => {
        const athleteId = localStorage.getItem('athleteId');

        if (accessToken && athleteId) {
            setLoading(true);
            setError(null);
            fetch(`${backendBase}/api/athlete_stats?access_token=${accessToken}&athlete_id=${athleteId}`)
                .then((res) => {
                    if (res.status === 401) {
                        localStorage.removeItem('accessToken');
                        setAccessToken('');
                        throw new Error('Access token expired. Please reconnect.');
                    }
                    if (!res.ok) throw new Error('Failed to fetch stats');
                    return res.json();
                })
                .then((data) => setStats(data))
                .catch((err) => setError(err.message))
                .finally(() => setLoading(false));
        }
    }, [accessToken]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage accessToken={accessToken} stats={stats} loading={loading} error={error} />} />
                <Route path="/activities" element={<Activities accessToken={accessToken} />} />
                <Route path="/athlete" element={<AthletePage accessToken={accessToken} stats={stats} />} />
            </Routes>
        </Router>
    );
}

export default App;
