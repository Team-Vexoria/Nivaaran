import React, { useState, useEffect } from 'react';
import { 
  Radio, Activity, Flame
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export interface TelemetryStation {
  id: string;
  stationName: string;
  district: string;
  location: string;
  domain: string;
  protocol: 'LoRaWAN Class A' | 'MQTT over 4G' | 'NB-IoT';
  brokerUrl: string;
  rssi: number;
  batteryVolts: number;
  lastPacketTime: string;
  status: 'ONLINE' | 'CRITICAL ALERT' | 'MAINTENANCE';
  metrics: Record<string, { value: number; unit: string; normalMax: number; isCritical: boolean }>;
  rawHexPayload: string;
}

const SEED_STATIONS: TelemetryStation[] = [
  {
    id: 'NODE-SUB-01',
    stationName: 'Subernarekha Basin Early Warning Node #12',
    district: 'Ranchi',
    location: 'Namkum Riverbank, Ranchi',
    domain: 'Clean Water & Sanitation',
    protocol: 'LoRaWAN Class A',
    brokerUrl: 'mqtts://telemetry.jharkhand.gov.in:8883',
    rssi: -76,
    batteryVolts: 3.82,
    lastPacketTime: '4s ago',
    status: 'ONLINE',
    metrics: {
      pH: { value: 7.2, unit: '', normalMax: 8.5, isCritical: false },
      Arsenic: { value: 0.008, unit: 'mg/L', normalMax: 0.01, isCritical: false },
      Turbidity: { value: 14.2, unit: 'NTU', normalMax: 25.0, isCritical: false },
      FlowRate: { value: 142.5, unit: 'm3/s', normalMax: 200.0, isCritical: false },
    },
    rawHexPayload: '0x0A 0x48 0x00 0x08 0x0E 0x14 0x8E',
  },
  {
    id: 'NODE-JHR-02',
    stationName: 'Jharia Colliery Gas Vent Monitor #04',
    district: 'Dhanbad',
    location: 'Lodna Fire Area, Dhanbad',
    domain: 'Hazardous Waste & Disaster',
    protocol: 'MQTT over 4G',
    brokerUrl: 'mqtts://mining.jharkhand.gov.in:8883',
    rssi: -84,
    batteryVolts: 3.65,
    lastPacketTime: '2s ago',
    status: 'CRITICAL ALERT',
    metrics: {
      SubsurfaceTemp: { value: 312.0, unit: '°C', normalMax: 150.0, isCritical: true },
      MethaneCH4: { value: 4.8, unit: '%', normalMax: 2.5, isCritical: true },
      CarbonMonoxide: { value: 118.0, unit: 'ppm', normalMax: 50.0, isCritical: true },
      SulfurDioxide: { value: 38.0, unit: 'ppm', normalMax: 20.0, isCritical: true },
    },
    rawHexPayload: '0x1F 0x38 0x04 0x50 0x76 0x26 0xBB',
  },
  {
    id: 'NODE-DAM-03',
    stationName: 'Damodar River Industrial TDS Station',
    district: 'Bokaro',
    location: 'Bokaro Steel Industrial Outlet',
    domain: 'Industrial Effluents',
    protocol: 'NB-IoT',
    brokerUrl: 'mqtts://telemetry.jharkhand.gov.in:8883',
    rssi: -68,
    batteryVolts: 4.10,
    lastPacketTime: '8s ago',
    status: 'ONLINE',
    metrics: {
      TotalDissolvedSolids: { value: 480.0, unit: 'ppm', normalMax: 500.0, isCritical: false },
      DissolvedOxygen: { value: 6.4, unit: 'mg/L', normalMax: 4.0, isCritical: false },
      ChromiumTrace: { value: 0.003, unit: 'mg/L', normalMax: 0.05, isCritical: false },
    },
    rawHexPayload: '0x02 0x1E 0x01 0xE0 0x06 0x04 0x03',
  },
  {
    id: 'NODE-BAU-04',
    stationName: 'BAU Kanke Agri-Telemetry Soil Probe',
    district: 'Ranchi',
    location: 'Birsa Agri University Experimental Plot',
    domain: 'Agriculture & Soil Health',
    protocol: 'LoRaWAN Class A',
    brokerUrl: 'mqtts://telemetry.jharkhand.gov.in:8883',
    rssi: -72,
    batteryVolts: 3.90,
    lastPacketTime: '12s ago',
    status: 'ONLINE',
    metrics: {
      SoilMoisture: { value: 38.5, unit: '%', normalMax: 20.0, isCritical: false },
      Nitrogen: { value: 140.0, unit: 'kg/ha', normalMax: 100.0, isCritical: false },
      Phosphorus: { value: 35.0, unit: 'kg/ha', normalMax: 25.0, isCritical: false },
    },
    rawHexPayload: '0x08 0x26 0x08 0xC0 0x23 0xAA',
  },
];

export const IoTSensorTelemetryStreamer: React.FC = () => {
  const [stations, setStations] = useState<TelemetryStation[]>(SEED_STATIONS);
  const [selectedStationId, setSelectedStationId] = useState<string>(stations[0].id);
  const [isSimulatingPulse, setIsSimulatingPulse] = useState(true);
  const [packetCount, setPacketCount] = useState(14820);

  const selectedStation = stations.find(s => s.id === selectedStationId) || stations[0];

  useEffect(() => {
    if (!isSimulatingPulse) return;
    const interval = setInterval(() => {
      setPacketCount(prev => prev + 1);
      setStations(prev => prev.map(st => {
        if (st.id === 'NODE-SUB-01') {
          const jitter = (Math.random() - 0.5) * 0.001;
          const newArsenic = Math.max(0.002, Number((st.metrics.Arsenic.value + jitter).toFixed(4)));
          return {
            ...st,
            lastPacketTime: 'Just now',
            metrics: {
              ...st.metrics,
              Arsenic: { ...st.metrics.Arsenic, value: newArsenic }
            }
          };
        }
        return st;
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, [isSimulatingPulse]);

  const handleInjectMethaneSpike = () => {
    setStations(prev => prev.map(st => {
      if (st.id === 'NODE-JHR-02') {
        return {
          ...st,
          status: 'CRITICAL ALERT',
          metrics: {
            ...st.metrics,
            MethaneCH4: { value: 6.2, unit: '%', normalMax: 2.5, isCritical: true },
            SubsurfaceTemp: { value: 365.0, unit: '°C', normalMax: 150.0, isCritical: true }
          }
        };
      }
      return st;
    }));

    notificationService.addNotification({
      title: 'CRITICAL HAZARD: Methane Anomaly in Jharia Colliery',
      message: 'Node JHR-02 recorded 6.2% Methane and 365 deg C subsurface heat. Automated AI evacuation advisory dispatched.',
      type: 'emergency',
      reportId: 'JH-2026-DHN-002',
      channel: 'sms'
    });
  };

  return (
    <div className="bg-white border border-[#E4DDD1] rounded-2xl p-6 shadow-2xs space-y-5 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EBE0] pb-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-[#2C6E49] text-white rounded-lg">
              <Radio className="w-4 h-4" />
            </span>
            <span className="text-[11px] font-extrabold text-[#2C6E49] bg-[#2C6E49]/10 px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-[#2C6E49]/20">
              Live Telemetry & Protocol Bridge
            </span>
            <span className="text-[11px] font-bold text-[#8A7F72]">·</span>
            <span className="text-[11px] font-bold text-[#5A5247]">LoRaWAN & MQTT</span>
          </div>
          <h3 className="text-base sm:text-lg font-black font-heading text-[#201C18] mt-1">
            Real Time Physical IoT Sensor Gateway Telemetry
          </h3>
          <p className="text-xs text-[#6A6155] mt-0.5">
            Decodes raw LoRaWAN and MQTT hex packets from ground field buoys and borehole probes across Jharkhand basins.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsSimulatingPulse(!isSimulatingPulse)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulatingPulse 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-300' 
                : 'bg-stone-100 text-stone-700 border-stone-300'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isSimulatingPulse ? 'animate-pulse text-emerald-600' : ''}`} />
            <span>{isSimulatingPulse ? 'Broker Connected' : 'Stream Paused'}</span>
          </button>
          <button
            onClick={handleInjectMethaneSpike}
            className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-all cursor-pointer flex items-center gap-1"
          >
            <Flame className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Spike</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stations.map(st => {
          const isSelected = st.id === selectedStationId;
          return (
            <div
              key={st.id}
              onClick={() => setSelectedStationId(st.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'border-[#2C6E49] bg-[#F0FAF4] shadow-xs'
                  : 'border-[#E4DDD1] bg-[#FAF8F4] hover:border-[#8A7F72]'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono font-bold text-[#8A7F72]">{st.id}</span>
                <span className={`w-2 h-2 rounded-full ${
                  st.status === 'CRITICAL ALERT' ? 'bg-red-500 animate-ping' : 'bg-emerald-500'
                }`} />
              </div>
              <p className="font-extrabold text-xs text-[#201C18] truncate">{st.stationName}</p>
              <p className="text-[10px] text-[#5A5247] mt-0.5">{st.district} · {st.protocol}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E4DDD1] pb-3">
          <div>
            <span className="font-mono font-bold text-xs text-[#2C6E49]">{selectedStation.id}</span>
            <h4 className="text-sm font-black text-[#201C18]">{selectedStation.stationName}</h4>
            <p className="text-[11px] text-[#5A5247]">{selectedStation.location}</p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <div className="text-right">
              <span className="text-[10px] text-[#8A7F72] block uppercase font-bold">Signal (RSSI)</span>
              <span className="font-mono font-bold text-[#201C18]">{selectedStation.rssi} dBm</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-[#8A7F72] block uppercase font-bold">Battery (Solar)</span>
              <span className="font-mono font-bold text-[#2C6E49]">{selectedStation.batteryVolts}V</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {Object.entries(selectedStation.metrics).map(([name, m]) => (
            <div 
              key={name}
              className={`p-3 rounded-xl border ${
                m.isCritical 
                  ? 'bg-red-50 border-red-300 text-red-900' 
                  : 'bg-white border-[#E4DDD1] text-[#201C18]'
              }`}
            >
              <span className="text-[10px] uppercase font-bold text-[#8A7F72] block">{name}</span>
              <div className="flex items-baseline space-x-1 mt-0.5">
                <span className={`text-xl font-black font-mono ${m.isCritical ? 'text-red-700' : 'text-[#201C18]'}`}>
                  {m.value}
                </span>
                <span className="text-[10px] text-[#8A7F72] font-semibold">{m.unit}</span>
              </div>
              {m.isCritical && (
                <span className="text-[9px] font-extrabold text-red-700 mt-1 block">
                  Exceeds Safe Threshold ({m.normalMax}{m.unit})
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="p-3 bg-[#201C18] text-emerald-400 rounded-xl font-mono text-[11px] space-y-1 overflow-x-auto">
          <div className="flex items-center justify-between text-stone-400 text-[10px] border-b border-stone-800 pb-1">
            <span>Broker: {selectedStation.brokerUrl}</span>
            <span>Total Packets: {packetCount}</span>
          </div>
          <p>PAYLOAD: {selectedStation.rawHexPayload}</p>
          <p className="text-stone-400 text-[10px]">
            Decoded: Protocol={selectedStation.protocol} | Status={selectedStation.status} | Time={selectedStation.lastPacketTime}
          </p>
        </div>
      </div>
    </div>
  );
};
