import { motion } from 'framer-motion'
import { AlertTriangle, BatteryCharging, Gauge, Mountain, Radio, Route, Wifi } from 'lucide-react'
import { Card } from './ui-card'

const Metric = ({ label, value, unit }) => (
  <div className="rounded-xl bg-slate-800/70 p-3">
    <p className="text-xs text-slate-400">{label}</p>
    <p className="text-lg font-semibold">{value} <span className="text-xs text-slate-400">{unit}</span></p>
  </div>
)

export function CameraPanel({ mode, frontFeed, rearFeed }) {
  return (
    <Card className="col-span-12 lg:col-span-8">
      <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">YOLO Vision</h2><span className="rounded bg-blue-500/20 px-2 py-1 text-xs text-blue-300">Modo {mode}</span></div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="aspect-video rounded-xl border border-slate-700 bg-slate-950 p-2"><p className="mb-2 text-xs text-slate-400">Frontal</p><p className="text-sm">{frontFeed}</p></div>
        <div className="aspect-video rounded-xl border border-slate-700 bg-slate-950 p-2"><p className="mb-2 text-xs text-slate-400">Trasera</p><p className="text-sm">{rearFeed}</p></div>
      </div>
    </Card>
  )
}

export function VehicleMetrics({ obd }) { return <Card className="col-span-12 lg:col-span-4"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Gauge size={18}/>Telemetría OBD2/CAN</h2><div className="grid grid-cols-2 gap-2"><Metric label="Velocidad" value={obd.speed} unit="km/h"/><Metric label="RPM" value={obd.rpm} unit="rpm"/><Metric label="Marcha" value={obd.gear} unit=""/><Metric label="Temp Motor" value={obd.engineTemp} unit="°C"/></div></Card> }

export function EnergyPanel({ energy }) { return <Card className="col-span-12 md:col-span-6 lg:col-span-3"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><BatteryCharging size={18}/>Energía LiFePO4</h2><div className="space-y-2"><Metric label="SOC" value={energy.soc} unit="%"/><Metric label="Voltaje" value={energy.voltage} unit="V"/><Metric label="Corriente" value={energy.current} unit="A"/></div></Card> }

export function OffroadPanel({ offroad }) { return <Card className="col-span-12 md:col-span-6 lg:col-span-3"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Mountain size={18}/>Off-road</h2><div className="space-y-2"><Metric label="Inclinación" value={offroad.pitch} unit="°"/><Metric label="Balanceo" value={offroad.roll} unit="°"/><Metric label="Altitud" value={offroad.altitude} unit="m"/></div></Card> }

export function RouteRiskPanel({ route }) { return <Card className="col-span-12 lg:col-span-3"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Route size={18}/>Riesgo de Ruta</h2><p className="text-sm">Nivel: <span className="font-semibold">{route.riskLevel}</span></p><p className="mt-2 text-sm text-slate-300">{route.message}</p></Card> }

export function ConnectivityPanel({ connectivity }) { return <Card className="col-span-12 lg:col-span-3"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><Wifi size={18}/>Conectividad</h2><div className="space-y-2 text-sm"><p>4G/LTE: {connectivity.lte}</p><p>GPS: {connectivity.gps}</p><p>Backend: {connectivity.backend}</p><p className="flex items-center gap-1 text-slate-300"><Radio size={14}/>WS: {connectivity.ws ? 'Online' : 'Offline'}</p></div></Card> }

export function EventList({ events }) { return <Card className="col-span-12 lg:col-span-6"><h2 className="mb-3 flex items-center gap-2 text-lg font-semibold"><AlertTriangle size={18}/>Eventos y Alertas</h2><div className="space-y-2 max-h-52 overflow-auto">{events.map((e) => <motion.div key={e.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-lg border border-slate-700 p-2"><p className="text-sm font-medium">{e.title}</p><p className="text-xs text-slate-400">{e.timestamp} · {e.level}</p></motion.div>)}</div><p className="mt-3 text-xs text-slate-500">Persistencia de eventos debe hacerse en backend SQLite (FastAPI), no en frontend.</p></Card> }
