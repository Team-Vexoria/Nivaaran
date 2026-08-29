import React, { useState } from 'react';
import { RefreshCw, Terminal, Activity } from 'lucide-react';

export interface IoTSensorTelemetryProps {
  stationName?: string;
  hardwareNode?: string;
  waterLevelMeters?: number;
  dangerThresholdMeters?: number;
  batteryPct?: number;
  signalBars?: number;
  lastSyncedText?: string;
  rawLogs?: string;
  compact?: boolean;
}

export const IoTSensorTelemetryCard: React.FC<IoTSensorTelemetryProps> = ({
  stationName = 'Subarnarekha River Basin - Node R1',
  hardwareNode = 'ESP32 LoRaWAN v2.4 + Ultrasonic HC-SR04',
  waterLevelMeters = 4.2,
  dangerThresholdMeters = 5.5,
  batteryPct = 85,
  signalBars = 4,
  lastSyncedText = 'Live · 2 mins ago',
  rawLogs = `[08:42:19.102] TX LoRa: Freq=865.2MHz SF=7 BW=125kHz RSSI=-72dBm SNR=9.5dB
[08:42:19.145] SENS_WATER_ULTRASONIC: distance_cm=420.4, calculated_level=4.20m [NORMAL]
[08:42:19.180] BATT_ADC_VOLTS: 3.94V (85%) | SOLAR_IN: 5.10V @ 180mA
[08:42:19.210] STATUS: OK | PAYLOAD_HASH=0x7F2A9B | PANCHAYAT_GATEWAY_ACK=RECVD`,
  compact = false
}) => {
  const [showRawLogs, setShowRawLogs] = useState(false);

  // Compute fill percentage for water tube (clamped 0-100%)
  const maxScale = Math.max(dangerThresholdMeters * 1.3, 7.0);
  const fillPct = Math.min(Math.max((waterLevelMeters / maxScale) * 100, 5), 100);
  const thresholdPct = Math.min(Math.max((dangerThresholdMeters / maxScale) * 100, 5), 100);
  const isDanger = waterLevelMeters >= dangerThresholdMeters;

  return (
    <div className={`bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-sm flex flex-col ${compact ? 'max-w-md w-full' : 'w-full'}`}>
      
      {/* ── Header ── */}
      <div className="px-4 py-3 border-b border-[#E4DDD1] flex justify-between items-center bg-[#FAF8F4]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#F0FAF4] border border-[#C3E6D0] flex items-center justify-center text-[#2C6E49] shrink-0">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-black text-[#201C18] truncate font-heading">{stationName}</h3>
            <p className="text-[10px] text-[#6A6155] truncate font-mono">{hardwareNode}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 bg-white border border-[#E4DDD1] px-2.5 py-1 rounded-full text-[10px] font-bold text-[#2C6E49]">
          <span className="w-2 h-2 rounded-full bg-[#2C6E49] animate-ping" />
          <span>{isDanger ? 'ALERT' : 'ONLINE'}</span>
        </div>
      </div>

      {/* ── Content Body ── */}
      <div className="p-4 flex flex-col gap-4">
        
        {/* Metrics Row: Water Level & Battery / Signal */}
        <div className="grid grid-cols-2 gap-3">
          
          {/* Water Level Tube Visualizer */}
          <div className="bg-[#FAF8F4] rounded-xl p-3 border border-[#E4DDD1] flex flex-col items-center justify-between relative">
            <span className="text-[10px] font-extrabold text-[#6A6155] tracking-wider uppercase">WATER LEVEL</span>
            
            <div className="relative w-10 sm:w-12 h-28 bg-[#EAE4D8] rounded-full overflow-hidden border border-[#D5CDBF] my-1">
              {/* Danger Threshold Line */}
              <div 
                className="absolute left-0 w-full h-[2px] bg-[#B3261E] z-10"
                style={{ bottom: `${thresholdPct}%` }}
              />
              <span 
                className="absolute left-1 text-[8px] text-[#B3261E] font-black z-10 drop-shadow-xs"
                style={{ bottom: `${thresholdPct + 2}%` }}
              >
                {dangerThresholdMeters}m
              </span>

              {/* Water Fill */}
              <div 
                className={`absolute bottom-0 left-0 w-full transition-all duration-1000 ease-in-out ${
                  isDanger ? 'bg-[#B3261E]' : 'bg-[#2C6E49]'
                }`}
                style={{ height: `${fillPct}%` }}
              />
            </div>

            <div className="text-center">
              <span className={`text-base font-black ${isDanger ? 'text-[#B3261E]' : 'text-[#2C6E49]'}`}>
                {waterLevelMeters.toFixed(1)}m
              </span>
              <span className="text-[9px] text-[#8A7F72] block">Current Height</span>
            </div>
          </div>

          {/* Battery & LoRa Signal Column */}
          <div className="flex flex-col gap-2.5">
            
            {/* Battery Circular Progress */}
            <div className="bg-[#FAF8F4] rounded-xl p-2.5 border border-[#E4DDD1] flex flex-col items-center justify-center flex-1">
              <span className="text-[10px] font-extrabold text-[#6A6155] tracking-wider uppercase mb-1">BATTERY</span>
              
              <div className="relative flex items-center justify-center">
                <svg className="w-14 h-14 transform -rotate-90">
                  <circle
                    className="text-[#EAE4D8]"
                    cx="28"
                    cy="28"
                    fill="transparent"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="5"
                  />
                  <circle
                    className={batteryPct > 20 ? 'text-[#2C6E49]' : 'text-[#B3261E]'}
                    cx="28"
                    cy="28"
                    fill="transparent"
                    r="24"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeDasharray="150.8"
                    strokeDashoffset={150.8 - (150.8 * Math.min(batteryPct, 100)) / 100}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex items-center justify-center">
                  <span className="text-xs font-black text-[#201C18]">{batteryPct}%</span>
                </div>
              </div>
            </div>

            {/* LoRa Signal Strength */}
            <div className="bg-[#FAF8F4] rounded-xl p-2.5 border border-[#E4DDD1] flex flex-col items-center justify-center">
              <span className="text-[10px] font-extrabold text-[#6A6155] tracking-wider uppercase mb-1">LoRa SIGNAL</span>
              
              <div className="flex items-end h-6 gap-1">
                {[1, 2, 3, 4, 5].map(bar => (
                  <div
                    key={bar}
                    className={`w-1.5 rounded-xs transition-all ${
                      bar <= signalBars ? 'bg-[#2C6E49]' : 'bg-[#EAE4D8]'
                    }`}
                    style={{ height: `${bar * 20}%` }}
                  />
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* ── Toggle Switch & Serial Logs ── */}
        <div className="space-y-2">
          <div className="flex justify-between items-center bg-white border border-[#E4DDD1] rounded-xl p-2.5">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#201C18]">
              <Terminal className="w-3.5 h-3.5 text-[#C98A2C]" />
              <span>Raw Serial Telemetry Stream</span>
            </div>

            <button
              onClick={() => setShowRawLogs(!showRawLogs)}
              className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                showRawLogs ? 'bg-[#2C6E49]' : 'bg-[#EAE4D8]'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  showRawLogs ? 'translate-x-4' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {showRawLogs && (
            <div className="bg-[#1F1B17] text-[#ADF2C3] font-mono text-[10px] p-3 rounded-xl overflow-x-auto max-h-36 border border-[#34302B] space-y-1 shadow-inner">
              <div className="flex items-center justify-between text-[#8A7F72] border-b border-white/10 pb-1 mb-1 text-[9px]">
                <span>STREAM: /dev/ttyUSB0 @ 115200 BAUD</span>
                <span className="text-[#92D5A8] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#92D5A8] animate-ping" /> LIVE
                </span>
              </div>
              <pre className="whitespace-pre-wrap leading-relaxed">{rawLogs}</pre>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[#8A7F72] justify-center pt-1 text-[10px] font-bold">
            <RefreshCw className="w-3 h-3 text-[#2C6E49]" />
            <span>Last Synced: {lastSyncedText}</span>
          </div>
        </div>

      </div>

    </div>
  );
};
