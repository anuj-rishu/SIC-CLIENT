"use client";

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LeaderboardChartsProps {
  data: {
    members: any[];
    domains: any[];
  };
}

export default function LeaderboardCharts({ data }: LeaderboardChartsProps) {
  const [selectedDomain, setSelectedDomain] = React.useState<string>('all');

  // Bar Chart Data: Domain Performance
  const barData = {
    labels: data.domains.map(d => d.name),
    datasets: [
      {
        label: 'Avg Efficiency Score',
        data: data.domains.map(d => d.score),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        borderRadius: 8,
        hoverBackgroundColor: '#3b82f6',
      },
    ],
  };

  // Line Chart Data: Performance Curve
  const filteredMembers = (selectedDomain === 'all' 
    ? data.members 
    : data.members.filter(m => m.domain === selectedDomain))
    .filter(m => m.role === "MEMBER");

  const displayMembers = filteredMembers.slice(0, 10);

  const lineData = {
    labels: displayMembers.map(m => m.name.split(' ')[0]),
    datasets: [
      {
        fill: true,
        label: 'Operational Output',
        data: displayMembers.map(m => m.score),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 4,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleFont: { size: 12, weight: 'bold' as const },
        bodyFont: { size: 11 },
        padding: 12,
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        displayColors: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgba(255,255,255,0.4)',
          font: { size: 9, weight: 'bold' as const },
          autoSkip: true,
          maxRotation: 45,
          minRotation: 0,
        },
      },
      y: {
        grid: {
          color: 'rgba(255,255,255,0.05)',
        },
        ticks: {
          color: 'rgba(255,255,255,0.4)',
          font: { size: 9 },
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {/* Bar Chart: Domain Power Ranking */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Domain Power Distribution</h4>
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase mt-1 tracking-wider">Avg Efficiency per Squad</p>
          </div>
        </div>
        <div className="h-64">
          <Bar data={barData} options={commonOptions} />
        </div>
      </div>

      {/* Line Chart: Performance Curve */}
      <div className="bg-white/[0.03] border border-white/5 rounded-2xl p-5 backdrop-blur-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h4 className="text-xs font-black text-white uppercase tracking-widest">Performance Velocity Curve</h4>
            <p className="text-[9px] text-muted-foreground/40 font-bold uppercase mt-1 tracking-wider">
              {selectedDomain === 'all' ? 'Global' : selectedDomain} - Top 10 Agents
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select 
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[8px] font-black text-white uppercase tracking-wider outline-none focus:border-primary/40 transition-all"
            >
              <option value="all">Global Roster</option>
              {data.domains.map(d => (
                <option key={d.name} value={d.name}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="h-64">
          <Line data={lineData} options={commonOptions} />
        </div>
      </div>
    </div>
  );
}
