import React, { useState, useEffect } from 'react';
import { Send, MapPin, Users, MessageSquare, Trash2 } from 'lucide-react';
import { 
  subscribeToDistrictChat, sendChatMessageToFirestore, ChatMessageDoc 
} from '../../services/firebaseService';

// All 24 Jharkhand districts available as community chat rooms.
const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Palamu',
  'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Latehar',
  'Garhwa', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Jamtara',
  'Khunti', 'Gumla', 'Simdega', 'West Singhbhum', 'Seraikela Kharsawan',
  'Chatra', 'Koderma', 'Lohardaga',
];

const BLOCKED_OR_REMOVED_TEXTS = new Set([
  'gmfynf',
  'brsrgvwgwsf',
  'brsrgvwgfwsf',
  'bvnsg',
  'fbsfgs',
]);

export const CitizenRegionChatTab: React.FC = () => {
  const [selectedDistrict, setSelectedDistrict] = useState<string>('Ranchi');
  const [chatMessages, setChatMessages] = useState<ChatMessageDoc[]>([]);
  const [inputMessage, setInputMessage] = useState('');

  const seedMessages: ChatMessageDoc[] = [
    {
      id: 'M1',
      sender: 'Aman Verma',
      role: 'Citizen (Kanke)',
      text: 'Heavy waterlogging near Subernarekha river bridge. Drive carefully near Kanke road.',
      district: 'Ranchi',
    },
    {
      id: 'M2',
      sender: 'Sunil Mahto',
      role: 'PRI Panchayat Member',
      text: 'BIT Mesra student team arrived with telemetry sensor equipment for flood monitoring.',
      district: 'Ranchi',
    },
    {
      id: 'M3',
      sender: 'Deepak Roy',
      role: 'Citizen (Jharia)',
      text: 'Road surface inspection ongoing by IIT Dhanbad team near Bhowra sector.',
      district: 'Dhanbad',
    },
    {
      id: 'M4',
      sender: 'Anita Kumari',
      role: 'Citizen (Daltonganj)',
      text: 'Well recharge project by BAU team in Satanpur village starts tomorrow.',
      district: 'Palamu',
    },
  ];

  useEffect(() => {
    // Purge unwanted test messages from localStorage on load
    try {
      const key = `nivaaran_chat_${selectedDistrict}`;
      const saved = JSON.parse(localStorage.getItem(key) || '[]');
      if (Array.isArray(saved)) {
        const cleaned = saved.filter((m: any) => !BLOCKED_OR_REMOVED_TEXTS.has(m?.text?.trim()?.toLowerCase()));
        if (cleaned.length !== saved.length) {
          localStorage.setItem(key, JSON.stringify(cleaned));
        }
      }
    } catch {}

    const filteredSeed = seedMessages.filter(m => m.district === selectedDistrict);
    const unsubscribe = subscribeToDistrictChat(selectedDistrict, (incomingMsgs) => {
      const combined = [...filteredSeed];
      (incomingMsgs || []).forEach(inc => {
        const isSpam = BLOCKED_OR_REMOVED_TEXTS.has(inc?.text?.trim()?.toLowerCase());
        if (!isSpam && !combined.some(c => c.id === inc.id || c.text === inc.text)) {
          combined.push(inc);
        }
      });
      setChatMessages(combined.filter(c => !BLOCKED_OR_REMOVED_TEXTS.has(c.text?.trim()?.toLowerCase())));
    });

    return () => unsubscribe();
  }, [selectedDistrict]);

  const handleDeleteMessage = (id?: string) => {
    if (!id) return;
    setChatMessages(prev => prev.filter(m => m.id !== id));
    try {
      const key = `nivaaran_chat_${selectedDistrict}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((m: any) => m.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      window.dispatchEvent(new Event('nivaaran-storage-changed'));
    } catch (err) {
      console.warn('Failed to delete message:', err);
    }
  };

  const handleClearMyMessages = () => {
    setChatMessages(prev => prev.filter(m => m.sender !== 'You'));
    try {
      const key = `nivaaran_chat_${selectedDistrict}`;
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const filtered = existing.filter((m: any) => m.sender !== 'You');
      localStorage.setItem(key, JSON.stringify(filtered));
      window.dispatchEvent(new Event('nivaaran-storage-changed'));
    } catch (err) {
      console.warn('Failed to clear messages:', err);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = inputMessage.trim();
    if (!text) return;

    const optimisticMsg: ChatMessageDoc = {
      id: `MSG-${Date.now()}`,
      sender: 'You',
      role: 'Citizen Resident',
      text: text,
      district: selectedDistrict,
    };

    setChatMessages((prev) => [...prev, optimisticMsg]);
    setInputMessage('');

    try {
      await sendChatMessageToFirestore({
        sender: 'You',
        role: 'Citizen Resident',
        text: text,
        district: selectedDistrict,
      });
    } catch (err) {
      console.warn('Chat send error:', err);
    }
  };

  const districts = JHARKHAND_DISTRICTS;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      
      {/* Header Bar with District Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-slate-800" />
            <h2 className="text-xl sm:text-2xl font-black font-heading text-slate-900">
              District & Panchayat Regional Chat Rooms
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time peer-to-peer discussion between citizens, PRI representatives, and university student researchers.
          </p>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700">Select District Room:</span>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs focus:outline-none cursor-pointer"
          >
            {districts.map(d => (
              <option key={d} value={d}>{d} District</option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Room Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[520px]">
        
        {/* Chat Room Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 rounded-t-2xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-bold text-sm text-slate-900">{selectedDistrict} District Community Room</span>
          </div>

          <div className="flex items-center space-x-3">
            {chatMessages.some(m => m.sender === 'You') && (
              <button
                type="button"
                onClick={handleClearMyMessages}
                className="text-[10px] text-slate-500 hover:text-red-600 font-bold flex items-center gap-1 hover:underline cursor-pointer transition-colors"
                title="Clear all messages sent by You in this room"
              >
                <Trash2 className="w-3 h-3 text-red-500" />
                <span>Clear My Messages</span>
              </button>
            )}
            <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>Real-time Active</span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/40">
          {chatMessages.length > 0 ? (
            chatMessages.map((msg, idx) => (
              <div 
                key={msg.id || idx}
                className={`flex flex-col space-y-1 ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-2 text-[10px] text-slate-400 px-1">
                  <span className="font-bold text-slate-700">{msg.sender}</span>
                  <span>({msg.role})</span>
                </div>
                <div className="flex items-center gap-1.5 group">
                  {msg.sender === 'You' && (
                    <button
                      type="button"
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="opacity-60 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 rounded transition-all cursor-pointer"
                      title="Delete message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed shadow-2xs ${
                    msg.sender === 'You'
                      ? 'bg-slate-900 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400 italic">
              No recent messages in {selectedDistrict} District yet. Start the conversation!
            </div>
          )}
        </div>

        {/* Message Input Box */}
        <form onSubmit={handleSendMessage} className="p-3.5 border-t border-slate-200 bg-white rounded-b-2xl flex items-center space-x-2">
          <input
            type="text"
            placeholder={`Message ${selectedDistrict} District Chat Room...`}
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            className="flex-1 px-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
          <button
            type="submit"
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </form>

      </div>

    </div>
  );
};
