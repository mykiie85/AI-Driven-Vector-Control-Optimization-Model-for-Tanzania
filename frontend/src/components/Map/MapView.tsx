import React, { useCallback, useMemo } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import { Layer, PathOptions } from "leaflet";
import { RegionGeoJSON, RegionProperties } from "../../types";
import Legend from "./Legend";
import styles from "./MapView.module.css";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  data: RegionGeoJSON;
  onSelectRegion: (id: number) => void;
}

function getRiskColor(score: number): string {
  if (score >= 0.8) return "var(--risk-critical, #b71c1c)";
  if (score >= 0.6) return "var(--risk-high, #f44336)";
  if (score >= 0.3) return "var(--risk-medium, #ff9800)";
  return "var(--risk-low, #4caf50)";
}

function getRiskColorRaw(score: number): string {
  if (score >= 0.8) return "#b71c1c";
  if (score >= 0.6) return "#f44336";
  if (score >= 0.3) return "#ff9800";
  return "#4caf50";
}

function getRiskLabel(score: number): string {
  if (score >= 0.8) return "Critical";
  if (score >= 0.6) return "High";
  if (score >= 0.3) return "Medium";
  return "Low";
}

const MapView: React.FC<MapViewProps> = ({ data, onSelectRegion }) => {
  const style = useCallback((feature: any): PathOptions => {
    const risk = feature?.properties?.risk_score ?? 0;
    return {
      fillColor: getRiskColorRaw(risk),
      weight: 2,
      opacity: 1,
      color: "#fff",
      fillOpacity: 0.65,
    };
  }, []);

  const onEachFeature = useCallback(
    (feature: any, layer: Layer) => {
      const props = feature.properties as RegionProperties;
      const riskPct = (props.risk_score * 100).toFixed(0);
      const riskColor = getRiskColorRaw(props.risk_score);
      const riskLabel = getRiskLabel(props.risk_score);

      const popupContent = `
        <div class="${styles.popup}">
          <div class="${styles.popupName}">${props.name}</div>
          <table class="${styles.popupTable}">
            <tr>
              <td class="${styles.popupLabel}">Population</td>
              <td class="${styles.popupValue}">${props.population?.toLocaleString() ?? "N/A"}</td>
            </tr>
            <tr>
              <td class="${styles.popupLabel}">Area</td>
              <td class="${styles.popupValue}">${props.area_km2 ? props.area_km2.toLocaleString() + " km\u00B2" : "N/A"}</td>
            </tr>
            <tr>
              <td class="${styles.popupLabel}">Risk</td>
              <td class="${styles.popupValue}">
                <span class="${styles.popupRisk}">
                  <span class="${styles.popupRiskDot}" style="background-color:${riskColor}"></span>
                  ${riskLabel} (${riskPct}%)
                </span>
              </td>
            </tr>
          </table>
          <button class="${styles.viewBtn}" onclick="window.__selectRegion(${props.id})">View Details</button>
        </div>
      `;

      layer.bindPopup(popupContent);
      layer.on({ click: () => onSelectRegion(props.id) });
    },
    [onSelectRegion]
  );

  // Expose region selector for popup button
  React.useEffect(() => {
    (window as any).__selectRegion = onSelectRegion;
    return () => {
      delete (window as any).__selectRegion;
    };
  }, [onSelectRegion]);

  const geoJsonKey = useMemo(() => JSON.stringify(data), [data]);

  return (
    <div className={styles.container} role="region" aria-label="Interactive map of Tanzania regions">
      <MapContainer
        center={[-6.5, 35.0]}
        zoom={6}
        className={styles.map}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {data.features.length > 0 && (
          <GeoJSON
            key={geoJsonKey}
            data={data as any}
            style={style}
            onEachFeature={onEachFeature}
          />
        )}
      </MapContainer>
      <Legend />
    </div>
  );
};

export default React.memo(MapView);
