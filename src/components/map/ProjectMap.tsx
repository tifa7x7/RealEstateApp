'use client';

import 'leaflet/dist/leaflet.css';

import { useMemo } from 'react';
import { divIcon } from 'leaflet';
import type { DivIcon, LatLngExpression } from 'leaflet';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { useProjects } from '@/hooks/useProjects';
import { CLASS_COLORS } from '@/lib/constants';
import { MarkerPopup } from './MarkerPopup';

const CRIMEA_CENTER: LatLngExpression = [44.95, 34.5];
const DEFAULT_ZOOM = 9;

const ICON_CACHE = new Map<string, DivIcon>();

function getMarkerIcon(color: string): DivIcon {
  const cached = ICON_CACHE.get(color);
  if (cached) return cached;
  const icon = divIcon({
    className: 'cdt-project-marker',
    html:
      `<div style="background:${color};width:18px;height:18px;border-radius:50%;` +
      `border:2px solid #fff;box-shadow:0 0 6px rgba(0,0,0,0.35);"></div>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -10],
  });
  ICON_CACHE.set(color, icon);
  return icon;
}

export default function ProjectMap() {
  const { projects } = useProjects();

  const markers = useMemo(
    () =>
      projects.map((p) => ({
        project: p,
        position: [p.lat, p.lng] as LatLngExpression,
        icon: getMarkerIcon(CLASS_COLORS[p.classType]),
      })),
    [projects],
  );

  return (
    <div className="h-[70vh] min-h-[400px] w-full rounded-lg overflow-hidden border border-[var(--border)]">
      <MapContainer
        center={CRIMEA_CENTER}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {markers.map(({ project, position, icon }) => (
          <Marker key={project.id} position={position} icon={icon}>
            <Popup>
              <MarkerPopup project={project} />
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
