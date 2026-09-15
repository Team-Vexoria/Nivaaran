import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, Check, Trash2, Smartphone, Mail, Rocket, Building2, 
  FileText, ShieldAlert, AlertCircle, ExternalLink, X, Send 
} from 'lucide-react';
import { useNotifications } from '../../services/notificationService';

export interface NotificationBellDropdownProps {
  onOpenReport?: (reportId: string) => void;
  className?: string;
  userRole?: string;
  userDistrict?: string;
}

export const NotificationBellDropdown: React.FC<NotificationBellDropdownProps> = ({
  onOpenReport,
  className = '',
  userRole: _userRole,
  userDistrict: _userDistrict,
}) => {
  const { 
    notifications, 
    unread, 
    markAsRead, 
    markAllAsRead, 
    clearAll, 
    sendSimulatedSMS, 
    sendSimulatedEmail 
  } = useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'updates' | 'dispatches'>('all');
  const [showSimModal, setShowSimModal] = useState(false);
  const [simContact, setSimContact] = useState('+91 94311 00000');
  const [simType, setSimType] = useState<'sms' | 'email'>('sms');
  const [simNote, setSimNote] = useState('Challenge stage advanced to Stage 12: Panchayat Ground Trial complete.');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const filtered = notifications.filter(n => {
    if (activeFilter === 'dispatches') {
      return n.type === 'sms_dispatched' || n.type === 'email_dispatched';
    }
    if (activeFilter === 'updates') {
      return n.type !== 'sms_dispatched' && n.type !== 'email_dispatched';
    }
    return true;
  });

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'sms_dispatched':
        return <Smartphone className="w-4 h-4 text-emerald-600" />;
      case 'email_dispatched':
        return <Mail className="w-4 h-4 text-blue-600" />;
      case 'deployment':
        return <Rocket className="w-4 h-4 text-purple-600" />;
      case 'allocation':
        return <Building2 className="w-4 h-4 text-amber-600" />;
      case 'proposal':
        return <FileText className="w-4 h-4 text-indigo-600" />;
      case 'evidence_request':
        return <ShieldAlert className="w-4 h-4 text-red-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-[#2C6E49]" />;
    }
  };

  const handleSendTestDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (simType === 'sms') {
      sendSimulatedSMS(simContact, simNote, 'JH-2026-RNC-001');
    } else {
      sendSimulatedEmail(simContact, 'Nivaaran Lifecycle Notice', simNote, 'JH-2026-RNC-001');
    }
    setShowSimModal(false);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      
      {/* Bell Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-white hover:bg-[#FAF8F4] border border-[#E4DDD1] text-[#201C18] transition-colors shadow-2xs cursor-pointer flex items-center justify-center active:scale-95"
        title="Notifications & Dispatches"
        aria-label="View notifications"
      >
        <Bell className="w-4 h-4 text-[#4A433B]" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#B3261E] text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-pulse">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#E4DDD1] rounded-2xl shadow-2xl py-0 z-[250] overflow-hidden animate-fadeIn">
          
          {/* Header */}
          <div className="p-3.5 bg-[#FAF8F4] border-b border-[#E4DDD1] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xs text-[#201C18]">Notifications</span>
              {unread > 0 ? (
                <span className="text-[10px] font-bold bg-[#B3261E]/10 text-[#B3261E] px-1.5 py-0.2 rounded-full">
                  {unread} unread
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-[#2C6E49]/10 text-[#2C6E49] px-1.5 py-0.2 rounded-full">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="p-1 text-[11px] font-bold text-[#2C6E49] hover:underline flex items-center gap-0.5"
                  title="Mark all as read"
                >
                  <Check className="w-3 h-3" />
                  <span>Mark read</span>
                </button>
              )}
              <button
                type="button"
                onClick={clearAll}
                className="p-1 text-[#8A7F72] hover:text-[#B3261E] rounded"
                title="Clear all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex border-b border-[#E4DDD1] text-[11px] font-bold bg-[#FAF8F4]/50">
            <button
              type="button"
              onClick={() => setActiveFilter('all')}
              className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                activeFilter === 'all'
                  ? 'border-[#2C6E49] text-[#2C6E49] font-black bg-white'
                  : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('updates')}
              className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                activeFilter === 'updates'
                  ? 'border-[#2C6E49] text-[#2C6E49] font-black bg-white'
                  : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
              }`}
            >
              Lifecycle Updates
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('dispatches')}
              className={`flex-1 py-1.5 text-center transition-colors border-b-2 ${
                activeFilter === 'dispatches'
                  ? 'border-[#2C6E49] text-[#2C6E49] font-black bg-white'
                  : 'border-transparent text-[#6A6155] hover:text-[#201C18]'
              }`}
            >
              SMS / Email
            </button>
          </div>

          {/* Notification Items List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-[#E4DDD1]/60">
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-xs text-[#8A7F72]">
                No notifications in this category.
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markAsRead(n.id)}
                  className={`p-3 transition-colors cursor-pointer flex gap-3 text-left ${
                    n.read ? 'bg-white hover:bg-[#FAF8F4]' : 'bg-[#FAF8F4]/80 hover:bg-[#F3EDE2]/60'
                  }`}
                >
                  <div className="shrink-0 p-1.5 rounded-lg bg-white border border-[#E4DDD1] self-start shadow-2xs">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between gap-1">
                      <p className={`text-xs truncate ${n.read ? 'font-semibold text-[#201C18]' : 'font-black text-[#201C18]'}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-[#8A7F72] shrink-0 font-medium">{n.timestamp}</span>
                    </div>

                    <p className="text-[11px] text-[#5A5247] leading-tight line-clamp-2">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-2 pt-1">
                      {n.reportId && (
                        <span className="text-[9px] font-mono font-bold bg-[#EAE4D8] text-[#4A433B] px-1.5 py-0.2 rounded">
                          {n.reportId}
                        </span>
                      )}
                      {n.channel && (
                        <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          n.channel === 'sms' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : n.channel === 'email'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {n.channel}
                        </span>
                      )}
                      {n.reportId && onOpenReport && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenReport(n.reportId!);
                            setIsOpen(false);
                          }}
                          className="text-[10px] font-extrabold text-[#2C6E49] hover:underline inline-flex items-center gap-0.5 ml-auto"
                        >
                          <span>View dossier</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Action Bar */}
          <div className="p-2.5 bg-[#FAF8F4] border-t border-[#E4DDD1] flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowSimModal(true)}
              className="text-[11px] font-bold text-[#2C6E49] hover:text-[#23583a] flex items-center gap-1 py-1 px-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E4DDD1] transition-all cursor-pointer"
            >
              <Send className="w-3 h-3 text-[#2C6E49]" />
              <span>Simulate SMS / Email Dispatch</span>
            </button>

            <span className="text-[10px] font-mono text-[#8A7F72]">
              Live Engine
            </span>
          </div>

        </div>
      )}

      {/* Dispatch Simulation Modal */}
      {showSimModal && (
        <div className="fixed inset-0 z-[350] bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E4DDD1] rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-[#E4DDD1] pb-2">
              <div className="flex items-center gap-2">
                <Send className="w-4 h-4 text-[#2C6E49]" />
                <h3 className="font-heading font-black text-sm text-[#201C18]">Simulate External Dispatch</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSimModal(false)}
                className="p-1 text-[#8A7F72] hover:text-[#201C18]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendTestDispatch} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#4A433B] mb-1">Dispatch Channel</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setSimType('sms');
                      setSimContact('+91 94311 00000');
                    }}
                    className={`py-1.5 rounded-lg border font-bold text-center transition-all ${
                      simType === 'sms' ? 'bg-[#2C6E49] text-white border-[#2C6E49]' : 'bg-[#FAF8F4] border-[#E4DDD1] text-[#6A6155]'
                    }`}
                  >
                    SMS Gateway
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSimType('email');
                      setSimContact('nodal.officer@jharkhand.gov.in');
                    }}
                    className={`py-1.5 rounded-lg border font-bold text-center transition-all ${
                      simType === 'email' ? 'bg-[#2C6E49] text-white border-[#2C6E49]' : 'bg-[#FAF8F4] border-[#E4DDD1] text-[#6A6155]'
                    }`}
                  >
                    SMTP Email
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#4A433B] mb-1">
                  {simType === 'sms' ? 'Recipient Mobile (SMS Gateway)' : 'Recipient Email (SMTP Dispatch)'}
                </label>
                <input
                  type="text"
                  value={simContact}
                  onChange={(e) => setSimContact(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-[#4A433B] mb-1">Message Content</label>
                <textarea
                  rows={3}
                  value={simNote}
                  onChange={(e) => setSimNote(e.target.value)}
                  className="w-full bg-[#FAF8F4] border border-[#E4DDD1] rounded-lg p-2 text-xs focus:outline-none focus:border-[#2C6E49]"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-[#E4DDD1] text-[#6A6155] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#2C6E49] text-white font-bold hover:bg-[#23583a] shadow-xs"
                >
                  Dispatch Test Notice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
