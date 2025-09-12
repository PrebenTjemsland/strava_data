import { useNavigate } from 'react-router-dom';

function MainPage({ accessToken, stats, loading, error }: { accessToken: string; stats: any; loading: boolean; error: string | null }) {
    const navigate = useNavigate();

    const handleConnect = () => {
        let backendBase = window.location.origin;
        if (backendBase.match(/:\d+$/)) {
            backendBase = backendBase.replace(/:\d+$/, ':5050');
        } else {
            //const frontendUrl = window.location.origin;

            const frontendUrlForState = 'http://penten.duckdns.org';

            window.location.href = `${backendBase}/api/authorize?redirect_uri=${encodeURIComponent(frontendUrlForState)}`;
        }
    };

    const formatTime = (seconds: number | null | undefined) => {
        if (seconds === undefined || seconds === null) {
            return 'N/A';
        }
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        const pad = (num: number) => num.toString().padStart(2, '0');

        return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
    };
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1 }}>
                <h1>Strava Activities Viewer</h1>
                {!accessToken && (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleConnect();
                        }}
                        style={{ display: 'inline-block' }}
                    >
                        <img
                            src="/btn_strava_connect_with_orange.svg"
                            alt="Connect with Strava"
                            style={{ height: 48, width: 'auto', verticalAlign: 'middle', cursor: 'pointer' }}
                        />
                    </a>
                )}
                <button onClick={() => navigate('/activities')} disabled={!accessToken}>
                    Go to Activities
                </button>
                {loading && <p>Loading...</p>}
                {error && <p style={{ color: 'red' }}>{error}</p>}
                {stats && (
                    <div>
                        <h2>Total Stats</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                            <div>
                                <div style={{ fontSize: 32 }}>🏃</div>
                                <p>Total Runs: {stats.all_run_totals?.count}</p>
                                <p>Total Run Distance: {(stats.all_run_totals?.distance / 1000).toFixed(2)} km</p>
                                <p>Total running time: {formatTime(stats.all_run_totals?.moving_time)}</p>
                            </div>
                            <div>
                                <div style={{ fontSize: 32 }}>🚴</div>
                                <p>Total Rides: {stats.all_ride_totals?.count}</p>
                                <p>All Ride Distance: {(stats.all_ride_totals.distance / 1000).toFixed(2)} km</p>
                                <p>Longest Ride: {(stats.biggest_ride_distance / 1000).toFixed(2)} km</p>
                                <p>Biggest Climb: {stats.biggest_climb_elevation_gain.toFixed(2)} meter</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
            <footer style={{ textAlign: 'center', marginTop: 32, marginBottom: 16 }}>
                <img
                    src="/api_logo_pwrdBy_strava_stack_orange.svg"
                    alt="Powered by Strava"
                    style={{ height: 32, width: 'auto', opacity: 0.85 }}
                />
            </footer>
        </div>
    );
}
export default MainPage;
