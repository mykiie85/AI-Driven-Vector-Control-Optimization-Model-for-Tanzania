import React, { useState, useCallback } from "react";
import { useRegions } from "../../hooks/useRegions";
import { useForecast } from "../../hooks/useForecast";
import { useOptimizer } from "../../hooks/useOptimizer";
import MapView from "../Map/MapView";
import Sidebar from "./Sidebar";
import ForecastChart from "../Charts/ForecastChart";
import BudgetForm from "../Optimizer/BudgetForm";
import ResultsPanel from "../Optimizer/ResultsPanel";
import ReportGenerator from "../Reports/ReportGenerator";
import LoadingSpinner from "../Common/LoadingSpinner";
import ErrorAlert from "../Common/ErrorAlert";
import styles from "./Dashboard.module.css";

type ModelType = "prophet" | "arima" | "hybrid";

const Dashboard: React.FC<{ sidebarOpen: boolean; onCloseSidebar: () => void }> = ({
  sidebarOpen,
  onCloseSidebar,
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [modelType, setModelType] = useState<ModelType>("prophet");
  const { data: regionsData, isLoading: regionsLoading, error: regionsError, refetch } = useRegions();
  const { data: forecast, isLoading: forecastLoading } = useForecast(selectedRegionId, 30, modelType);
  const optimizer = useOptimizer();

  const handleSelectRegion = useCallback((id: number) => {
    setSelectedRegionId(id);
  }, []);

  if (regionsLoading) return <LoadingSpinner message="Loading regions..." />;
  if (regionsError) return <ErrorAlert message="Failed to load region data. Check your connection." onRetry={() => refetch()} />;
  if (!regionsData) return null;

  const regionList = regionsData.features.map((f) => f.properties);

  return (
    <div className={styles.layout}>
      <Sidebar
        regions={regionList}
        selectedRegionId={selectedRegionId}
        onSelectRegion={handleSelectRegion}
        isOpen={sidebarOpen}
        onClose={onCloseSidebar}
      />

      <main className={styles.main} role="main" aria-label="Dashboard content">
        {/* Map */}
        <section className={styles.mapSection} aria-label="Region map">
          <MapView data={regionsData} onSelectRegion={handleSelectRegion} />
        </section>

        {/* Panels */}
        <section className={styles.panels} aria-label="Analysis panels">
          <div className={styles.panelGrid}>
            {/* Forecast Panel */}
            <div className={styles.panelCard}>
              <div className={styles.sectionHeader}>
                <svg className={styles.sectionIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M3 3v18h18" /><path d="M7 16l4-8 4 4 4-6" />
                </svg>
                <h2 className={styles.sectionTitle}>Forecast</h2>
              </div>

              {/* Model selector tabs */}
              <div className={styles.tabBar} role="tablist" aria-label="Forecast model">
                {(["prophet", "arima", "hybrid"] as ModelType[]).map((m) => (
                  <button
                    key={m}
                    className={`${styles.tab} ${modelType === m ? styles.tabActive : ""}`}
                    onClick={() => setModelType(m)}
                    role="tab"
                    aria-selected={modelType === m}
                  >
                    {m.charAt(0).toUpperCase() + m.slice(1)}
                  </button>
                ))}
              </div>

              <ForecastChart forecast={forecast} isLoading={forecastLoading} />
            </div>

            {/* Optimizer + Report Panel */}
            <div className={styles.panelRight}>
              <BudgetForm
                regions={regionList}
                onSubmit={(req) => optimizer.mutate(req)}
                isLoading={optimizer.isPending}
              />
              <ResultsPanel result={optimizer.data} />
              <ReportGenerator
                selectedRegionIds={selectedRegionId ? [selectedRegionId] : []}
              />
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
