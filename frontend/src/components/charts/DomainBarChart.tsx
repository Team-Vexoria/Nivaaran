import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ChartNoData } from './ChartNoData';

interface DomainBarProps {
  data: { domain: string; category: string; count: number }[];
}

export const DomainBarChart: React.FC<DomainBarProps> = ({ data }) => {
  if (!data || data.length === 0) return <ChartNoData message="No domain data" />;
  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 70, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E4DDD1" />
          <XAxis type="number" tick={{ fontSize: 12, fill: '#6A6155' }} stroke="#8A7F72" allowDecimals={false} />
          <YAxis type="category" dataKey="domain" tick={{ fontSize: 11, fill: '#201C18' }} width={120} />
          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid #E4DDD1', fontSize: '12px' }} />
          <Bar dataKey="count" radius={[0, 6, 6, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={i % 2 === 0 ? '#2C6E49' : '#B3261E'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
