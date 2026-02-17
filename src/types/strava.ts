export interface StravaTotals {
    count: number;
    distance: number;
    moving_time: number;
    elevation_gain: number;
}

export interface StravaAthleteStats {
    biggest_ride_distance: number;
    biggest_climb_elevation_gain: number;
    recent_ride_totals: StravaTotals;
    recent_run_totals: StravaTotals;
    ytd_ride_totals: StravaTotals;
    ytd_run_totals: StravaTotals;
    all_ride_totals: StravaTotals;
    all_run_totals: StravaTotals;
}

export interface StravaActivityMap {
    id: string;
    summary_polyline: string;
    resource_state: number;
}

export interface StravaActivity {
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
    map?: StravaActivityMap;
    start_latlng?: [number, number];
    end_latlng?: [number, number];
}
