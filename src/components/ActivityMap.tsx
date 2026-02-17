import { memo, useEffect, useRef } from 'react';
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
    const layerGroupRef = useRef<L.LayerGroup | null>(null);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        const map = L.map(mapRef.current);
        mapInstanceRef.current = map;

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
        }).addTo(map);

        layerGroupRef.current = L.layerGroup().addTo(map);

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
                layerGroupRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!polyline || !mapInstanceRef.current || !layerGroupRef.current) return;

        const map = mapInstanceRef.current;
        const layers = layerGroupRef.current;
        const decodedPath = decode(polyline);
        layers.clearLayers();

        const path = L.polyline(decodedPath, {
            color: '#fc4c02',
            weight: 3,
            opacity: 0.8,
        }).addTo(layers);

        if (startLatlng) {
            L.marker(startLatlng, {
                title: 'Start',
                icon: L.divIcon({
                    className: 'start-marker',
                    html: '🟢',
                    iconSize: [20, 20],
                }),
            }).addTo(layers);
        }

        if (endLatlng) {
            L.marker(endLatlng, {
                title: 'End',
                icon: L.divIcon({
                    className: 'end-marker',
                    html: '🏁',
                    iconSize: [20, 20],
                }),
            }).addTo(layers);
        }

        map.fitBounds(path.getBounds(), {
            padding: [30, 30],
        });
    }, [polyline, startLatlng, endLatlng]);

    return <div ref={mapRef} style={{ height: '300px', width: '100%', borderRadius: '8px' }} />;
};

export default memo(ActivityMap);
