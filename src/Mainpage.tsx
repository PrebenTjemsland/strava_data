import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import './styles/Button.css';
import './styles/Stats.css';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function MainPage({ accessToken, stats, loading, error }: { accessToken: string | null; stats: any; loading: boolean; error: string | null }) {
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

    const calculateYearlyAverage = (total: number, ytdValue: number) => {
        const now = new Date();
        const daysIntoYear = now.getDate() + now.getMonth() * 30.44; // Approximate days into year
        const projectedYearValue = (ytdValue / daysIntoYear) * 365;
        const previousYearsAvg = (total - ytdValue) / 5; // Assuming 5 years of history, adjust if needed
        return { projected: projectedYearValue, historical: previousYearsAvg };
    };

    const runMetrics = stats
        ? {
              total: stats.all_run_totals?.distance / 1000,
              ytd: stats.ytd_run_totals?.distance / 1000,
              ...calculateYearlyAverage(stats.all_run_totals?.distance / 1000, stats.ytd_run_totals?.distance / 1000),
          }
        : { total: 0, ytd: 0, projected: 0, historical: 0 };

    const rideMetrics = stats
        ? {
              total: stats.all_ride_totals?.distance / 1000,
              ytd: stats.ytd_ride_totals?.distance / 1000,
              ...calculateYearlyAverage(stats.all_ride_totals?.distance / 1000, stats.ytd_ride_totals?.distance / 1000),
          }
        : { total: 0, ytd: 0, projected: 0, historical: 0 };

    const runData = {
        labels: ['Yearly Average', 'Projected', 'Current'],
        datasets: [
            {
                label: 'Distance (km)',
                data: [runMetrics.historical.toFixed(0), runMetrics.projected.toFixed(0), runMetrics.ytd.toFixed(0)],
                backgroundColor: ['rgba(255, 99, 132, 0.3)', 'rgba(255, 99, 132, 0.7)', 'rgba(255, 99, 132, 1)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 1)', 'rgba(255, 99, 132, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const rideData = {
        labels: ['Yearly Average', 'Projected', 'Current'],
        datasets: [
            {
                label: 'Distance (km)',
                data: [rideMetrics.historical.toFixed(0), rideMetrics.projected.toFixed(0), rideMetrics.ytd.toFixed(0)],
                backgroundColor: ['rgba(54, 162, 235, 0.3)', 'rgba(54, 162, 235, 0.7)', 'rgba(54, 162, 235, 1)'],
                borderColor: ['rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 1)', 'rgba(54, 162, 235, 1)'],
                borderWidth: 1,
            },
        ],
    };

    const funFacts = {
        everestClimbs: stats ? (stats.all_ride_totals.elevation_gain / 8848).toFixed(2) : 0,
        aroundTheWorld: stats ? (((stats.all_run_totals?.distance + stats.all_ride_totals.distance) / 40075000) * 100).toFixed(2) : 0,
    };

    return (
        <div className="main-container">
            <header className="header">
                <h1>Strava Activities Viewer</h1>
                {!accessToken ? (
                    <a
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleConnect();
                        }}
                    >
                        <img src="/btn_strava_connect_with_orange.svg" alt="Connect with Strava" className="strava-connect-btn" />
                    </a>
                ) : (
                    <>
                        <button onClick={() => navigate('/activities')} className="modern-button" style={{ marginRight: 8 }}>
                            Go to Activities
                        </button>
                        <button onClick={() => navigate('/athlete')} className="modern-button">
                            Go to Athlete
                        </button>
                    </>
                )}
            </header>

            {loading && <p>Loading....</p>}
            {error && <p className="error-message">{error}</p>}

            {stats && (
                <main className="stats-container">
                    <div className="stats-grid">
                        <div className="stat-card">
                            <h2>🏃 Running Progress</h2>
                            <div className="stat-summary">
                                <div className="stat-primary">
                                    <p className="stat-label">Total Distance</p>
                                    <p className="stat-value">{(stats.all_run_totals?.distance / 1000).toFixed(0)} km</p>
                                </div>
                                <div className="stat-secondary">
                                    <div>
                                        <p className="stat-label">This Year</p>
                                        <p className="stat-value">{(stats.ytd_run_totals?.distance / 1000).toFixed(0)} km</p>
                                    </div>
                                    <div>
                                        <p className="stat-label">Year Projection</p>
                                        <p className="stat-value">{runMetrics.projected.toFixed(0)} km</p>
                                    </div>
                                </div>
                                <div className="stat-details">
                                    <p>Total Runs: {stats.all_run_totals?.count}</p>
                                    <p>Total Time: {formatTime(stats.all_run_totals?.moving_time)}</p>
                                    <p>Elevation: {stats.all_run_totals.elevation_gain.toFixed(0)} m</p>
                                </div>
                            </div>
                            <div className="chart-wrapper">
                                <div className="chart-container">
                                    <Bar
                                        data={runData}
                                        options={{
                                            responsive: true,
                                            maintainAspectRatio: false,
                                            layout: {
                                                padding: {
                                                    left: 10,
                                                    right: 20,
                                                    top: 20,
                                                    bottom: 20,
                                                },
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: (context: any) => `Distance: ${context.raw} km`,
                                                    },
                                                    titleFont: {
                                                        size: 16,
                                                    },
                                                    bodyFont: {
                                                        size: 14,
                                                    },
                                                    padding: 12,
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Distance (km)',
                                                        font: {
                                                            size: 14,
                                                            weight: 'bold',
                                                        },
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 13,
                                                        },
                                                        padding: 8,
                                                    },
                                                },
                                                x: {
                                                    grid: {
                                                        display: false,
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 13,
                                                        },
                                                        maxRotation: 45,
                                                        minRotation: 45,
                                                        padding: 8,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="stat-card">
                            <h2>🚴 Cycling Progress</h2>
                            <div className="stat-summary">
                                <div className="stat-primary">
                                    <p className="stat-label">Total Distance</p>
                                    <p className="stat-value">{(stats.all_ride_totals?.distance / 1000).toFixed(0)} km</p>
                                </div>
                                <div className="stat-secondary">
                                    <div>
                                        <p className="stat-label">This Year</p>
                                        <p className="stat-value">{(stats.ytd_ride_totals?.distance / 1000).toFixed(0)} km</p>
                                    </div>
                                    <div>
                                        <p className="stat-label">Year Projection</p>
                                        <p className="stat-value">{rideMetrics.projected.toFixed(0)} km</p>
                                    </div>
                                </div>
                                <div className="stat-details">
                                    <p>Total Rides: {stats.all_ride_totals?.count}</p>
                                    <p>Longest Ride: {(stats.biggest_ride_distance / 1000).toFixed(1)} km</p>
                                    <p>Biggest Climb: {stats.biggest_climb_elevation_gain.toFixed(0)} m</p>
                                </div>
                            </div>
                            <div className="chart-wrapper">
                                <div className="chart-container">
                                    <Bar
                                        data={rideData}
                                        options={{
                                            layout: {
                                                padding: {
                                                    right: 20,
                                                    top: 20,
                                                    bottom: 20,
                                                },
                                            },
                                            plugins: {
                                                legend: {
                                                    display: false,
                                                },
                                                tooltip: {
                                                    callbacks: {
                                                        label: (context: any) => `Distance: ${context.raw} km`,
                                                    },
                                                    titleFont: {
                                                        size: 16,
                                                    },
                                                    bodyFont: {
                                                        size: 14,
                                                    },
                                                    padding: 12,
                                                },
                                            },
                                            scales: {
                                                y: {
                                                    beginAtZero: true,
                                                    title: {
                                                        display: true,
                                                        text: 'Distance (km)',
                                                        font: {
                                                            size: 14,
                                                            weight: 'bold',
                                                        },
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 13,
                                                        },
                                                        padding: 8,
                                                    },
                                                },
                                                x: {
                                                    grid: {
                                                        display: false,
                                                    },
                                                    ticks: {
                                                        font: {
                                                            size: 13,
                                                        },
                                                        maxRotation: 45,
                                                        minRotation: 45,
                                                        padding: 8,
                                                    },
                                                },
                                            },
                                        }}
                                    />
                                </div>
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
