import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MainPage({ accessToken, stats, loading, error }: { accessToken: string; stats: any; loading: boolean; error: string | null }) {
    const navigate = useNavigate();

    const handleConnect = () => {
        let backendBase = window.location.origin;
        if (backendBase.match(/:\d+$/)) {
            backendBase = backendBase.replace(/:\d+$/, ':5050');
        }
        const frontendUrl = window.location.origin;
        window.location.href = `${backendBase}/api/authorize?redirect_uri=${encodeURIComponent(frontendUrl)}`;
    };

    const formatTime = (seconds: number | null | undefined) => {
        if (seconds === undefined || seconds === null) {
            return 'N/A';
        }
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        return `${hours}h ${minutes}m`;
    };

    const runData = {
        labels: ['Your Runs'],
        datasets: [
            {
                label: 'Total Distance (km)',
                data: [stats ? (stats.all_run_totals?.distance / 1000).toFixed(2) : 0],
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
            },
        ],
    };

    const rideData = {
        labels: ['Your Rides'],
        datasets: [
            {
                label: 'Total Distance (km)',
                data: [stats ? (stats.all_ride_totals.distance / 1000).toFixed(2) : 0],
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
            },
        ],
    };

    const funFacts = {
        everestClimbs: stats ? (stats.all_ride_totals.elevation_gain / 8848).toFixed(2) : 0,
        aroundTheWorld: stats ? ((stats.all_run_totals?.distance + stats.all_ride_totals.distance) / 40075000).toFixed(4) : 0,
    };

    return (
        <div className="main-container">
            <header className="header">
                <h1>Strava Activities Viewer</h1>
                {!accessToken && (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleConnect();
                        }}
                    >
                        <img src="/btn_strava_connect_with_orange.svg" alt="Connect with Strava" className="strava-connect-btn" />
                    </a>
                )}
                <button onClick={() => navigate('/activities')} disabled={!accessToken}>
                    Go to Activities
                </button>
            </header>

            {loading && <p>Loading....</p>}
            {error && <p className="error-message">{error}</p>}

            {stats && (
                <main className="stats-container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h2>🏃 Total Run Stats</h2>
                            <p>Total Runs: {stats.all_run_totals?.count}</p>
                            <p>Total Distance: {(stats.all_run_totals?.distance / 1000).toFixed(2)} km</p>
                            <p>Total Time: {formatTime(stats.all_run_totals?.moving_time)}</p>
                            <div className="chart-container">
                                <Bar data={runData} />
                            </div>
                        </div>

                        <div className="stat-card">
                            <h2>🚴 Total Ride Stats</h2>
                            <p>Total Rides: {stats.all_ride_totals?.count}</p>
                            <p>Total Distance: {(stats.all_ride_totals.distance / 1000).toFixed(2)} km</p>
                            <p>Longest Ride: {(stats.biggest_ride_distance / 1000).toFixed(2)} km</p>
                            <p>Biggest Climb: {stats.biggest_climb_elevation_gain.toFixed(2)} m</p>
                            <div className="chart-container">
                                <Bar data={rideData} />
                            </div>
                        </div>

                        <div className="stat-card">
                            <h2>🌍 Fun Facts</h2>
                            <p>You've climbed Mount Everest {funFacts.everestClimbs} times!</p>
                            <p>You've traveled {funFacts.aroundTheWorld}% of the way around the world!</p>
                        </div>
                    </div>
                </main>
            )}

            <footer className="footer">
                <img src="/logo_pwrdBy_strava_stack.svg" alt="Powered by Strava" />
            </footer>
        </div>
    );
}

export default MainPage;
