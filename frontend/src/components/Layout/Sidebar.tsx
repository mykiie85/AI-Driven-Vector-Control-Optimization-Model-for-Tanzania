import React from "react";
import { RegionProperties } from "../../types";
import styles from "./Sidebar.module.css";

interface SidebarProps {
  regions: RegionProperties[];
  selectedRegionId: number | null;
  onSelectRegion: (id: number) => void;
  isOpen: boolean;
  onClose: () => void;
}

function getRiskColor(score: number): string {
  if (score >= 0.8) return "var(--risk-critical)";
  if (score >= 0.6) return "var(--risk-high)";
  if (score >= 0.3) return "var(--risk-medium)";
  return "var(--risk-low)";
}

function getRiskLabel(score: number): string {
  if (score >= 0.8) return "Critical";
  if (score >= 0.6) return "High";
  if (score >= 0.3) return "Medium";
  return "Low";
}

const Sidebar: React.FC<SidebarProps> = ({
  regions,
  selectedRegionId,
  onSelectRegion,
  isOpen,
  onClose,
}) => {
  const handleSelect = (id: number) => {
    onSelectRegion(id);
    onClose();
  };

  return (
    <>
      <div
        className={isOpen ? styles.overlayVisible : styles.overlay}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ""}`}
        role="navigation"
        aria-label="Region navigation"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Regions</h2>
          <p className={styles.count}>{regions.length} regions available</p>
        </div>
        <ul className={styles.list} role="listbox" aria-label="Select a region">
          {regions.map((r) => (
            <li key={r.id}>
              <button
                className={`${styles.item} ${r.id === selectedRegionId ? styles.itemActive : ""}`}
                onClick={() => handleSelect(r.id)}
                role="option"
                aria-selected={r.id === selectedRegionId}
              >
                <span
                  className={styles.riskDot}
                  style={{ backgroundColor: getRiskColor(r.risk_score) }}
                  aria-hidden="true"
                />
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{r.name}</div>
                  <div className={styles.itemMeta}>
                    Risk: {getRiskLabel(r.risk_score)} ({(r.risk_score * 100).toFixed(0)}%)
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </aside>
    </>
  );
};

export default Sidebar;
