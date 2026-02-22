import { Shield, Mail, Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-green-200 mt-12"
      style={{ background: "hsl(120 60% 96%)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-6 h-6 text-green-600" />
              <span className="text-gray-900 font-bold text-lg">VCOM-TZ</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed max-w-xs">
              AI-Driven Vector Control Optimization Model for Tanzania.
              Empowering public health officials to combat malaria through
              predictive analytics and resource optimization.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-4">Platform</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li><a href="#risk-maps" className="hover:text-gray-900 transition-colors">Risk Maps</a></li>
              <li><a href="#forecast" className="hover:text-gray-900 transition-colors">Forecasting</a></li>
              <li><a href="#budget" className="hover:text-gray-900 transition-colors">Budget Optimizer</a></li>
              <li><a href="#report" className="hover:text-gray-900 transition-colors">Reports</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-700 mb-4">Technology</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>FastAPI + PostgreSQL</li>
              <li>React + TypeScript</li>
              <li>Prophet + ARIMA</li>
              <li>NLP Report Generation</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-green-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-600">
            Developed by <span className="text-green-600 font-medium">Mike Sanga</span>
          </p>
          <div className="flex items-center gap-4">
            <a href="mailto:mykiie85@gmail.com" className="text-gray-600 hover:text-green-600 transition-colors flex items-center gap-1 text-xs">
              <Mail className="w-3.5 h-3.5" /> mykiie85@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
