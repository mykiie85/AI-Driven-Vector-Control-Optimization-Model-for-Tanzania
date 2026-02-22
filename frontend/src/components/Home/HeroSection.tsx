import { ArrowDown, MapPin, Brain, BarChart3 } from "lucide-react";

const FEATURES = [
  { icon: MapPin, label: "Geospatial Risk Mapping", desc: "Interactive maps showing malaria risk across all 16 regions" },
  { icon: Brain, label: "AI Forecasting", desc: "Hybrid ARIMA + Prophet models for outbreak prediction" },
  { icon: BarChart3, label: "Budget Optimization", desc: "Linear programming to maximize cases prevented per dollar" },
];

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16">
      {/* Background images grid blended with light overlay */}
      <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 opacity-55">
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/images/top_right.jpg')" }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/images/bottom_left.jpg')" }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/images/bottom_right.jpg')" }} />
        <div className="bg-cover bg-center" style={{ backgroundImage: "url('/images/image_1_1771685894190.jpg')" }} />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[rgba(245,245,244,0.75)] via-[rgba(220,252,231,0.65)] to-[rgba(245,245,244,0.8)]" />

      {/* Green radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-20"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.3) 0%, transparent 70%)", filter: "blur(60px)" }} />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-4 sm:px-6">
        <div className="inline-block px-4 py-1.5 mb-6 rounded-full text-xs font-semibold uppercase tracking-widest"
          style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", color: "#16a34a" }}>
          AI-Powered Malaria Control
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-gray-900 leading-[1.1] tracking-tight mb-6">
          Saving Lives with
          <br />
          <span className="gradient-text">Data-Driven</span> Decisions
        </h1>

        <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          VCOM-TZ empowers Tanzania's health authorities to move from reactive to proactive
          malaria control through predictive analytics, resource optimization, and
          AI-generated insights.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16">
          <a href="#risk-maps"
            className="px-7 py-3 bg-green-600 text-white font-semibold text-sm rounded-lg hover:bg-green-700 transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(34,197,94,0.3)]">
            Explore Dashboard
          </a>
          <a href="#forecast"
            className="px-7 py-3 border border-green-300 text-green-700 font-medium text-sm rounded-lg hover:bg-green-50 hover:border-green-400 transition-all">
            View Forecasts
          </a>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {FEATURES.map(({ icon: Icon, label, desc }) => (
            <div key={label} className="glass-card p-5 text-left">
              <Icon className="w-5 h-5 text-green-600 mb-3" />
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{label}</h3>
              <p className="text-xs text-gray-600 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ArrowDown className="w-5 h-5 text-green-600/60" />
      </div>
    </section>
  );
}
