import React, { useState } from 'react';
import { Users, UserCheck, ArrowRight } from 'lucide-react';
import { ChallengeDoc, saveProjectTeamToStore, ProjectTeamMember } from '../../services/firebaseService';
import { UniversityDoc, StudentRosterItem, DepartmentInfo } from '../../services/universityData';

interface MultidisciplinaryTeamTabProps {
  university: UniversityDoc;
  activeChallenge: ChallengeDoc | null;
  selectedDept?: DepartmentInfo | null;
  onProceedToProposal: (challengeId: string) => void;
}

export const MultidisciplinaryTeamTab: React.FC<MultidisciplinaryTeamTabProps> = ({
  university,
  activeChallenge,
  selectedDept: _selectedDept,
  onProceedToProposal,
}) => {
  const [selectedFacultyId, setSelectedFacultyId] = useState<string>(
    university.faculty.length > 0 ? university.faculty[0].id : ''
  );
  const [selectedMembers, setSelectedMembers] = useState<ProjectTeamMember[]>([]);
  const [saveError, setSaveError] = useState<string>('');

  // Default pre-select multidisciplinary students if roster available
  React.useEffect(() => {
    if (university.students.length > 0 && selectedMembers.length === 0) {
      const defaultPicks: ProjectTeamMember[] = university.students.slice(0, 3).map((stu, index) => ({
        studentId: stu.id,
        name: stu.name,
        departmentName: university.departments.find(d => d.id === stu.departmentId)?.name || 'Engineering',
        role: index === 0 ? 'Student Project Lead & IoT' : index === 1 ? 'GIS & Drone Data Specialist' : 'Environmental Auditor',
        skills: stu.skills,
      }));
      setSelectedMembers(defaultPicks);
    }
  }, [university]);

  const toggleStudentSelection = (stu: StudentRosterItem) => {
    const exists = selectedMembers.some(m => m.studentId === stu.id);
    if (exists) {
      setSelectedMembers(selectedMembers.filter(m => m.studentId !== stu.id));
    } else {
      const dept = university.departments.find(d => d.id === stu.departmentId);
      setSelectedMembers([
        ...selectedMembers,
        {
          studentId: stu.id,
          name: stu.name,
          departmentName: dept?.name || 'Academic Dept',
          role: 'R&D Team Researcher',
          skills: stu.skills,
        },
      ]);
    }
  };

  const updateMemberRole = (studentId: string, newRole: string) => {
    setSelectedMembers(selectedMembers.map(m => m.studentId === studentId ? { ...m, role: newRole } : m));
  };

  const handleSaveTeam = () => {
    if (!activeChallenge) return;
    setSaveError('');
    const faculty = university.faculty.find(f => f.id === selectedFacultyId) || university.faculty[0];

    const saved = saveProjectTeamToStore({
      challengeId: activeChallenge.id || activeChallenge.reportId,
      challengeTitle: activeChallenge.title,
      category: activeChallenge.category,
      district: activeChallenge.district,
      universityId: university.id,
      universityName: university.name,
      facultyMentorName: faculty?.name || 'Faculty Lead',
      facultyEmail: faculty?.email || 'mentor@hei.ac.in',
      teamMembers: selectedMembers,
      status: 'Team Formed',
      milestones: [
        { stageNumber: 1, title: 'Geotag Inspection & Hardware Specs', description: 'Field site audit and sensor bill of materials', status: 'Completed', targetDays: 3 },
        { stageNumber: 2, title: 'Multidisciplinary R&D Prototype', description: 'Hardware sensor assembly & algorithm testing', status: 'In Progress', targetDays: 7 },
        { stageNumber: 3, title: 'Pilot Site Deployment & Testing', description: 'Field trial at village site with citizen feedback', status: 'Pending', targetDays: 14 },
        { stageNumber: 4, title: 'Final Impact Verification & Handover', description: 'Government verification certificate issued', status: 'Pending', targetDays: 21 },
      ],
    });

    if (!saved) {
      setSaveError('The team could not be saved because the challenge is no longer at the university acceptance stage. Return to the intake queue and refresh.');
      return;
    }

    onProceedToProposal(activeChallenge.id || activeChallenge.reportId);
  };

  if (!activeChallenge) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3">
        <Users className="w-10 h-10 text-slate-400 mx-auto" />
        <h3 className="text-lg font-bold text-slate-900">No Challenge Selected for Team Formation</h3>
        <p className="text-xs text-slate-600 max-w-md mx-auto">
          Please select and accept an incoming challenge from Tab 1 (Matched Intake Queue) to form a multidisciplinary R&D team.
        </p>
      </div>
    );
  }

  const faculty = university.faculty.find(f => f.id === selectedFacultyId) || university.faculty[0];

  return (
    <div className="space-y-6">
      
      {/* Header & Challenge Context */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono font-extrabold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
            {activeChallenge.reportId || activeChallenge.id}
          </span>
          <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
            Stage 8: Multidisciplinary Team Formation
          </span>
        </div>

        <h2 className="text-xl font-extrabold font-heading text-slate-900">
          Form R&D Team for: "{activeChallenge.title}"
        </h2>
        <p className="text-xs text-slate-600 font-medium">
          Category: <span className="font-bold text-slate-900">{activeChallenge.category}</span> · Location: <span className="font-bold text-slate-900">{activeChallenge.village}, {activeChallenge.district}</span>
        </p>
      </div>

      {/* 1. Select Faculty Mentor Lead */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-500 block">
          1. Select Faculty Mentor & Lead Investigator:
        </label>
        
        <select
          value={selectedFacultyId}
          onChange={(e) => setSelectedFacultyId(e.target.value)}
          className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
        >
          {university.faculty.map((fac) => (
            <option key={fac.id} value={fac.id}>
              {fac.name} ({fac.designation}) — Specialization: {fac.specialization.join(', ')}
            </option>
          ))}
        </select>

        {faculty && (
          <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-900">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Assigned Lead Investigator: <strong className="font-bold">{faculty.name}</strong> ({faculty.email})</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
              {faculty.activeProjectsCount} Active Projects
            </span>
          </div>
        )}
      </div>

      {/* 2. Multidisciplinary Student Roster Matrix */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-wider">
              2. Multidisciplinary Student Selection Roster
            </h3>
            <p className="text-xs text-slate-500">
              Select students from different academic departments to build a cross-functional engineering team.
            </p>
          </div>

          <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
            {selectedMembers.length} Selected
          </span>
        </div>

        {/* Student Cards Grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {university.students.map((stu) => {
            const isSelected = selectedMembers.some(m => m.studentId === stu.id);
            const dept = university.departments.find(d => d.id === stu.departmentId);
            const currentMember = selectedMembers.find(m => m.studentId === stu.id);

            return (
              <div 
                key={stu.id}
                className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50/40 shadow-xs' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-slate-400 block">{stu.rollNumber}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{stu.name}</h4>
                    <span className="text-[11px] font-bold text-emerald-700 block">{dept?.name || 'Department'}</span>
                  </div>

                  <input 
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleStudentSelection(stu)}
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
                  />
                </div>

                {/* Skills Badges */}
                <div className="flex flex-wrap gap-1">
                  {stu.skills.map((skill, i) => (
                    <span key={i} className="text-[10px] font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded">
                      {skill}
                    </span>
                  ))}
                </div>

                {/* Role Assignment Input (If Selected) */}
                {isSelected && (
                  <div className="pt-2 border-t border-emerald-200/80 space-y-1">
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block">Assigned Project Role:</label>
                    <input 
                      type="text"
                      value={currentMember?.role || ''}
                      onChange={(e) => updateMemberRole(stu.id, e.target.value)}
                      className="w-full px-2.5 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-slate-900"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Confirm Team & Proceed */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block">Multidisciplinary Team Ready</span>
          <p className="text-sm font-extrabold">
            {selectedMembers.length} Students & 1 Faculty Lead Assigned to R&D Unit
          </p>
        </div>

        <button
          onClick={handleSaveTeam}
          disabled={selectedMembers.length === 0}
          className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center space-x-2 active:scale-95 disabled:opacity-50"
        >
          <span>Save R&D Team & Draft Proposal</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {saveError && (
        <div className="bg-rose-50 border border-rose-200 p-3 rounded-xl text-xs font-semibold text-rose-800">
          {saveError}
        </div>
      )}

    </div>
  );
};
