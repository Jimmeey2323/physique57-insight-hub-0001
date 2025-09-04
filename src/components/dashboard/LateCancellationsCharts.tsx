import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface LateCancellationsChartsProps {
  byLocation: any[];
  byClass: any[];
  selectedLocation: string;
}

export function LateCancellationsCharts({ byLocation, byClass, selectedLocation }: LateCancellationsChartsProps) {
  
  const trendData = useMemo(() => {
    const months = ['Jan-2024', 'Feb-2024', 'Mar-2024', 'Apr-2024', 'May-2024', 'Jun-2024', 
                   'Jul-2024', 'Aug-2024', 'Sep-2024', 'Oct-2024', 'Nov-2024', 'Dec-2024',
                   'Jan-2025', 'Feb-2025', 'Mar-2025', 'Apr-2025', 'May-2025', 'Jun-2025',
                   'Jul-2025', 'Aug-2025'];
    
    return months.map(month => {
      let total = 0;
      if (selectedLocation === 'all') {
        total = byLocation.reduce((sum, row) => sum + (row[month] || 0), 0);
      } else {
        const locationRow = byLocation.find(row => row.Location === selectedLocation);
        total = locationRow?.[month] || 0;
      }
      
      return {
        month: month.replace('-2024', '').replace('-2025', ''),
        cancellations: total
      };
    });
  }, [byLocation, selectedLocation]);

  const topClassesData = useMemo(() => {
    const currentMonth = 'Aug-2025';
    let filteredClasses = byClass;
    
    if (selectedLocation !== 'all') {
      filteredClasses = byClass.filter(row => row.Location === selectedLocation);
    }
    
    return filteredClasses
      .map(row => ({
        class: row['Cleaned Class'] || 'Unknown',
        cancellations: row[currentMonth] || 0
      }))
      .filter(item => item.cancellations > 0)
      .sort((a, b) => b.cancellations - a.cancellations)
      .slice(0, 10);
  }, [byClass, selectedLocation]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Late Cancellations Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis 
                dataKey="month" 
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="cancellations" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#ef4444' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Top Classes by Cancellations</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topClassesData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" fontSize={12} />
              <YAxis 
                type="category" 
                dataKey="class" 
                stroke="#94a3b8" 
                fontSize={10}
                width={100}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#f8fafc'
                }}
              />
              <Bar 
                dataKey="cancellations" 
                fill="#f59e0b"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}