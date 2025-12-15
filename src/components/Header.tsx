import { Link, useLocation } from "react-router-dom";
import { Activity, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertsStats } from "@/hooks/useAlerts";

export const Header = () => {
  const location = useLocation();
  const { data: alertsStats } = useAlertsStats();

  const navItems = [
    { path: "/", label: "Mapa" },
    { path: "/dashboard", label: "Monitoramento" },
    { path: "/analytics", label: "Análise de Dados" },
    { path: "/devices", label: "Dispositivos" },
    { path: "/alerts", label: "Alertas" },
  ];

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <Activity className="w-8 h-8 text-primary" />
              <div className="absolute inset-0 blur-xl opacity-50">
                <Activity className="w-8 h-8 text-primary" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold bg-gradient-primary bg-clip-text text-transparent">
                SparX
              </h1>
            </div>
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "px-4 py-2 rounded-lg font-medium transition-all duration-200 relative",
                    location.pathname === item.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {item.path === "/alerts" && <Bell className="w-4 h-4" />}
                    {item.label}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Botão de Alertas Pendentes - Apenas na página do mapa */}
            {location.pathname === "/" && alertsStats && alertsStats.unacknowledged > 0 && (
              <Link
                to="/alerts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg font-semibold hover:bg-destructive/90 transition-colors cursor-pointer z-[100] relative"
                style={{ pointerEvents: 'auto' }}
              >
                <Bell className="w-4 h-4" />
                <span>
                  {alertsStats.unacknowledged > 99 ? "99+" : alertsStats.unacknowledged}
                </span>
                <span className="hidden sm:inline">
                  {alertsStats.unacknowledged === 1 ? "Alerta Pendente" : "Alertas Pendentes"}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
