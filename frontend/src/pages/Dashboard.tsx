import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  FunnelChart, Funnel, LabelList,
  LineChart, Line, ResponsiveContainer
} from "recharts";

// Tipos de datos
interface LeadByCampaign {
  campaign: string;
  leads: number;
}

interface FunnelStage {
  stage: string;
  value: number;
}

interface ResponseTime {
  date: string;
  avgResponseHours: number;
}

export default function Dashboard() {
  const [from, setFrom] = useState("2025-01-01");
  const [to, setTo] = useState("2025-01-31");

  const [leadsByCampaign, setLeadsByCampaign] = useState<LeadByCampaign[]>([]);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [responseTime, setResponseTime] = useState<ResponseTime[]>([]);

 useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Leads por campaña
        const resCampaign = await fetch(
          `/api/leads-by-campaign?from=${from}&to=${to}`
        );
        const dataCampaign = await resCampaign.json();
        setLeadsByCampaign(dataCampaign);

        // 2. Embudo (% conversión por etapa)
        const resFunnel = await fetch(
          `/api/leads-funnel?from=${from}&to=${to}`
        );
        const dataFunnel = await resFunnel.json();
        setFunnelData(dataFunnel);

        // 3. Tiempo medio de respuesta
        const resResponse = await fetch(
          `/api/leads-response-time?from=${from}&to=${to}`
        );
        const dataResponse = await resResponse.json();
        setResponseTime(dataResponse);
      } catch (error) {
        console.error("Error al cargar dashboard:", error);
      }
    };

    if (from && to) {
      fetchData();
    }
  }, [from, to]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard de Rendimiento</h1> 

      {/* Filtros */}
      <div className="filters-container">
        <label>
          Desde:
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </label>
        <label>
          Hasta:
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </label>
      </div>

      {/* Gráfica de Barras */}
      <div className="chart-card">
        <h2 className="chart-title">Leads por campaña</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={leadsByCampaign}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="campaign" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="leads" fill="#0bc0b7" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Embudo */}
      <div className="chart-card">
        <h2 className="chart-title">% Conversión por etapa</h2>
        <ResponsiveContainer width="100%" height={300}>
          <FunnelChart>
            <Tooltip />
            <Funnel dataKey="value" data={funnelData} isAnimationActive>
              <LabelList dataKey="stage" position="right" />
            </Funnel>
          </FunnelChart>
        </ResponsiveContainer>
      </div>

      {/* Línea */}
      <div className="chart-card">
        <h2 className="chart-title">Tiempo medio de respuesta (horas)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={responseTime}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="avgResponseHours" stroke="#007bff" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
