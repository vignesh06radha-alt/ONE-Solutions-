
import React, { useEffect, useRef, useState } from 'react';
import { Problem } from '../types';
import L from 'leaflet';

interface HeatmapProps {
  problems: Problem[];
  onMarkerClick: (problem: Problem) => void;
}

// Fix for default icon issue with webpack/bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});


const getMarkerColor = (severity: number) => {
    if (severity > 7.5) return '#EF4444'; // Red-500
    if (severity > 5) return '#FBBF24'; // Amber-400
    return '#34D399'; // Green-400
};

const Heatmap: React.FC<HeatmapProps> = ({ problems, onMarkerClick }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapContainer.current && !mapRef.current) {
      mapRef.current = L.map(mapContainer.current).setView([34.0522, -118.2437], 13); // Default to LA
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapRef.current);
    }
  }, []);

  useEffect(() => {
    if (mapRef.current) {
        // Clear existing markers
        mapRef.current.eachLayer((layer) => {
            if (layer instanceof L.Marker) {
                mapRef.current?.removeLayer(layer);
            }
        });

        problems.forEach(problem => {
            if (problem.location) {
                const severity = problem.aiAnalysis?.severity || 1;
                const color = getMarkerColor(severity);

                const iconHtml = `<div style="background-color: ${color}; width: 1.75rem; height: 1.75rem; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: black; font-weight: bold; border: 2px solid white; box-shadow: 0 0 8px rgba(0,0,0,0.7);">${Math.round(severity)}</div>`;
                const customIcon = L.divIcon({
                    html: iconHtml,
                    className: '',
                    iconSize: [28, 28],
                    iconAnchor: [14, 14]
                });

                const marker = L.marker([problem.location.lat, problem.location.lng], { icon: customIcon }).addTo(mapRef.current!);
                marker.on('click', () => onMarkerClick(problem));
            }
        });
    }
  }, [problems, onMarkerClick]);

  return <div ref={mapContainer} style={{ height: '100%', width: '100%', borderRadius: '8px' }} />;
};

export default Heatmap;