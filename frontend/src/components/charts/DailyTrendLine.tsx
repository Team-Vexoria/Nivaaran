import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ChartNoData } from './ChartNoData';

interface DailyTrendProps {
  data: { date: string; count: number; avgPriority: number }[];
}

export const DailyTrendLine: React.FC<DailyTrendProps> = ({ data }) => {
  if (!data || data.length === 0) return <ChartNoData message="No trend data" />;
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4DDD1" />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#6A6155', angle: -30, textAnchor: 'end' }} stroke="#8A7F72" />
          <YAxis tick={{ fontSize: 12, fill: '#6A6155' }} stroke="#8A7F72" allowDecimals={false} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E4DDD1', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px', color: '#201C18' }} />
          <Line type="monotone" dataKey="count" name="Submissions" stroke="#2C6E49" strokeWidth={2.5} dot={{ r: 3, fill: '#2C6E49' }} activeDot={{ r: 5 }} />
          <Line type="monotone" dataKey="avgPriority" name="Avg Priority" stroke="#C98A2C" strokeWidth={2} dot={{ r: 3, fill: '#C98A2C' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
