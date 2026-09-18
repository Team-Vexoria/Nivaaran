import React, { useState, useEffect } from 'react';
import { Pencil, Save, RotateCcw, CheckCircle2, AlertTriangle, Layers, X } from 'lucide-react';
import { LIFECYCLE_STAGES } from '../../services/workflowLifecycle';
import { getStageOverrideNote, setStageOverrideNote, composeStageDescription } from '../../services/stageDescriptionEngine';
import type { Challenge } from '../../services/workflowTypes';

interface GovernmentDossierOverridePanelProps {
  challenge: Challenge;
  readOnly?: boolean;
  onClose?: () => void;
}

export const GovernmentDossierOverridePanel: React.FC<GovernmentDossierOverridePanelProps> = ({
  challenge,
  readOnly = false,
  onClose,
}) => {
  const [selectedStage, setSelectedStage] = useState<number>(challenge.stageNumber || 1);
  const [editText, setEditText] = useState<string>('');
  const [savedStages, setSavedStages] = useState<Set<number>>(new Set());
  const [saveFlash, setSaveFlash] = useState(false);

  // Load existing override note when stage changes
  useEffect(() => {
    const existing = getStageOverrideNote(challenge.id, selectedStage);
    setEditText(existing || '');
  }, [challenge.id, selectedStage]);

  // Track which stages already have overrides
  useEffect(() => {
    const overridden = new Set<number>();
    for (const s of LIFECYCLE_STAGES) {
      if (getStageOverrideNote(challenge.id, s.stageNumber)) {
        overridden.add(s.stageNumber);
      }
    }
    setSavedStages(overridden);
  }, [challenge.id]);

  const handleSave = () => {
    setStageOverrideNote(challenge.id, selectedStage, editText);
    setSavedStages(prev => {
      const next = new Set(prev);
      if (editText.trim()) {
        next.add(selectedStage);
      } else {
        next.delete(selectedStage);
      }
      return next;
    });
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  const handleClear = () => {
    setStageOverrideNote(challenge.id, selectedStage, '');
    setEditText('');
    setSavedStages(prev => {
      const next = new Set(prev);
      next.delete(selectedStage);
      return next;
    });
  };

  const stageDesc = composeStageDescription(challenge, selectedStage);

  return (
    <div className="bg-white border border-[#E4DDD1] rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-[#FAF8F4] border-b border-[#E4DDD1]">
        <div className="flex items-center gap-2">
          <Pencil className="w-4 h-4 text-amber-600" />
          <div>
            <h3 className="text-sm font-black text-[#201C18]">
              {readOnly ? 'Stage Description Viewer' : 'Stage Description Override Panel'}
            </h3>
            <p className="text-[10px] text-[#6A6155]">
              {readOnly
                ? 'View auto-generated stage descriptions for this challenge'
                : 'Government officers can override per-stage AI-generated descriptions'}
            </p>
          </div>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} className="p-1.5 hover:bg-[#EAE4D8] rounded-xl transition-colors">
            <X className="w-4 h-4 text-[#8A7F72]" />
          </button>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: stage picker */}
        <div className="w-48 border-r border-[#E4DDD1] overflow-y-auto bg-[#FAF8F4]/50 shrink-0">
          {LIFECYCLE_STAGES.map(s => {
            const isDone = s.stageNumber < (challenge.stageNumber || 1);
            const isCurrent = s.stageNumber === (challenge.stageNumber || 1);
            const hasOverride = savedStages.has(s.stageNumber);

            return (
              <button
                key={s.stageNumber}
                type="button"
                onClick={() => setSelectedStage(s.stageNumber)}
                className={`w-full text-left px-3 py-2 border-b border-[#E4DDD1] transition-colors cursor-pointer flex items-center gap-2 ${
                  selectedStage === s.stageNumber
                    ? 'bg-white border-l-2 border-l-amber-500 font-black'
                    : 'hover:bg-white/70'
                }`}
              >
                <div className="shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  ) : isCurrent ? (
                    <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
                  ) : (
                    <div className="w-3 h-3 rounded-full border border-[#C4BDB4]" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-mono text-[#8A7F72]">S{s.stageNumber}</p>
                  <p className="text-[10px] font-bold text-[#201C18] leading-tight truncate">{s.displayName}</p>
                </div>
                {hasOverride && (
                  <Pencil className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Right: description + editor */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Auto-generated preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-[#2C6E49]" />
              <p className="text-[11px] font-black text-[#201C18] uppercase tracking-wider">
                Stage {selectedStage}: {LIFECYCLE_STAGES.find(s => s.stageNumber === selectedStage)?.displayName}
              </p>
            </div>

            <div className="bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 space-y-2">
              <p className="text-xs font-bold text-[#201C18]">{stageDesc.headline}</p>
              <p className="text-[11px] text-[#5A5247] leading-relaxed">{stageDesc.body}</p>
            </div>

            {stageDesc.missingFields.length > 0 && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-[10px] font-black text-amber-700 mb-0.5">Missing Data</p>
                  {stageDesc.missingFields.map((f, i) => (
                    <p key={i} className="text-[10px] text-amber-800">• {f}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Override note editor (not shown in readOnly) */}
          {!readOnly && (
            <div className="space-y-2 border-t border-[#E4DDD1] pt-4">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-black text-[#201C18] flex items-center gap-1.5">
                  <Pencil className="w-3.5 h-3.5 text-amber-600" />
                  Override Note for Stage {selectedStage}
                </p>
                {editText && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-[10px] text-[#8A7F72] hover:text-red-600 flex items-center gap-0.5"
                  >
                    <RotateCcw className="w-3 h-3" /> Clear
                  </button>
                )}
              </div>

              <textarea
                value={editText}
                onChange={e => setEditText(e.target.value)}
                rows={4}
                placeholder={`Write a custom description for Stage ${selectedStage} that will be displayed to citizens in place of the AI-generated text…`}
                className="w-full text-xs bg-[#FAF8F4] border border-[#E4DDD1] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-amber-400/40 resize-none text-[#201C18]"
              />

              <button
                type="button"
                onClick={handleSave}
                className={`w-full py-2 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-all ${
                  saveFlash
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 text-white'
                }`}
              >
                {saveFlash ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Saved — Citizen view updated
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Override Note
                  </>
                )}
              </button>

              <p className="text-[9px] text-[#8A7F72] text-center">
                This override will be displayed with a pencil badge in citizen-facing stage descriptions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
