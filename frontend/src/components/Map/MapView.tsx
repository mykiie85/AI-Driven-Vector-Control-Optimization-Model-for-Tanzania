import { MapContainer, TileLayer, CircleMarker, Popup, GeoJSON } from "react-leaflet";
import type { RegionGeoJSON } from "@/types";
import L from "leaflet";
import { useMemo } from "react";

interface Props {
  geojson?: RegionGeoJSON;
  selectedRegion: number | null;
  onSelectRegion: (id: number) => void;
}

function riskColor(score: number): string {
  if (score >= 0.75) return "#dc2626";
  if (score >= 0.6) return "#ef4444";
  if (score >= 0.4) return "#f59e0b";
  return "#22c55e";
}

function riskFill(score: number): string {
  if (score >= 0.75) return "rgba(220,38,38,0.25)";
  if (score >= 0.6) return "rgba(239,68,68,0.2)";
  if (score >= 0.4) return "rgba(245,158,11,0.18)";
  return "rgba(34,197,94,0.15)";
}

function getCoordinates(geometry: any): [number, number] | null {
  if (!geometry) return null;

  if (geometry.type === "Polygon" && geometry.coordinates[0]) {
    const coords = geometry.coordinates[0];
    let lat = 0, lng = 0;
    for (const [lon, latVal] of coords) {
      lng += lon;
      lat += latVal;
    }
    return [lat / coords.length, lng / coords.length];
  } else if (geometry.type === "MultiPolygon" && geometry.coordinates[0]) {
    const coords = geometry.coordinates[0][0];
    let lat = 0, lng = 0;
    for (const [lon, latVal] of coords) {
      lng += lon;
      lat += latVal;
    }
    return [lat / coords.length, lng / coords.length];
  }
  return null;
}

export default function MapView({ geojson, selectedRegion, onSelectRegion }: Props) {
  const geoJsonKey = useMemo(
    () => `${selectedRegion}-${geojson?.features?.length}`,
    [selectedRegion, geojson]
  );

  if (!geojson) {
    return (
      <div className="w-full h-full min-h-[480px] flex items-center justify-center">
        <p className="text-gray-400 text-sm">Loading map...</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[-6.5, 35.5]}
      zoom={6}
      className="w-full h-full min-h-[480px] rounded-xl"
      scrollWheelZoom={true}
      style={{ background: "hsl(120 50% 95%)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />

      {/* Region boundary polygons */}
      <GeoJSON
        key={geoJsonKey}
        data={geojson as any}
        style={(feature) => {
          const score = feature?.properties?.risk_score || 0;
          const isSelected = feature?.properties?.id === selectedRegion;
          return {
            color: isSelected ? "#16a34a" : riskColor(score),
            weight: isSelected ? 3 : 1.5,
            opacity: isSelected ? 1 : 0.7,
            fillColor: riskFill(score),
            fillOpacity: isSelected ? 0.4 : 0.25,
          };
        }}
        onEachFeature={(feature, layer) => {
          const props = feature.properties;
          if (props) {
            layer.on({ click: () => onSelectRegion(props.id) });
            layer.bindPopup(
              `<div style="font-family: Inter, sans-serif; font-size: 13px">
                <strong>${props.name}</strong><br/>
                Risk: ${(props.risk_score * 100).toFixed(0)}%<br/>
                Pop: ${props.population?.toLocaleString() || "N/A"}
              </div>`
            );
          }
        }}
      />

      {/* Circle markers at region centroids */}
      {geojson.features?.map((feature) => {
        const props = feature.properties;
        const coords = getCoordinates(feature.geometry);
        if (!coords) return null;

        const score = props?.risk_score || 0;
        const isSelected = props?.id === selectedRegion;
        const radius = isSelected ? 12 : 8;

        return (
          <CircleMarker
            key={props?.id}
            center={coords}
            radius={radius}
            fillColor={riskColor(score)}
            color={isSelected ? "#16a34a" : "#fff"}
            weight={2}
            opacity={0.9}
            fillOpacity={0.9}
            eventHandlers={{
              click: () => onSelectRegion(props?.id),
            }}
          >
            <Popup>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: "13px" }}>
                <strong>{props?.name}</strong><br/>
                Risk: {(score * 100).toFixed(0)}%<br/>
                Pop: {props?.population?.toLocaleString()}
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
