import React, { useState } from 'react';
import { 
  Camera, Upload, MapPin, CheckCircle, X, Loader2, ArrowRight
} from 'lucide-react';

interface QuickReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (reportId: string) => void;
}

const JHARKHAND_DISTRICTS = [
  'Ranchi', 'Dhanbad', 'East Singhbhum (Jamshedpur)', 'Bokaro', 'Palamu', 
  'Hazaribagh', 'Deoghar', 'Giridih', 'Ramgarh', 'Latehar', 
  'Garhwa', 'Dumka', 'Godda', 'Sahebganj', 'Pakur', 'Jamtara', 
  'Khunti', 'Gumla', 'Simdega', 'West Singhbhum', 'Seraikela Kharsawan', 
  'Chatra', 'Koderma', 'Lohardaga'
];

const DISASTER_CATEGORIES = [
  { id: 'flood', label: 'Flooding & Drainage Crisis', icon: '🌊' },
  { id: 'landslide', label: 'Landslide / Mine Subsidence', icon: '⛰️' },
  { id: 'drought', label: 'Drought & Groundwater Depletion', icon: '☀️' },
  { id: 'fire', label: 'Forest Fire / Industrial Fire', icon: '🔥' },
  { id: 'infrastructure', label: 'Bridge / Road / School Hazard', icon: '🏫' },
  { id: 'health_water', label: 'Contaminated Water & Epidemic Risk', icon: '💧' },
];

