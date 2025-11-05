import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { decode } from '@googlemaps/polyline-codec';
import 'leaflet/dist/leaflet.css';

interface ActivityMapProps {
    polyline: string;
    startLatlng?: [number, number];
    endLatlng?: [number, number];
}

const ActivityMap: React.FC<ActivityMapProps> = ({ polyline, startLatlng, endLatlng }) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapRef.current || !polyline) return;

        // Decode the polyline
        const decodedPath = decode(polyline);

        // Create map if it doesn't exist
        if (!mapInstanceRef.current) {
            mapInstanceRef.current = L.map(mapRef.current);

            // Add tile layer
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
            }).addTo(mapInstanceRef.current);
        }

        const map = mapInstanceRef.current;

        // Create and add the polyline
        const path = L.polyline(decodedPath, {
            color: '#fc4c02',
            weight: 3,
            opacity: 0.8,
        }).addTo(map);

        // Add start and end markers if available
        if (startLatlng) {
            L.marker(startLatlng, {
                title: 'Start',
                icon: L.divIcon({
                    className: 'start-marker',
                    html: '🟢',
                    iconSize: [20, 20],
                }),
            }).addTo(map);
        }

        if (endLatlng) {
            L.marker(endLatlng, {
                title: 'End',
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '🏁',
                    iconSize: [20, 20],
                }),
            }).addTo(map);
        }

        // Fit the map to the polyline bounds
        map.fitBounds(path.getBounds(), {
            padding: [30, 30],
        });

        // Cleanup function
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, [polyline, startLatlng, endLatlng]);

    return <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '8px' }} />;
};

export default ActivityMap;
