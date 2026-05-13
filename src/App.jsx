import { useEffect, useMemo, useState } from 'react'
import { CameraPanel, ConnectivityPanel, EnergyPanel, EventList, OffroadPanel, RouteRiskPanel, VehicleMetrics } from './components/panels'

const fallback = {
  obd: { speed: 0, rpm: 720, gear: 'P', engineTemp: 75, driveMode: 'P' },
  energy: { soc: 87, voltage: 13.2, current: 4.1 },
  offroad: { pitch: 2, roll: 1, altitude: 412 },
  route: { riskLevel: 'Bajo', message: 'Sin incidentes relevantes.' },
  connectivity: { lte: 'Bueno', gps: 'Fix 3D', backend: 'Conectado', ws: false },
  events: [{ id: 'init', title: 'Sistema iniciado en modo observación', timestamp: new Date().toISOString(), level: 'info' }],
  camera: { frontFeed: 'YOLO stream listo', rearFeed: 'Rear stream listo' }
}

function computePriorityMode({ speed = 0, driveMode = 'P' }) {
  if (driveMode === 'R' || speed < 10) return 'R'
  if (driveMode === 'D' || driveMode === 'S') return 'D/S'
  return 'P/N'
}

export default function App() {
  const [status, setStatus] = useState(fallback)

  useEffect(() => {
    let ws
    const syncRest = async () => {
      try {
        const r = await fetch('/api/status')
        if (!r.ok) return
        const json = await r.json()
        setStatus((prev) => ({ ...prev, ...json }))
      } catch {
        // fallback a websocket
      }
    }

    syncRest()
    ws = new WebSocket('ws://localhost:8000/ws/status')
    ws.onmessage = (event) => {
      try {
        const json = JSON.parse(event.data)
        setStatus((prev) => ({ ...prev, ...json, connectivity: { ...prev.connectivity, ...(json.connectivity || {}), ws: true } }))
      } catch {}
    }
    ws.onerror = () => setStatus((prev) => ({ ...prev, connectivity: { ...prev.connectivity, ws: false, backend: 'Error WS' } }))
    ws.onclose = () => setStatus((prev) => ({ ...prev, connectivity: { ...prev.connectivity, ws: false } }))

    return () => ws && ws.close()
  }, [])

  const mode = useMemo(() => computePriorityMode(status.obd), [status.obd])

  return (
    <main className="min-h-screen bg-slate-950 p-3 md:p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
        <h1 className="text-xl font-bold">Edge-Tracker v3.7 · Land Cruiser GDJ150L</h1>
        <p className="text-xs text-slate-400">Solo observación, alertas y registro. Control autónomo deshabilitado.</p>
      </header>
      <section className="grid grid-cols-12 gap-3">
        <CameraPanel mode={mode} frontFeed={status.camera.frontFeed} rearFeed={status.camera.rearFeed} />
        <VehicleMetrics obd={status.obd} />
        <EnergyPanel energy={status.energy} />
        <OffroadPanel offroad={status.offroad} />
        <RouteRiskPanel route={status.route} />
        <ConnectivityPanel connectivity={status.connectivity} />
        <EventList events={status.events} />
      </section>
    </main>
  )
}
