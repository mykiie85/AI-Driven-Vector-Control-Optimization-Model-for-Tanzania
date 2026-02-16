import React from "react";
import styles from "./Legend.module.css";

const RISK_LEVELS = [
  { label: "Low (0-30%)", color: "var(--risk-low)" },
  { label: "Medium (30-60%)", color: "var(--risk-medium)" },
  { label: "High (60-80%)", color: "var(--risk-high)" },
  { label: "Critical (80%+)", color: "var(--risk-critical)" },
];

const Legend: React.FC = () => (
  <div className={styles.legend} role="img" aria-label="Risk score legend: Low 0 to 30 percent green, Medium 30 to 60 percent orange, High 60 to 80 percent red, Critical above 80 percent dark red">
    <div className={styles.title}>Risk Score</div>
    {RISK_LEVELS.map((item) => (
      <div key={item.label} className={styles.item}>
        <span
          className={styles.swatch}
          style={{ backgroundColor: item.color }}
          aria-hidden="true"
        />
        <span>{item.label}</span>
      </div>
    ))}
  </div>
);

export default Legend;
