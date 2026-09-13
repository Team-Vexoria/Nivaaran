import React, { useState } from 'react';
import { 
  MessageSquare, Send, Smartphone 
} from 'lucide-react';
import { notificationService } from '../../services/notificationService';

export interface StakeholderMessage {
  id: string;
  senderName: string;
  senderRole: 'Government Officer' | 'University Mentor' | 'Student Lead' | 'Industry Partner' | 'Citizen Representative' | 'PRI Member';
  text: string;
  timestamp: string;
  avatarBg: string;
}

export interface ConversationThread {
  id: string;
  challengeReportId: string;
  challengeTitle: string;
  district: string;
  lastUpdated: string;
  stakeholders: string[];
  unreadCount: number;
  messages: StakeholderMessage[];
}

const STORAGE_KEY = 'nivaaran_cross_portal_threads_v1';

const INITIAL_THREADS: ConversationThread[] = [
  {
    id: 'THREAD-RNC-01',
    challengeReportId: 'JH-2026-RNC-001',
    challengeTitle: 'Subernarekha Basin Early Warning Flood Station',
    district: 'Ranchi',
    lastUpdated: '10m ago',
    stakeholders: ['State Nodal Officer (Gov)', 'Prof. Alok Sharma (BIT Mesra)', 'Tata Steel CSR Foundation', 'Pooja Kumari (Student Lead)', 'Ramesh Soren (Citizen)'],
    unreadCount: 1,
    messages: [
      {
        id: 'msg-1',
        senderName: 'Ramesh Soren',
        senderRole: 'Citizen Representative',
        text: 'Water levels in Kanke dam sluice canals rose 1.8 meters yesterday after continuous showers. Local residents need confirmed status.',
        timestamp: 'Yesterday at 4:15 PM',
        avatarBg: 'bg-emerald-600',
      },
      {
        id: 'msg-2',
        senderName: 'State Nodal Officer',
        senderRole: 'Government Officer',
        text: 'Report validated and prioritized under Stage 3. Transferred to BIT Mesra Electronics Department for telemetry deployment.',
        timestamp: 'Yesterday at 5:30 PM',
        avatarBg: 'bg-blue-600',
      },
      {
        id: 'msg-3',
        senderName: 'Prof. Alok Sharma',
        senderRole: 'University Mentor',
        text: 'Our team verified sensor calibration in the lab. The ultrasonic LoRaWAN node is ready for ground installation at Kanke bridge.',
        timestamp: 'Today at 09:10 AM',
        avatarBg: 'bg-purple-600',
      },
      {
        id: 'msg-4',
        senderName: 'Tata Steel CSR Foundation',
        senderRole: 'Industry Partner',
        text: 'Fabrication grant of ₹18.5 Lakhs approved for 12 additional sensor stations across Namkum and Doranda catchment points.',
        timestamp: 'Today at 10:45 AM',
        avatarBg: 'bg-amber-600',
      },
      {
        id: 'msg-5',
        senderName: 'Pooja Kumari',
        senderRole: 'Student Lead',
        text: 'Node #1 telemetry test online. Sub-gigahertz packets successfully receiving at Panchayat Bhavan gateway with RSSI -72dBm.',
        timestamp: '10 minutes ago',
        avatarBg: 'bg-indigo-600',
      },
    ],
  },
  {
    id: 'THREAD-DHN-02',
    challengeReportId: 'JH-2026-DHN-002',
    challengeTitle: 'Jharia Coalfire Gas Venting & Subsidence Mitigation',
    district: 'Dhanbad',
    lastUpdated: '1h ago',
    stakeholders: ['Dhanbad Collectorate (Gov)', 'Prof. Sudhir Sen (IIT ISM Dhanbad)', 'BCCL Technical Cell', 'Ward 12 Panchayat Head'],
    unreadCount: 0,
    messages: [
      {
        id: 'msg-d1',
        senderName: 'Ward 12 Panchayat Head',
        senderRole: 'PRI Member',
        text: 'Fissure opened near Lodna colliery settlement with high surface heat and sulfur dioxide smell.',
        timestamp: '02 March at 11:20 AM',
        avatarBg: 'bg-emerald-600',
      },
      {
        id: 'msg-d2',
        senderName: 'Dhanbad Collectorate',
        senderRole: 'Government Officer',
        text: 'Section 144 advisory issued for immediate 100-meter safety cordon. Tasked IIT ISM Rock Mechanics Lab for immediate hazard survey.',
        timestamp: '02 March at 01:15 PM',
        avatarBg: 'bg-blue-600',
      },
      {
        id: 'msg-d3',
        senderName: 'Prof. Sudhir Sen',
        senderRole: 'University Mentor',
        text: 'Thermal drone orthomosaic survey completed. Subsurface temperature measured at 340°C. Deploying catalytic nitrogen foam sealing pilot.',
        timestamp: '1 hour ago',
        avatarBg: 'bg-purple-600',
      },
    ],
  },
  {
    id: 'THREAD-GRD-03',
    challengeReportId: 'JH-2026-GRD-003',
    challengeTitle: 'Arsenic Contamination Phytoremediation Filter',
    district: 'Giridih',
    lastUpdated: '3h ago',
    stakeholders: ['Drinking Water & Sanitation Dept', 'Central University Jharkhand', 'Jindal Steel CSR', 'Bengabad Panchayat Mukhiya'],
    unreadCount: 0,
    messages: [
      {
        id: 'msg-g1',
        senderName: 'Bengabad Panchayat Mukhiya',
        senderRole: 'PRI Member',
        text: 'Laboratory water sample from 3 community borewells showed arsenic levels at 0.08 mg/L, exceeding permissible limits.',
        timestamp: '05 March at 10:00 AM',
        avatarBg: 'bg-emerald-600',
      },
      {
        id: 'msg-g2',
        senderName: 'Drinking Water & Sanitation Dept',
        senderRole: 'Government Officer',
        text: 'Alternative tanker supply mobilized. Allocated problem to CUJ Environmental Science Centre for low cost biochar filtration.',
        timestamp: '05 March at 02:40 PM',
        avatarBg: 'bg-blue-600',
      },
      {
        id: 'msg-g3',
        senderName: 'Central University Jharkhand',
        senderRole: 'University Mentor',
        text: 'Pilot biochar slag adsorption unit installed at central school. 48 hour water testing confirmed arsenic drop below 0.005 mg/L.',
        timestamp: '3 hours ago',
        avatarBg: 'bg-purple-600',
      },
    ],
  },
];

