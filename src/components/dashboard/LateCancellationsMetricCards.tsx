import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Users, Calendar } from 'lucide-react';
import { formatNumber } from '@/utils/formatters';

interface LateCancellationsMetricCardsProps {
  byLocation: any[];
  byClass: any[];
  byTrainer: any[];
  byProduct: any[];
  byMember: any[];
}

export function LateCancellationsMetricCards({ 
  byLocation, 
  byClass, 
  byTrainer, 
  byProduct, 
  byMember 
}: LateCancellationsMetricCardsProps) {
  
  const metrics = useMemo(() => {
    // Get current month (Aug-2025) and previous month (Jul-2025) totals
    const currentMonth = 'Aug-2025';
    const previousMonth = 'Jul-2025';
    
    // Calculate total late cancellations for current and previous month
    const currentTotal = byLocation.reduce((sum, row) => sum + (row[currentMonth] || 0), 0);
    const previousTotal = byLocation.reduce((sum, row) => sum + (row[previousMonth] || 0), 0);
    
    // Calculate percentage change
    const percentageChange = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal) * 100 : 0;
    
    // Find most problematic location
    const mostCancellationsLocation = byLocation.reduce((max, row) => 
      (row[currentMonth] || 0) > (max?.[currentMonth] || 0) ? row : max, null
    );
    
    // Count unique classes with cancellations
    const activeClasses = byClass.filter(row => (row[currentMonth] || 0) > 0).length;
    
    // Count members with multiple cancellations per day
    const problematicMembers = byMember.reduce((sum, row) => sum + (row[currentMonth] || 0), 0);
    
    return {
      currentTotal,
      percentageChange,
      mostCancellationsLocation: mostCancellationsLocation?.Location || 'N/A',
      mostCancellationsCount: mostCancellationsLocation?.[currentMonth] || 0,
      activeClasses,
      problematicMembers
    };
  }, [byLocation, byClass, byMember]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Total Late Cancellations
          </CardTitle>
          <Calendar className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics.currentTotal)}
          </div>
          <div className="flex items-center text-xs">
            {metrics.percentageChange >= 0 ? (
              <TrendingUp className="mr-1 h-3 w-3 text-red-400" />
            ) : (
              <TrendingDown className="mr-1 h-3 w-3 text-green-400" />
            )}
            <span className={metrics.percentageChange >= 0 ? "text-red-400" : "text-green-400"}>
              {Math.abs(metrics.percentageChange).toFixed(1)}% from last month
            </span>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Most Affected Location
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics.mostCancellationsCount)}
          </div>
          <p className="text-xs text-slate-400">
            {metrics.mostCancellationsLocation}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Active Classes
          </CardTitle>
          <Calendar className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics.activeClasses)}
          </div>
          <p className="text-xs text-slate-400">
            classes with cancellations
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-slate-300">
            Problematic Members
          </CardTitle>
          <Users className="h-4 w-4 text-slate-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(metrics.problematicMembers)}
          </div>
          <p className="text-xs text-slate-400">
            members with &gt;1 cancellation/day
          </p>
        </CardContent>
      </Card>
    </div>
  );
}