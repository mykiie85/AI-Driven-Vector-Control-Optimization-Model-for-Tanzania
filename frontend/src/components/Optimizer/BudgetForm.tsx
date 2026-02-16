import React, { useState } from "react";
import { RegionProperties, OptimizationRequest } from "../../types";
import styles from "./BudgetForm.module.css";

interface BudgetFormProps {
  regions: RegionProperties[];
  onSubmit: (request: OptimizationRequest) => void;
  isLoading: boolean;
}

const BudgetForm: React.FC<BudgetFormProps> = ({ regions, onSubmit, isLoading }) => {
  const [budget, setBudget] = useState<number>(50000);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const toggleRegion = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedIds(regions.map((r) => r.id));
  const clearAll = () => setSelectedIds([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0 || budget <= 0) return;
    onSubmit({ budget_usd: budget, region_ids: selectedIds });
  };

  return (
    <form
      className={styles.form}
      onSubmit={handleSubmit}
      aria-label="Budget optimization form"
    >
      <div className={styles.header}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
        </svg>
        <h3 className={styles.title}>Budget Optimizer</h3>
      </div>

      <div className={styles.fieldGroup}>
        <label htmlFor="budget-input" className={styles.label}>
          Total Budget (USD)
        </label>
        <input
          id="budget-input"
          type="number"
          className={styles.input}
          value={budget}
          onChange={(e) => setBudget(Number(e.target.value))}
          min={1}
          aria-describedby="budget-hint"
        />
        <div id="budget-hint" className={styles.inputHint}>
          Minimum $1. Allocated across selected regions by risk weight.
        </div>
      </div>

      <div className={styles.fieldGroup}>
        <div className={styles.regionHeader}>
          <label className={styles.label} id="region-list-label">Target Regions</label>
          <button
            type="button"
            className={styles.selectAllBtn}
            onClick={selectedIds.length === regions.length ? clearAll : selectAll}
          >
            {selectedIds.length === regions.length ? "Clear All" : "Select All"}
          </button>
        </div>

        <div
          className={styles.regionList}
          role="group"
          aria-labelledby="region-list-label"
        >
          {regions.map((r) => (
            <label
              key={r.id}
              className={`${styles.regionItem} ${
                selectedIds.includes(r.id) ? styles.regionItemSelected : ""
              }`}
            >
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={selectedIds.includes(r.id)}
                onChange={() => toggleRegion(r.id)}
                aria-label={`${r.name} - Risk ${(r.risk_score * 100).toFixed(0)}%`}
              />
              {r.name}
            </label>
          ))}
        </div>
      </div>

      <button
        type="submit"
        className={styles.submitBtn}
        disabled={isLoading || selectedIds.length === 0}
        aria-busy={isLoading}
      >
        {isLoading ? (
          <>
            <span className="sr-only">Optimizing budget allocation</span>
            Optimizing...
          </>
        ) : (
          "Run Optimization"
        )}
      </button>

      {selectedIds.length > 0 && (
        <div className={styles.selectedCount}>
          {selectedIds.length} of {regions.length} regions selected
        </div>
      )}
    </form>
  );
};

export default BudgetForm;
