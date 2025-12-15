import { useState } from "react";
import { Header } from "@/components/Header";
import { AlertCard } from "@/components/AlertCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAlerts, useAlertsStats, useAcknowledgeAlert, AlertFilters } from "@/hooks/useAlerts";
import { useDevices } from "@/hooks/useDevices";
import { AlertTriangle, AlertCircle, Bell, CheckCircle2, Filter, FileDown, FileText, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import { exportToCSV, exportToPDF } from "@/lib/exportUtils";

const Alerts = () => {
  // Por padrão, mostrar apenas alertas pendentes (não reconhecidos)
  const [filters, setFilters] = useState<AlertFilters>({ acknowledged: false });
  const { data: alerts, isLoading } = useAlerts(filters);
  const { data: stats } = useAlertsStats();
  const { data: devices, isLoading: devicesLoading } = useDevices();
  const acknowledgeAlert = useAcknowledgeAlert();

  const handleAcknowledge = async (alertId: string) => {
    try {
      await acknowledgeAlert.mutateAsync({
        alertId,
        acknowledgedBy: "admin", // TODO: Replace with actual user when auth is implemented
      });
      toast.success("Alerta reconhecido com sucesso!");
    } catch (error) {
      toast.error("Erro ao reconhecer alerta");
      console.error(error);
    }
  };

  const handleFilterChange = (key: keyof AlertFilters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      if (value === "all") {
        delete newFilters[key];
      } else if (key === "acknowledged") {
        newFilters[key] = value === "true";
      } else {
        newFilters[key] = value as any;
      }

      return newFilters;
    });
  };

  const handleExportCSV = () => {
    try {
      if (!alerts || alerts.length === 0) {
        toast.error("Nenhum alerta para exportar");
        return;
      }
      exportToCSV(alerts, "alertas_sparx");
      toast.success(`${alerts.length} alertas exportados para CSV com sucesso!`);
    } catch (error) {
      toast.error("Erro ao exportar CSV");
      console.error(error);
    }
  };

  const handleExportPDF = () => {
    try {
      if (!alerts || alerts.length === 0) {
        toast.error("Nenhum alerta para exportar");
        return;
      }
      exportToPDF(alerts, stats, "relatorio_alertas_sparx");
      toast.success(`Relatório PDF gerado com ${alerts.length} alertas!`);
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="bg-gradient-primary p-8 rounded-2xl shadow-glow-orange">
            <div className="flex items-center gap-3 mb-2">
              <Bell className="w-10 h-10 text-primary-foreground" />
              <h1 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground">
                Central de Alertas
              </h1>
            </div>
            <p className="text-lg text-primary-foreground/90">
              Monitore e gerencie todos os alertas de temperatura dos transformadores
            </p>
            {stats && stats.unacknowledged > 0 && (
              <div className="mt-4 inline-flex items-center gap-2 bg-destructive/20 border border-destructive/50 text-primary-foreground px-4 py-2 rounded-lg">
                <AlertCircle className="w-5 h-5" />
                <span className="font-semibold">
                  {stats.unacknowledged} {stats.unacknowledged === 1 ? 'alerta pendente' : 'alertas pendentes'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <Card className="p-4 bg-card border-border">
              <div className="flex flex-col items-center text-center">
                <Bell className="w-6 h-6 text-primary mb-2" />
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-display font-bold">{stats.total}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card border-border">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="w-6 h-6 text-status-precario mb-2" />
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-display font-bold">{stats.unacknowledged}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card border-status-critico/30">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="w-6 h-6 text-status-critico mb-2" />
                <p className="text-sm text-muted-foreground">Críticos</p>
                <p className="text-2xl font-display font-bold text-status-critico">{stats.critico}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card border-status-precario/30">
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-6 h-6 text-status-precario mb-2" />
                <p className="text-sm text-muted-foreground">Precários</p>
                <p className="text-2xl font-display font-bold text-status-precario">{stats.precario}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card border-status-critico/30 bg-status-critico/5">
              <div className="flex flex-col items-center text-center">
                <AlertCircle className="w-6 h-6 text-status-critico mb-2" />
                <p className="text-xs text-muted-foreground">Críticos Pendentes</p>
                <p className="text-2xl font-display font-bold text-status-critico">{stats.criticoUnack}</p>
              </div>
            </Card>

            <Card className="p-4 bg-card border-status-precario/30 bg-status-precario/5">
              <div className="flex flex-col items-center text-center">
                <AlertTriangle className="w-6 h-6 text-status-precario mb-2" />
                <p className="text-xs text-muted-foreground">Precários Pendentes</p>
                <p className="text-2xl font-display font-bold text-status-precario">{stats.precarioUnack}</p>
              </div>
            </Card>
          </div>
        )}

        {/* Filters and Export */}
        <Card className="p-6 mb-6 bg-card border-border">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-display font-bold">Filtros e Exportação</h2>
            </div>

            {/* Export Buttons */}
            <div className="flex items-center gap-2">
              <Button
                onClick={handleExportCSV}
                disabled={!alerts || alerts.length === 0}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Exportar CSV
              </Button>
              <Button
                onClick={handleExportPDF}
                disabled={!alerts || alerts.length === 0}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <FileText className="w-4 h-4" />
                Exportar PDF
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Filtro de Transformador (Esquerda) */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Transformador</label>
              <Select
                value={filters.deviceId || "all"}
                onValueChange={(value) => handleFilterChange("deviceId", value)}
                disabled={devicesLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os transformadores" />
                </SelectTrigger>
                <SelectContent className="max-h-[300px]">
                  <SelectItem value="all">Todos os transformadores</SelectItem>
                  {devices?.map((device) => (
                    <SelectItem key={device.id} value={device.id}>
                      {device.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Filtro de Status (Centro) */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Status</label>
              <Select
                value={filters.status || "all"}
                onValueChange={(value) => handleFilterChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="critico">Crítico</SelectItem>
                  <SelectItem value="precario">Precário</SelectItem>
                  <SelectItem value="adequado">Adequado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 3. Filtro de Reconhecimento (Direita) */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Reconhecimento</label>
              <Select
                value={filters.acknowledged === undefined ? "all" : String(filters.acknowledged)}
                onValueChange={(value) => handleFilterChange("acknowledged", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Não reconhecidos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="false">Apenas Pendentes</SelectItem>
                  <SelectItem value="true">Apenas Reconhecidos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Results Counter */}
        {!isLoading && alerts && (
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{alerts.length}</span> {alerts.length === 1 ? 'alerta' : 'alertas'}
              {filters.deviceId && devices && (
                <span> de <span className="font-semibold text-primary">
                  {devices.find(d => d.id === filters.deviceId)?.name}
                </span></span>
              )}
            </p>
            {(filters.status || filters.acknowledged !== undefined || filters.deviceId) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ acknowledged: false })}
                className="text-xs"
              >
                Limpar filtros
              </Button>
            )}
          </div>
        )}

        {/* Alerts List */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        ) : alerts && alerts.length > 0 ? (
          <div className="space-y-4">
            {alerts.map((alert) => (
              <AlertCard
                key={alert.id}
                alert={alert}
                onAcknowledge={handleAcknowledge}
                isAcknowledging={acknowledgeAlert.isPending}
              />
            ))}
          </div>
        ) : (
          <Card className="p-12 bg-card border-border">
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              <CheckCircle2 className="w-16 h-16 text-status-adequado" />
              <h2 className="text-2xl font-display font-bold">
                {filters.acknowledged === false
                  ? "🎉 Nenhum alerta pendente!"
                  : "Nenhum alerta encontrado"}
              </h2>
              <p className="text-muted-foreground">
                {filters.acknowledged === false
                  ? "Todos os alertas foram reconhecidos. Excelente trabalho!"
                  : "Tente ajustar os filtros para ver mais resultados"}
              </p>
              {filters.acknowledged === false && (
                <Button
                  onClick={() => setFilters({ acknowledged: undefined })}
                  variant="outline"
                  className="mt-4"
                >
                  Ver todos os alertas
                </Button>
              )}
            </div>
          </Card>
        )}
      </main>
    </>
  );
};

export default Alerts;

