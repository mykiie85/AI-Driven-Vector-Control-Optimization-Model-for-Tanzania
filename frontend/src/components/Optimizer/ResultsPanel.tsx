import React from "react";
import { OptimizationResponse } from "../../types";
import styles from "./ResultsPanel.module.css";

interface ResultsPanelProps {
  result: OptimizationResponse | undefined;
}

const EmptyState: React.FC = () => (
  <div className={styles.emptyState}>
    <svg className={styles.emptyIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
    <p className={styles.emptyText}>
      Run the optimizer above to see allocation results here.
    </p>
  </div>
);

const ResultsPanel: React.FC<ResultsPanelProps> = ({ result }) => {
  if (!result) return <EmptyState />;

  return (
    <div className={styles.container} role="region" aria-label="Optimization results">
      <div className={styles.metrics}>
        <div className={`${styles.metricCard} ${styles.metricBudget}`}>
          <div className={styles.metricLabel}>Budget</div>
          <div className={styles.metricValue}>${result.total_budget.toLocaleString()}</div>
        </div>
        <div className={`${styles.metricCard} ${styles.metricUsed}`}>
          <div className={styles.metricLabel}>Used</div>
          <div className={styles.metricValue}>${result.total_cost.toLocaleString()}</div>
        </div>
        <div className={`${styles.metricCard} ${styles.metricPrevented}`}>
          <div className={styles.metricLabel}>Cases Prevented</div>
          <div className={styles.metricValue}>{result.total_cases_prevented.toLocaleString()}</div>
        </div>
      </div>

      <table className={styles.table} aria-label="Resource allocation per region">
        <thead>
          <tr>
            <th scope="col">Region</th>
            <th scope="col">ITNs</th>
            <th scope="col">IRS</th>
            <th scope="col">Larvicide</th>
            <th scope="col">Cost</th>
          </tr>
        </thead>
        <tbody>
          {result.allocations.map((a) => (
            <tr key={a.region_id}>
              <td>{a.region_name}</td>
              <td>{a.itn_units.toLocaleString()}</td>
              <td>{a.irs_units.toLocaleString()}</td>
              <td>{a.larvicide_units.toLocaleString()}</td>
              <td>${a.cost.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultsPanel;
