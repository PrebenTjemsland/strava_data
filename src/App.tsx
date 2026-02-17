import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Activities from './Activities';
import MainPage from './Mainpage';
import AthletePage from './AthletePage';

type TokenData = {
    accessToken: string | null;
    refreshToken: string | null;
    expiresAt: number | null;
};

function App() {
    const [tokenData, setTokenData] = useState<TokenData>(() => {
        const accessToken = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        const expiresAt = localStorage.getItem('expiresAt');
        return {
            accessToken,
            refreshToken,
            expiresAt: expiresAt ? parseInt(expiresAt, 10) : null,
        };
    });

    const [athleteId, setAthleteId] = useState<string | null>(localStorage.getItem('athleteId'));
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    let backendBase = window.location.origin;
    if (backendBase.match(/:\d+$/)) {
        backendBase = backendBase.replace(/:\d+$/, ':5050');
    }

    const clearAuthData = useCallback(() => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('expiresAt');
        localStorage.removeItem('athleteId');
        setTokenData({ accessToken: null, refreshToken: null, expiresAt: null });
        setAthleteId(null);
        setStats(null);
    }, []);

    // This effect runs once on page load to handle the redirect from Strava
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const newAccessToken = params.get('access_token');
        const newRefreshToken = params.get('refresh_token');
        const newExpiresAt = params.get('expires_at');
        const newAthleteId = params.get('athlete_id');

        if (newAccessToken && newRefreshToken && newExpiresAt && newAthleteId) {
            const tokenInfo = {
                accessToken: newAccessToken,
                refreshToken: newRefreshToken,
                expiresAt: parseInt(newExpiresAt, 10),
            };

            // Store tokens and athlete ID
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', newRefreshToken);
            localStorage.setItem('expiresAt', newExpiresAt);
            localStorage.setItem('athleteId', newAthleteId);

            setTokenData(tokenInfo);
            setAthleteId(newAthleteId);

            // Clean up the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    // The core logic: a reusable function to fetch data that handles token refreshing
    const fetchWithRefresh = useCallback(
        async (url: string) => {
            let currentTokenData = { ...tokenData }; // Make a mutable copy

            // Check if the token is expired or will expire soon (e.g., within 5 minutes)
            if (currentTokenData.accessToken && currentTokenData.expiresAt && Date.now() / 1000 > currentTokenData.expiresAt - 300) {
                console.log('Access token expired, refreshing...');
                try {
                    const response = await fetch(`${backendBase}/api/refresh_token`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ refresh_token: currentTokenData.refreshToken }),
                    });

                    if (!response.ok) {
                        throw new Error('Failed to refresh token');
                    }

                    const newTokens = await response.json();
                    const newExpiresAt = newTokens.expires_at;

                    // Update state and local storage with new tokens
                    const newTokenInfo = {
                        accessToken: newTokens.access_token,
                        refreshToken: newTokens.refresh_token,
                        expiresAt: newExpiresAt,
                    };

                    localStorage.setItem('accessToken', newTokenInfo.accessToken);
                    localStorage.setItem('refreshToken', newTokenInfo.refreshToken);
                    localStorage.setItem('expiresAt', newExpiresAt.toString());

                    setTokenData(newTokenInfo);
                    currentTokenData = newTokenInfo; // Update the token data for the current request
                    console.log('Token refreshed successfully.');
                } catch (refreshError) {
                    console.error('Could not refresh token:', refreshError);
                    clearAuthData(); // Clear all data if refresh fails
                    setError('Your session has expired. Please connect with Strava again.');
                    throw new Error('Authentication failed'); // Stop the execution
                }
            }

            // Proceed with the original API call using the (possibly new) access token
            const response = await fetch(`${url}&access_token=${currentTokenData.accessToken}`);
            if (!response.ok) {
                if (response.status === 401) {
                    // Handle cases where the token is invalid for other reasons
                    clearAuthData();
                    setError('Authentication failed. Please connect with Strava again.');
                }
                throw new Error(`API request failed with status ${response.status}`);
            }
            return response.json();
        },
        [tokenData, backendBase, clearAuthData],
    );

    // This effect fetches stats when the component mounts or when a valid token is available
    useEffect(() => {
        if (tokenData.accessToken && athleteId) {
            setLoading(true);
            setError(null);

            const url = `${backendBase}/api/athlete_stats?athlete_id=${athleteId}`;

            fetchWithRefresh(url)
                .then((data) => {
                    setStats(data);
                })
                .catch((err) => {
                    console.error('Failed to fetch athlete stats:', err);
                    if (!error) {
                        // Only set error if not already set by fetchWithRefresh
                        setError('Failed to fetch stats. Please try again.');
                    }
                })
                .finally(() => setLoading(false));
        }
    }, [tokenData.accessToken, athleteId, fetchWithRefresh]);

    return (
        <Router>
            <Routes>
                <Route path="/" element={<MainPage accessToken={tokenData.accessToken} stats={stats} loading={loading} error={error} />} />
                <Route path="/activities" element={<Activities accessToken={tokenData.accessToken} />} />
                <Route path="/athlete" element={<AthletePage accessToken={tokenData.accessToken} stats={stats} />} />
            </Routes>
        </Router>
    );
}

export default App;
