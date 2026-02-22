import { useState, useCallback, useEffect, useRef } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { BarChart3 } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type ModelType = "prophet" | "arima" | "hybrid";

export default function Dashboard({
  sidebarOpen,
  onCloseSidebar,
}: {
  sidebarOpen: boolean;
  onCloseSidebar: () => void;
}) {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [modelType, setModelType] = useState<ModelType>("prophet");
  const { data: regionsData, isLoading: regionsLoading, error: regionsError, refetch } = useRegions();
  const { data: forecast, isLoading: forecastLoading } = useForecast(selectedRegionId, 30, modelType);
  const optimizer = useOptimizer();

  const forecastRef = useRef<HTMLElement>(null);
  const optimizerRef = useRef<HTMLElement>(null);
  const reportRef = useRef<HTMLElement>(null);

  const handleSelectRegion = useCallback((id: number) => {
    setSelectedRegionId(id);
  }, []);

  useEffect(() => {
    const sections = [forecastRef.current, optimizerRef.current, reportRef.current].filter(Boolean);
    sections.forEach((section) => {
      gsap.fromTo(
        section,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
            toggleActions: "play none none reverse",
          },
        }
      );
    });

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, [regionsData]);

  if (regionsLoading) return <LoadingSpinner message="Loading regions..." />;
  if (regionsError) return <ErrorAlert message="Failed to load region data. Check your connection." onRetry={() => refetch()} />;
  if (!regionsData) return null;

  const regionList = regionsData.features.map((f) => f.properties);

  return (
    <div className="flex flex-1">
      <Sidebar
        regions={regionList}
        selectedRegionId={selectedRegionId}
        onSelectRegion={handleSelectRegion}
        isOpen={sidebarOpen}
        onClose={onCloseSidebar}
      />

      <main className="flex-1 overflow-y-auto" role="main" aria-label="Dashboard content">
        {/* Map Section */}
        <section className="p-4 lg:p-6" aria-label="Region map">
          <MapView geojson={regionsData} selectedRegion={selectedRegionId} onSelectRegion={handleSelectRegion} />
        </section>

        {/* Content sections */}
        <div className="px-4 lg:px-6 pb-8 space-y-6">
          {/* Forecast Section */}
          <section ref={forecastRef} aria-label="Forecast">
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Forecast</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs value={modelType} onValueChange={(v) => setModelType(v as ModelType)}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="prophet">Prophet</TabsTrigger>
                    <TabsTrigger value="arima">ARIMA</TabsTrigger>
                    <TabsTrigger value="hybrid">Hybrid</TabsTrigger>
                  </TabsList>
                  <TabsContent value={modelType}>
                    <ForecastChart forecast={forecast} isLoading={forecastLoading} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </section>

          {/* Budget Optimizer Section */}
          <section ref={optimizerRef} aria-label="Budget optimizer">
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardContent className="pt-6">
                <BudgetForm
                  regions={regionList}
                  onSubmit={(req) => optimizer.mutate(req)}
                  isLoading={optimizer.isPending}
                />
                {optimizer.data && <Separator className="my-6" />}
                <ResultsPanel result={optimizer.data} />
              </CardContent>
            </Card>
          </section>

          {/* Report Generator Section */}
          <section ref={reportRef} aria-label="Report generator">
            <Card className="shadow-card hover:shadow-card-hover transition-shadow duration-300">
              <CardContent className="pt-6">
                <ReportGenerator
                  selectedRegionIds={selectedRegionId ? [selectedRegionId] : []}
                />
              </CardContent>
            </Card>
          </section>
        </div>
      </main>
    </div>
  );
}
