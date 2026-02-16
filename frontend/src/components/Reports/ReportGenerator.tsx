import React, { useState } from "react";
import { useReport } from "../../hooks/useReport";
import LoadingSpinner from "../Common/LoadingSpinner";
import styles from "./ReportGenerator.module.css";

interface ReportGeneratorProps {
  selectedRegionIds: number[];
}

const ReportGenerator: React.FC<ReportGeneratorProps> = ({ selectedRegionIds }) => {
  const { mutate, data, isPending, error } = useReport();
  const [includeOptions, setIncludeOptions] = useState({ forecast: true, optimization: true });

  const handleGenerate = () => {
    if (selectedRegionIds.length === 0) return;
    mutate({
      region_ids: selectedRegionIds,
      include_forecast: includeOptions.forecast,
      include_optimization: includeOptions.optimization,
    });
  };

  const noRegions = selectedRegionIds.length === 0;

  return (
    <div className={styles.container} role="region" aria-label="Report generator">
      <div className={styles.header}>
        <svg className={styles.headerIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <h3 className={styles.title}>NLP Report Generator</h3>
      </div>

      <fieldset className={styles.options}>
        <legend className="sr-only">Report options</legend>
        <label className={styles.optionLabel}>
          <input
            type="checkbox"
            className={styles.optionCheckbox}
            checked={includeOptions.forecast}
            onChange={(e) => setIncludeOptions((p) => ({ ...p, forecast: e.target.checked }))}
          />
          Include Forecast Data
        </label>
        <label className={styles.optionLabel}>
          <input
            type="checkbox"
            className={styles.optionCheckbox}
            checked={includeOptions.optimization}
            onChange={(e) => setIncludeOptions((p) => ({ ...p, optimization: e.target.checked }))}
          />
          Include Optimization Results
        </label>
      </fieldset>

      <button
        className={styles.generateBtn}
        onClick={handleGenerate}
        disabled={isPending || noRegions}
        aria-busy={isPending}
      >
        {isPending ? "Generating..." : "Generate Report"}
      </button>

      {noRegions && (
        <p className={styles.hint}>Select a region first to generate a report.</p>
      )}

      {isPending && <LoadingSpinner message="Generating NLP summary..." size="small" />}

      {error && (
        <p className={styles.error} role="alert">
          Failed to generate report. Please try again.
        </p>
      )}

      {data && (
        <div className={styles.result}>
          <div className={styles.resultLabel}>AI-Generated Summary</div>
          <p className={styles.resultText}>{data.summary}</p>
          <div className={styles.resultMeta}>
            {data.regions_analyzed} region(s) analyzed &middot; Model: {data.model_used}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
