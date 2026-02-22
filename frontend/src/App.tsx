import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";
import HeroSection from "./components/Home/HeroSection";
import RiskMapSection from "./components/RiskMap/RiskMapSection";
import ForecastSection from "./components/Forecast/ForecastSection";
import OptimizerSection from "./components/Optimizer/OptimizerSection";
import ReportSection from "./components/Report/ReportSection";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen">
        <Header />
        <main>
          <HeroSection />
          <RiskMapSection />
          <ForecastSection />
          <OptimizerSection />
          <ReportSection />
        </main>
        <Footer />
      </div>
    </QueryClientProvider>
  );
}
