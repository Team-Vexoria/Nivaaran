import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartNoData } from './ChartNoData';

interface StatusDonutProps {
  data: Record<string, number>;
}

const STATUS_COLORS: Record<string, string> = {
  SUBMITTED: '#C98A2C',
  AI_UNDERSTANDING: '#8A7F72',
  CLARIFICATION_REQUESTED: '#F0D99A',
  VALIDATED: '#2C6E49',
  DEFERRED: '#B45309',
  REJECTED: '#B3261E',
  CLUSTERED: '#6B21A8',
  PRIORITY_RANKED: '#C98A2C',
  MATCHING: '#2C6E49',
  UNIVERSITY_ACCEPTED: '#2C6E49',
  UNIVERSITY_DECLINED: '#B3261E',
  TEAM_FORMING: '#4A433B',
  PROPOSAL_REVIEW: '#8A7F72',
  COLLABORATION: '#C98A2C',
  PROTOTYPE: '#6B21A8',
  PROJECT_ACTIVE: '#2C6E49',
  PILOT: '#C98A2C',
  PROJECT_VALIDATION: '#B45309',
  DEPLOYMENT_APPROVED: '#2C6E49',
  IMPACT_MEASUREMENT: '#2C6E49',
  CLOSED: '#B3261E',
  FAILED: '#B3261E',
  STALLED: '#F59E0B',
};

export const StatusDonutChart: React.FC<StatusDonutProps> = ({ data }) => {
  const entries = Object.entries(data || {}).map(([name, value]) => ({ name, value }));
  if (entries.length === 0) return <ChartNoData message="No status data" />;

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={entries}
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="85%"
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${((percent ?? 0) * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {entries.map((_, i) => (
              <Cell key={`cell-${i}`} fill={STATUS_COLORS[entries[i].name] || '#C98A2C'} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
