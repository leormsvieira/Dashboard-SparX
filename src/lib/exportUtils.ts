import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Alert } from "@/hooks/useAlerts";

// CSV Export
export const exportToCSV = (alerts: Alert[], filename: string = "alertas") => {
  if (!alerts || alerts.length === 0) {
    throw new Error("Nenhum alerta para exportar");
  }

  // Define CSV headers
  const headers = [
    "ID",
    "Dispositivo",
    "Número de Série",
    "Localização",
    "Temperatura (°C)",
    "Status",
    "Mensagem",
    "Reconhecido",
    "Reconhecido Por",
    "Data de Reconhecimento",
    "Data de Criação",
  ];

  // Convert alerts to CSV rows
  const rows = alerts.map((alert) => [
    alert.id,
    alert.device?.name || "N/A",
    alert.device?.serial_number || "N/A",
    alert.device?.location || "N/A",
    alert.temperature.toFixed(2),
    alert.status,
    alert.message || "N/A",
    alert.acknowledged ? "Sim" : "Não",
    alert.acknowledged_by || "N/A",
    alert.acknowledged_at
      ? new Date(alert.acknowledged_at).toLocaleString("pt-BR")
      : "N/A",
    alert.created_at
      ? new Date(alert.created_at).toLocaleString("pt-BR")
      : "N/A",
  ]);

  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    ),
  ].join("\n");

  // Create blob and download
  const blob = new Blob(["\ufeff" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// PDF Export
export const exportToPDF = (
  alerts: Alert[],
  stats?: {
    total: number;
    unacknowledged: number;
    critico: number;
    precario: number;
    adequado: number;
    criticoUnack: number;
    precarioUnack: number;
  },
  filename: string = "alertas"
) => {
  if (!alerts || alerts.length === 0) {
    throw new Error("Nenhum alerta para exportar");
  }

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Title
  doc.setFontSize(20);
  doc.setTextColor(255, 102, 0); // Orange color
  doc.text("SparX - Relatório de Alertas", pageWidth / 2, 15, {
    align: "center",
  });

  // Subtitle with date
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Gerado em: ${new Date().toLocaleString("pt-BR")}`,
    pageWidth / 2,
    22,
    { align: "center" }
  );

  let yPosition = 30;

  // Statistics section
  if (stats) {
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Estatísticas", 14, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const statsText = [
      `Total de Alertas: ${stats.total}`,
      `Alertas Pendentes: ${stats.unacknowledged}`,
      `Alertas Críticos: ${stats.critico} (${stats.criticoUnack} pendentes)`,
      `Alertas Precários: ${stats.precario} (${stats.precarioUnack} pendentes)`,
      `Alertas Adequados: ${stats.adequado}`,
    ];

    statsText.forEach((text) => {
      doc.text(text, 14, yPosition);
      yPosition += 5;
    });

    yPosition += 5;
  }

  // Alerts table
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text("Lista de Alertas", 14, yPosition);
  yPosition += 5;

  const tableData = alerts.map((alert) => [
    alert.device?.name || "N/A",
    `${alert.temperature.toFixed(1)}°C`,
    alert.status === "critico"
      ? "Crítico"
      : alert.status === "precario"
      ? "Precário"
      : "Adequado",
    alert.acknowledged ? "Sim" : "Não",
    alert.created_at
      ? new Date(alert.created_at).toLocaleDateString("pt-BR")
      : "N/A",
  ]);

  autoTable(doc, {
    startY: yPosition,
    head: [["Dispositivo", "Temperatura", "Status", "Reconhecido", "Data"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [255, 102, 0], // Orange
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: "center" },
      2: { cellWidth: 30, halign: "center" },
      3: { cellWidth: 30, halign: "center" },
      4: { cellWidth: 35, halign: "center" },
    },
  });

  // Save PDF
  doc.save(`${filename}_${new Date().toISOString().split("T")[0]}.pdf`);
};

