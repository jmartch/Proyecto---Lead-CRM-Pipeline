import { useEffect, useState } from "react"; 
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  FunnelChart, Funnel, LabelList, 
  LineChart, Line, ResponsiveContainer 
} from "recharts"; 
import '../utils/Dashboard.css' 
 
 
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
 
  // Simulación de endpoints 
  useEffect(() => { 
    setLeadsByCampaign([ 
      { campaign: "Facebook Ads", leads: 120 }, 
      { campaign: "Google Ads", leads: 80 }, 
      { campaign: "Email", leads: 50 } 
    ]); 
 
    setFunnelData([ 
      { stage: "Nuevo", value: 200 }, 
      { stage: "Contactado", value: 150 }, 
      { stage: "Calificado", value: 100 }, 
      { stage: "Oportunidad", value: 50 }, 
      { stage: "Cliente", value: 25 } 
    ]); 
 
    setResponseTime([ 
      { date: "2025-01-01", avgResponseHours: 4.2 }, 
      { date: "2025-01-02", avgResponseHours: 3.8 }, 
      { date: "2025-01-03", avgResponseHours: 5.1 }, 
      { date: "2025-01-04", avgResponseHours: 4.5 } 
    ]); 
  }, [from, to]); 
 
  return ( 
    <div className="dashboard-container"> 
      <h1 className="dashboard-title">Dashboard Desempeño</h1> 
 
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

      {/* Grid de gráficas - Layout horizontal */}
      <div className="charts-grid">
        {/* Primera fila: Gráfica de Barras */}
        <div className="chart-card full-width">
          <h2 className="chart-title">Leads por campaña</h2> 
          <ResponsiveContainer width="100%" height={300}> 
            <BarChart data={leadsByCampaign}> 
              <CartesianGrid strokeDasharray="3 3" /> 
              <XAxis dataKey="campaign" /> 
              <YAxis /> 
              <Tooltip /> 
              <Legend /> 
              <Bar dataKey="leads" fill="#3432b6ff" /> 
            </BarChart> 
          </ResponsiveContainer> 
        </div> 

        {/* Segunda fila: Embudo y Línea lado a lado */}
        <div className="chart-card half-width">
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

        <div className="chart-card half-width">
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
    </div> 
  ); 
}