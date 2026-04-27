import React from 'react';
import { PieChart, Pie, Cell, Tooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, LineChart as LineChartIcon } from 'lucide-react';
import { toEuros } from '../api';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-100 text-sm">
        <p className="font-medium text-slate-800">{payload[0].name}</p>
        <p className="text-slate-600">€{toEuros(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

export const ExpenseDonutChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
        <PieChartIcon size={48} className="mb-3 text-slate-300 opacity-50" />
        <p className="text-sm font-medium">No expenses to display</p>
      </div>
    );
  }

  // Format data for Recharts
  const chartData = data.map(d => ({
    name: d.name,
    value: d.total,
    color: d.color
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={80}
          outerRadius={110}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
};

export const MonthlyLineChart = ({ data }) => {
  if (!data || data.length === 0 || data.every(d => d.expenses === 0 && d.incomes === 0)) {
    return (
      <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 bg-slate-50 rounded-xl border border-slate-100 border-dashed">
        <LineChartIcon size={48} className="mb-3 text-slate-300 opacity-50" />
        <p className="text-sm font-medium">No historical data available</p>
      </div>
    );
  }

  // Format month label
  const formattedData = data.map(d => {
    const [y, m] = d.month.split('-');
    const date = new Date(parseInt(y), parseInt(m) - 1, 1);
    return {
      ...d,
      displayMonth: date.toLocaleDateString('default', { month: 'short' })
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={formattedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
        <XAxis 
          dataKey="displayMonth" 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 12 }} 
          dy={10}
        />
        <YAxis 
          axisLine={false} 
          tickLine={false} 
          tick={{ fill: '#64748b', fontSize: 12 }}
          tickFormatter={(val) => `€${toEuros(val)}`}
        />
        <Tooltip 
          contentStyle={{ borderRadius: '8px', border: '1px solid #f1f5f9', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          formatter={(value) => [`€${toEuros(value)}`]}
          labelStyle={{ fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}
        />
        <Line 
          type="monotone" 
          dataKey="expenses" 
          name="Expenses" 
          stroke="#f43f5e" 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
        <Line 
          type="monotone" 
          dataKey="incomes" 
          name="Income" 
          stroke="#10b981" 
          strokeWidth={3}
          dot={{ r: 4, strokeWidth: 2 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};