interface CrossPortalMessagingHubProps {
  currentRole?: string;
  userName?: string;
  currentUserName?: string;
  userHEI?: string;
}

export const CrossPortalMessagingHub: React.FC<CrossPortalMessagingHubProps> = ({
  currentRole = 'Government Officer',
  userName = 'Officer in Charge',
  currentUserName,
  userHEI: _userHEI,
}) => {
  const effectiveUser = currentUserName || userName;
  const [threads, setThreads] = useState<ConversationThread[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[CrossPortalMessagingHub] Failed to load threads:', e);
    }
    return INITIAL_THREADS;
  });

  const [activeThreadId, setActiveThreadId] = useState<string>(threads[0]?.id || 'THREAD-RNC-01');
  const [inputMessage, setInputMessage] = useState('');
  const [selectedRole, setSelectedRole] = useState<StakeholderMessage['senderRole']>(
    (currentRole.includes('Univ') ? 'University Mentor' : 
     currentRole.includes('Industry') ? 'Industry Partner' : 
     currentRole.includes('Citizen') ? 'Citizen Representative' : 'Government Officer')
  );
  const [broadcastSMS, setBroadcastSMS] = useState(true);

  const activeThread = threads.find(t => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeThread) return;

    const newMessage: StakeholderMessage = {
      id: `msg-${Date.now()}`,
      senderName: effectiveUser || 'Active Stakeholder',
      senderRole: selectedRole,
      text: inputMessage.trim(),
      timestamp: 'Just now',
      avatarBg: selectedRole === 'Government Officer' ? 'bg-blue-600' :
                selectedRole === 'University Mentor' ? 'bg-purple-600' :
                selectedRole === 'Industry Partner' ? 'bg-amber-600' :
                selectedRole === 'Student Lead' ? 'bg-indigo-600' : 'bg-emerald-600',
    };

    const updatedThreads = threads.map(th => {
      if (th.id === activeThread.id) {
        return {
          ...th,
          lastUpdated: 'Just now',
          messages: [...th.messages, newMessage],
        };
      }
      return th;
    });

    setThreads(updatedThreads);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedThreads));
    } catch (e) {
      console.warn('[CrossPortalMessagingHub] Failed to save threads:', e);
    }

    // Trigger Notification & Simulated SMS Dispatch
    notificationService.addNotification({
      title: `New Message on ${activeThread.challengeReportId}`,
      message: `${selectedRole} (${effectiveUser}): "${inputMessage.slice(0, 75)}..."`,
      type: 'message',
      reportId: activeThread.challengeReportId,
      channel: 'in_app',
    });

    if (broadcastSMS) {
      notificationService.sendSimulatedSMS(
        '+91 98351 24982',
        `NIVAARAN [${activeThread.challengeReportId}] New message from ${selectedRole}: ${inputMessage.slice(0, 60)}`,
        activeThread.challengeReportId
      );
    }

    setInputMessage('');
  };

  return (
    <div className="bg-white border border-[#E4DDD1] rounded-2xl shadow-xs overflow-hidden flex flex-col md:flex-row h-[700px] text-left">
      
      {/* Left Sidebar: Threads List */}
      <div className="w-full md:w-80 border-r border-[#E4DDD1] bg-[#FAF8F4]/50 flex flex-col shrink-0">
        
        {/* Sidebar Header */}
        <div className="p-4 border-b border-[#E4DDD1] bg-[#FAF8F4] space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-[#2C6E49]" />
              <h3 className="font-heading font-black text-sm text-[#201C18]">Stakeholder Threads</h3>
            </div>
            <span className="text-[10px] font-bold bg-[#2C6E49]/10 text-[#2C6E49] px-2 py-0.5 rounded-full">
              Live Hub
            </span>
          </div>
          <p className="text-[11px] text-[#6A6155] leading-tight">
            Multi stakeholder collaboration between Citizens, Government, HEIs, and Industry.
          </p>
        </div>

        {/* Threads List Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#E4DDD1]/60">
          {threads.map((th) => {
            const isSelected = th.id === activeThread.id;
            return (
              <div
                key={th.id}
                onClick={() => setActiveThreadId(th.id)}
                className={`p-3.5 transition-all cursor-pointer space-y-1.5 ${
                  isSelected ? 'bg-white border-l-4 border-l-[#2C6E49] shadow-2xs' : 'hover:bg-[#FAF8F4]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-[#2C6E49] bg-[#2C6E49]/10 px-1.5 py-0.2 rounded">
                    {th.challengeReportId}
                  </span>
                  <span className="text-[10px] text-[#8A7F72] font-semibold">{th.lastUpdated}</span>
                </div>

                <h4 className="text-xs font-black text-[#201C18] line-clamp-1">
                  {th.challengeTitle}
                </h4>

                <p className="text-[11px] text-[#6A6155] line-clamp-1">
                  {th.district} District · {th.messages[th.messages.length - 1]?.text}
                </p>

                <div className="flex items-center justify-between text-[10px] text-[#8A7F72] pt-0.5">
                  <span>{th.messages.length} messages</span>
                  <span>{th.stakeholders.length} parties</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="p-3 bg-[#FAF8F4] border-t border-[#E4DDD1] text-[10px] text-[#6A6155] space-y-1">
          <span className="font-bold block uppercase tracking-wider text-[9px] text-[#8A7F72]">Active Network Nodes</span>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 font-bold text-blue-700">Gov</span>
            <span className="inline-flex items-center gap-1 font-bold text-purple-700">HEI</span>
            <span className="inline-flex items-center gap-1 font-bold text-amber-700">Industry</span>
            <span className="inline-flex items-center gap-1 font-bold text-emerald-700">Citizen/PRI</span>
          </div>
        </div>

      </div>

      {/* Right Area: Conversation Stream */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        
        {/* Thread Header */}
        <div className="p-4 border-b border-[#E4DDD1] bg-[#FAF8F4] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-[#2C6E49]">{activeThread.challengeReportId}</span>
              <span className="text-xs font-semibold text-[#8A7F72]">· {activeThread.district} District</span>
            </div>
            <h3 className="font-heading font-black text-sm text-[#201C18]">
              {activeThread.challengeTitle}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-[10px] font-bold text-[#6A6155] hidden lg:inline">Connected Parties:</span>
            <div className="flex -space-x-1.5 overflow-hidden">
              <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white" title="Government Officer">G</div>
              <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white" title="University Faculty">U</div>
              <div className="w-6 h-6 rounded-full bg-amber-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white" title="Industry Sponsor">I</div>
              <div className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white" title="Citizen Representative">C</div>
            </div>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#FAF8F4]/30">
          {activeThread.messages.map((m) => (
            <div key={m.id} className="flex gap-3 text-left">
              <div className={`w-8 h-8 rounded-full ${m.avatarBg} text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                {m.senderName.charAt(0)}
              </div>

              <div className="flex-1 max-w-2xl bg-white border border-[#E4DDD1] rounded-2xl p-3 shadow-2xs space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-xs text-[#201C18]">{m.senderName}</span>
                    <span className={`text-[9px] font-bold px-2 py-0.2 rounded-full border ${
                      m.senderRole === 'Government Officer' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                      m.senderRole === 'University Mentor' ? 'bg-purple-50 text-purple-800 border-purple-200' :
                      m.senderRole === 'Industry Partner' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                      m.senderRole === 'Student Lead' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                      'bg-emerald-50 text-emerald-800 border-emerald-200'
                    }`}>
                      {m.senderRole}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#8A7F72]">{m.timestamp}</span>
                </div>

                <p className="text-xs text-[#332C24] leading-relaxed">
                  {m.text}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input & Role Switcher Form */}
        <form onSubmit={handleSendMessage} className="p-3 border-t border-[#E4DDD1] bg-white space-y-2.5 shrink-0">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-[#8A7F72] font-semibold">Post As:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as any)}
                className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg px-2 py-1 text-xs font-bold text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
              >
                <option value="Government Officer">Government Officer</option>
                <option value="University Mentor">University Mentor (BIT Mesra / IIT ISM)</option>
                <option value="Student Lead">Student R&D Lead</option>
                <option value="Industry Partner">Industry Sponsor (Tata Steel CSR)</option>
                <option value="Citizen Representative">Citizen Representative</option>
                <option value="PRI Member">Panchayat Member</option>
              </select>
            </div>

            <label className="flex items-center gap-1.5 text-[11px] text-[#6A6155] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={broadcastSMS}
                onChange={(e) => setBroadcastSMS(e.target.checked)}
                className="rounded border-[#E4DDD1] text-[#2C6E49] focus:ring-0"
              />
              <Smartphone className="w-3 h-3 text-[#2C6E49]" />
              <span>Broadcast SMS notice to field team</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Type message, directive, or milestone update to all thread stakeholders..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl px-4 py-2.5 text-xs text-[#201C18] focus:outline-none focus:border-[#2C6E49]"
              required
            />
            <button
              type="submit"
              className="px-4 py-2.5 bg-[#2C6E49] hover:bg-[#23583a] text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </div>
        </form>

      </div>

    </div>
  );
};
