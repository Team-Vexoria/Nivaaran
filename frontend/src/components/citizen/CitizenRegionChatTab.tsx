import React, { useState, useEffect } from 'react';
import { Send, MapPin, Users, MessageSquare } from 'lucide-react';
import { 
  subscribeToDistrictChat, sendChatMessageToFirestore, ChatMessageDoc 
} from '../../services/firebaseService';
import { useLanguage } from '../../context/LanguageContext';

// All 24 Jharkhand districts available as community chat rooms.
const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Palamu',
  'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Latehar',
  'Garhwa', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Jamtara',
  'Khunti', 'Gumla', 'Simdega', 'West Singhbhum', 'Seraikela Kharsawan',
  'Chatra', 'Koderma', 'Lohardaga',
];

export const CitizenRegionChatTab: React.FC = () => {
  const { t } = useLanguage();
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
    const filteredSeed = seedMessages.filter(m => m.district === selectedDistrict);
    const unsubscribe = subscribeToDistrictChat(selectedDistrict, (incomingMsgs) => {
      const combined = [...filteredSeed];
      (incomingMsgs || []).forEach(inc => {
        if (!combined.some(c => c.id === inc.id || c.text === inc.text)) {
          combined.push(inc);
        }
      });
      setChatMessages(combined);
    });

    return () => unsubscribe();
  }, [selectedDistrict]);

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
      
      {/* Header & District Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold font-heading text-slate-900 flex items-center">
            <MessageSquare className="w-6 h-6 mr-2 text-emerald-700" />
            {t.regionChat.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t.regionChat.subtitle}
          </p>
        </div>

        {/* District Selector Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span className="text-xs font-bold text-slate-700">{t.regionChat.selectDistrict}:</span>
          <select
            value={selectedDistrict}
            onChange={e => setSelectedDistrict(e.target.value)}
            className="px-3 py-1.5 bg-slate-900 text-white font-bold text-xs rounded-xl shadow-xs focus:outline-none"
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

          <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold">
            <Users className="w-3.5 h-3.5 text-slate-400" />
            <span>Real-time Active</span>
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
                <div className={`p-3 rounded-2xl max-w-md text-xs leading-relaxed shadow-2xs ${
                  msg.sender === 'You'
                    ? 'bg-slate-900 text-white rounded-tr-none'
                    : 'bg-white border border-slate-200 text-slate-900 rounded-tl-none'
                }`}>
                  {msg.text}
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