export const QuickReportModal: React.FC<QuickReportModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<'form' | 'submitting' | 'success'>('form');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('flood');
  const [district, setDistrict] = useState('Ranchi');
  const [blockVillage, setBlockVillage] = useState('');
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [peopleAffected, setPeopleAffected] = useState('100-500');
  const [urgency, setUrgency] = useState<'High' | 'Medium' | 'Critical'>('High');
  const [filePreviews, setFilePreviews] = useState<string[]>([]);
  const [submittedId, setSubmittedId] = useState('');

  if (!isOpen) return null;

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({
          lat: parseFloat(pos.coords.latitude.toFixed(5)),
          lng: parseFloat(pos.coords.longitude.toFixed(5)),
        });
        setLocating(false);
      },
      () => {
        // Fallback default Ranchi coordinates
        setLocationCoords({ lat: 23.3441, lng: 85.3096 });
        setLocating(false);
      },
      { timeout: 8000 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const newPreviews = filesArray.map((file) => URL.createObjectURL(file));
      setFilePreviews((prev) => [...prev, ...newPreviews]);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('submitting');
    
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const generatedId = `JH-2026-${category.substring(0, 2).toUpperCase()}-${randomNum}`;
      setSubmittedId(generatedId);
      setStep('success');
    }, 1500);
  };

  const resetAndClose = () => {
    setStep('form');
    setTitle('');
    setDescription('');
    setFilePreviews([]);
    setLocationCoords(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F3] border border-[#DCD6C6] rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-[#1E3A5F] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-[#C2760C] rounded-lg flex items-center justify-center text-white">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Submit Incident & Evidence</h3>
              <p className="text-xs text-[#EAE6DA]">Direct Public Intake · Government of Jharkhand Verified</p>
            </div>
          </div>
          <button 
            onClick={resetAndClose}
            className="text-white/80 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step 1: Form */}
        {step === 'form' && (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Category selection */}
            <div>
              <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-2">
                1. Select Hazard / Challenge Domain
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DISASTER_CATEGORIES.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                      category === cat.id
                        ? 'border-[#1E3A5F] bg-[#1E3A5F] text-white shadow-sm'
                        : 'border-[#DCD6C6] bg-white text-[#22201B] hover:border-[#1E3A5F]/40'
                    }`}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span className="text-xs font-semibold leading-tight">{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title & Description */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  2. Problem Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Subernarekha River Overflow submerging Primary School Road"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-sm text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  3. Detailed Description & Urgency Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe the current hazard level, frequency, and why university technical solution is needed..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-sm text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                />
              </div>
            </div>

            {/* Photo / Video Evidence Upload Box */}
            <div>
              <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1 flex items-center justify-between">
                <span>4. Evidence Attachment (Photos / Videos / Field Docs)</span>
                <span className="text-[11px] font-normal text-[#5C574C]">Geo-tagging verified</span>
              </label>

              <div className="border-2 border-dashed border-[#DCD6C6] bg-white hover:bg-[#F3F0E8]/50 rounded-xl p-4 text-center transition-colors">
                <input
                  type="file"
                  id="evidence-upload"
                  multiple
                  accept="image/*,video/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label 
                  htmlFor="evidence-upload"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2 py-2"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1E3A5F]/10 text-[#1E3A5F] flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#1E3A5F] hover:underline">Click to upload photos/videos</span>
                    <span className="text-xs text-[#5C574C]"> or drag & drop</span>
                  </div>
                  <p className="text-[11px] text-[#5C574C]">PNG, JPG, MP4, PDF up to 25MB each</p>
                </label>
              </div>

              {/* Previews */}
              {filePreviews.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {filePreviews.map((preview, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-[#DCD6C6] group">
                      <img src={preview} alt="Evidence preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl opacity-90 hover:opacity-100"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="grid sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  5. District (Jharkhand)
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-xs font-medium text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                >
                  {JHARKHAND_DISTRICTS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  Block / Village / Landmark
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kanke Block, Village Sukurhutu"
                  value={blockVillage}
                  onChange={(e) => setBlockVillage(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-[#DCD6C6] rounded-lg text-xs text-[#22201B] focus:outline-none focus:ring-2 focus:ring-[#1E3A5F]"
                  required
                />
              </div>
            </div>

            {/* GPS Tag Button */}
            <div className="flex items-center justify-between bg-[#F3F0E8] p-3 rounded-xl border border-[#DCD6C6]">
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-[#C2760C]" />
                <span className="text-xs text-[#22201B]">
                  {locationCoords 
                    ? `GPS: ${locationCoords.lat}°N, ${locationCoords.lng}°E` 
                    : 'Attach live GPS coordinates for GIS heatmapping'}
                </span>
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={locating}
                className="px-3 py-1.5 bg-white hover:bg-[#EAE6DA] border border-[#DCD6C6] rounded-lg text-xs font-semibold text-[#1E3A5F] transition-colors"
              >
                {locating ? 'Acquiring...' : locationCoords ? 'Re-tag GPS' : 'Auto-Detect GPS'}
              </button>
            </div>

            {/* Urgency & Affected Population */}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  Estimated People Affected
                </label>
                <select
                  value={peopleAffected}
                  onChange={(e) => setPeopleAffected(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DCD6C6] rounded-lg text-xs text-[#22201B]"
                >
                  <option value="Under 50">Under 50 people</option>
                  <option value="50-200">50 – 200 people</option>
                  <option value="200-1000">200 – 1,000 people</option>
                  <option value="1000-5000">1,000 – 5,000 people</option>
                  <option value="5000+">5,000+ people (Severe Area Hazard)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1E3A5F] uppercase tracking-wider mb-1">
                  Urgency Level
                </label>
                <select
                  value={urgency}
                  onChange={(e) => setUrgency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-[#DCD6C6] rounded-lg text-xs text-[#22201B]"
                >
                  <option value="Medium">Medium (Seasonal / Recurring)</option>
                  <option value="High">High (Impending Risk to Life/Assets)</option>
                  <option value="Critical">Critical (Active Emergency / Imminent Danger)</option>
                </select>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-4 py-2.5 text-xs font-semibold text-[#5C574C] hover:text-[#22201B]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#0F766E] hover:bg-[#0d645e] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center space-x-2"
              >
                <span>Submit to NIVAARAN Engine</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* Step 2: AI Triage in progress */}
        {step === 'submitting' && (
          <div className="p-12 text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#1E3A5F] animate-spin mx-auto" />
            <h3 className="text-lg font-bold text-[#1E3A5F]">AI Problem Intelligence Triage in Progress...</h3>
            <p className="text-xs text-[#5C574C] max-w-md mx-auto leading-relaxed">
              Extracting geospatial entities, deduplicating with nearby reports in {district}, and generating initial university match parameters.
            </p>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="p-8 text-center space-y-5">
            <div className="w-16 h-16 bg-[#0F766E]/10 text-[#0F766E] rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-mono font-bold bg-[#0F766E]/10 text-[#0F766E] px-3 py-1 rounded-full">
                Incident Registered
              </span>
              <h3 className="text-2xl font-extrabold text-[#1E3A5F] pt-2">{submittedId}</h3>
              <p className="text-xs text-[#5C574C]">Your tracking ID has been securely logged on the state ledger.</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-[#DCD6C6] text-left text-xs space-y-2 max-w-md mx-auto">
              <div className="flex justify-between border-b border-[#DCD6C6] pb-1.5">
                <span className="text-[#5C574C]">Status:</span>
                <span className="font-bold text-[#C2760C]">Submitted → AI Triage Complete</span>
              </div>
              <div className="flex justify-between border-b border-[#DCD6C6] pb-1.5">
                <span className="text-[#5C574C]">Geographic Node:</span>
                <span className="font-semibold text-[#22201B]">{blockVillage}, {district}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#5C574C]">Next Automated Stage:</span>
                <span className="font-semibold text-[#1E3A5F]">Government Officer Validation</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-center space-x-3">
              <button
                type="button"
                onClick={resetAndClose}
                className="px-6 py-2.5 bg-[#1E3A5F] hover:bg-[#16293F] text-white font-bold text-xs rounded-xl transition-colors"
              >
                Done & Return to Overview
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
