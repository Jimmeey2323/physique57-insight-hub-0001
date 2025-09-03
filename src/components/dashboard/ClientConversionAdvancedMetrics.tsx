
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Award, Calendar, BarChart3, UserCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';

  data: NewClientData[];
  // Optionally allow passing payroll data for richer metrics
  payrollData?: any[];
}

  console.log('ClientConversionAdvancedMetrics data:', data.length, 'records');

  // --- Hosted class detection helper ---
  const isHostedClass = (entity: string = '') => {
    if (!entity) return false;
    return /host|hosted|birthday|rugby|outdoor|x|p57|sign|link|influencer/i.test(entity);
  };

  // --- Month-Year extraction helper ---
  const getMonthYear = (dateStr: string = '', fallback: string = '') => {
    if (!dateStr) return fallback;
    // Try DD/MM/YYYY or YYYY-MM-DD or similar
    const d = dateStr.includes('/') ? dateStr.split(/[ ,]/)[0].split('/') : dateStr.split('-');
    if (d.length >= 3) {
      const year = d[2].length === 4 ? d[2] : d[0];
      const month = d[1].length === 2 ? d[1] : d[1].padStart(2, '0');
      return `${year}-${month}`;
    }
    return fallback;
  };

  // --- Hosted class month-on-month stats ---
  const hostedClassMoM = React.useMemo(() => {
    const stats: Record<string, { total: number; converted: number; retained: number; newClients: number }> = {};
    data.forEach(client => {
      if (isHostedClass(client.firstVisitEntityName)) {
        const month = client.monthYear || getMonthYear(client.firstVisitDate, 'Unknown');
        if (!stats[month]) stats[month] = { total: 0, converted: 0, retained: 0, newClients: 0 };
        stats[month].total++;
        if ((client.isNew || '').toLowerCase().includes('new')) stats[month].newClients++;
        if ((client.conversionStatus || '').toLowerCase().includes('converted')) stats[month].converted++;
        if ((client.retentionStatus || '').toLowerCase().includes('retained')) stats[month].retained++;
      }
    });
    // Convert to sorted array
    return Object.entries(stats).sort(([a], [b]) => a.localeCompare(b)).map(([month, stat]) => ({ month, ...stat }));
  }, [data]);

  // --- Summary metrics ---
  const totalClients = data.length;
  const totalNew = data.filter(c => (c.isNew || '').toLowerCase().includes('new')).length;
  const totalConverted = data.filter(c => (c.conversionStatus || '').toLowerCase().includes('converted')).length;
  const totalRetained = data.filter(c => (c.retentionStatus || '').toLowerCase().includes('retained')).length;
  const avgLTV = totalClients > 0 ? data.reduce((sum, c) => sum + (c.ltv || 0), 0) / totalClients : 0;
  const avgConversionSpan = (() => {
    const spans = data.map(c => c.conversionSpan).filter(Boolean);
    return spans.length > 0 ? spans.reduce((a, b) => a + b, 0) / spans.length : 0;
  })();

  // --- Membership performance analysis ---
  const membershipStats = React.useMemo(() => {
    const stats = data.reduce((acc, client) => {
      const membership = client.membershipUsed || 'No Membership';
      if (!acc[membership]) {
        acc[membership] = {
          membershipType: membership,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          conversionSpans: []
        };
      }
      
      acc[membership].totalClients++;
  if ((client.conversionStatus || '').toLowerCase().includes('converted')) acc[membership].converted++;
  if ((client.retentionStatus || '').toLowerCase().includes('retained')) acc[membership].retained++;
      acc[membership].totalLTV += client.ltv || 0;
      if (client.conversionSpan && client.conversionSpan > 0) {
        acc[membership].conversionSpans.push(client.conversionSpan);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(stats).map((stat: any) => ({
      ...stat,
      conversionRate: stat.totalClients > 0 ? (stat.converted / stat.totalClients) * 100 : 0,
      retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      avgConversionSpan: stat.conversionSpans.length > 0 
        ? stat.conversionSpans.reduce((a: number, b: number) => a + b, 0) / stat.conversionSpans.length 
        : 0
    })).filter(stat => stat.totalClients > 0);

    console.log('Membership stats processed:', processed);
    return processed;
  }, [data]);

  // Trainer performance analysis
  // --- Trainer performance analysis ---
  const trainerStats = React.useMemo(() => {
    const stats = data.reduce((acc, client) => {
      const trainer = client.trainerName || 'No Trainer';
      if (!acc[trainer]) {
        acc[trainer] = {
          trainerName: trainer,
          totalClients: 0,
          converted: 0,
          retained: 0,
          totalLTV: 0,
          classNumbers: []
        };
      }
      
      acc[trainer].totalClients++;
  if ((client.conversionStatus || '').toLowerCase().includes('converted')) acc[trainer].converted++;
  if ((client.retentionStatus || '').toLowerCase().includes('retained')) acc[trainer].retained++;
      acc[trainer].totalLTV += client.ltv || 0;
      if (client.classNo && client.classNo > 0) {
        acc[trainer].classNumbers.push(client.classNo);
      }
      
      return acc;
    }, {} as Record<string, any>);

    const processed = Object.values(stats).map((stat: any) => ({
      ...stat,
      conversionRate: stat.totalClients > 0 ? (stat.converted / stat.totalClients) * 100 : 0,
      retentionRate: stat.totalClients > 0 ? (stat.retained / stat.totalClients) * 100 : 0,
      avgLTV: stat.totalClients > 0 ? stat.totalLTV / stat.totalClients : 0,
      avgClassNo: stat.classNumbers.length > 0 
        ? stat.classNumbers.reduce((a: number, b: number) => a + b, 0) / stat.classNumbers.length 
        : 0
    })).filter(stat => stat.totalClients > 0);

    console.log('Trainer stats processed:', processed);
    return processed;
  }, [data]);

  // --- Membership columns (add isNew) ---
  const membershipColumns = [
    {
      key: 'membershipType',
      header: 'Membership Type',
      className: 'font-semibold min-w-[200px]'
    },
    {
      key: 'isNew',
      header: 'Is New',
      align: 'center' as const,
      render: (_: any, row: any) => <span className="font-semibold">{row.isNew || ''}</span>
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="text-green-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgConversionSpan',
      header: 'Avg Conv. Days',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{Math.round(value)} days</span>
    }
  ];

  // --- Trainer columns ---
  const trainerColumns = [
    {
      key: 'trainerName',
      header: 'Trainer Name',
      className: 'font-semibold min-w-[150px]'
    },
    {
      key: 'totalClients',
      header: 'Total Clients',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'converted',
      header: 'Converted',
      align: 'center' as const,
      render: (value: number) => <span className="text-green-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'conversionRate',
      header: 'Conv. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'retained',
      header: 'Retained',
      align: 'center' as const,
      render: (value: number) => <span className="text-blue-600 font-semibold">{formatNumber(value)}</span>
    },
    {
      key: 'retentionRate',
      header: 'Ret. Rate',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}%</span>
    },
    {
      key: 'avgLTV',
      header: 'Avg LTV',
      align: 'right' as const,
      render: (value: number) => <span className="font-semibold">{formatCurrency(value)}</span>
    },
    {
      key: 'avgClassNo',
      header: 'Avg Classes',
      align: 'center' as const,
      render: (value: number) => <span className="font-semibold">{value.toFixed(1)}</span>
    }
  ];

  // Calculate totals for membership table
  const membershipTotals = {
    membershipType: 'TOTAL',
    totalClients: membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    converted: membershipStats.reduce((sum, stat) => sum + stat.converted, 0),
    conversionRate: 0,
    retained: membershipStats.reduce((sum, stat) => sum + stat.retained, 0),
    retentionRate: 0,
    avgLTV: membershipStats.reduce((sum, stat) => sum + stat.totalLTV, 0) / Math.max(membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1),
    avgConversionSpan: membershipStats.reduce((sum, stat) => sum + (stat.avgConversionSpan * stat.totalClients), 0) / Math.max(membershipStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1)
  };
  membershipTotals.conversionRate = membershipTotals.totalClients > 0 ? (membershipTotals.converted / membershipTotals.totalClients) * 100 : 0;
  membershipTotals.retentionRate = membershipTotals.totalClients > 0 ? (membershipTotals.retained / membershipTotals.totalClients) * 100 : 0;

  // Calculate totals for trainer table
  const trainerTotals = {
    trainerName: 'TOTAL',
    totalClients: trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0),
    converted: trainerStats.reduce((sum, stat) => sum + stat.converted, 0),
    conversionRate: 0,
    retained: trainerStats.reduce((sum, stat) => sum + stat.retained, 0),
    retentionRate: 0,
    avgLTV: trainerStats.reduce((sum, stat) => sum + stat.totalLTV, 0) / Math.max(trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1),
    avgClassNo: trainerStats.reduce((sum, stat) => sum + (stat.avgClassNo * stat.totalClients), 0) / Math.max(trainerStats.reduce((sum, stat) => sum + stat.totalClients, 0), 1)
  };
  trainerTotals.conversionRate = trainerTotals.totalClients > 0 ? (trainerTotals.converted / trainerTotals.totalClients) * 100 : 0;
  trainerTotals.retentionRate = trainerTotals.totalClients > 0 ? (trainerTotals.retained / trainerTotals.totalClients) * 100 : 0;

  return (
    <div className="space-y-8">
      {/* --- Summary Metric Cards --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-purple-100 to-indigo-100 rounded-lg p-4 flex flex-col items-center">
          <UserCheck className="w-6 h-6 text-purple-600 mb-2" />
          <div className="text-2xl font-bold">{totalClients}</div>
          <div className="text-xs text-purple-700">Total Clients</div>
        </div>
        <div className="bg-gradient-to-br from-green-100 to-teal-100 rounded-lg p-4 flex flex-col items-center">
          <TrendingUp className="w-6 h-6 text-green-600 mb-2" />
          <div className="text-2xl font-bold">{totalConverted}</div>
          <div className="text-xs text-green-700">Converted</div>
        </div>
        <div className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-lg p-4 flex flex-col items-center">
          <TrendingDown className="w-6 h-6 text-blue-600 mb-2" />
          <div className="text-2xl font-bold">{totalRetained}</div>
          <div className="text-xs text-blue-700">Retained</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-lg p-4 flex flex-col items-center">
          <BarChart3 className="w-6 h-6 text-yellow-600 mb-2" />
          <div className="text-2xl font-bold">{totalNew}</div>
          <div className="text-xs text-yellow-700">New Clients</div>
        </div>
      </div>

      {/* --- Hosted Class Month-on-Month Table --- */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-pink-600 to-orange-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Hosted Class Conversions (Month-on-Month)
            <Badge variant="secondary" className="bg-white/20 text-white">
              {hostedClassMoM.length} Months
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={hostedClassMoM}
            columns={[
              { key: 'month', header: 'Month', className: 'font-semibold min-w-[120px]' },
              { key: 'total', header: 'Total Hosted', align: 'center' },
              { key: 'newClients', header: 'New', align: 'center' },
              { key: 'converted', header: 'Converted', align: 'center' },
              { key: 'retained', header: 'Retained', align: 'center' },
            ]}
            headerGradient="from-pink-600 to-orange-600"
            showFooter={false}
            maxHeight="400px"
          />
        </CardContent>
      </Card>

      {/* --- Membership Performance Table --- */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Membership Type Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {membershipStats.length} Types
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={membershipStats.sort((a, b) => b.totalClients - a.totalClients)}
            columns={membershipColumns}
            headerGradient="from-purple-600 to-indigo-600"
            showFooter={true}
            footerData={membershipTotals}
            maxHeight="400px"
          />
        </CardContent>
      </Card>

      {/* --- Trainer Performance Table --- */}
      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-green-600 to-teal-600 text-white">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Trainer Performance Analysis
            <Badge variant="secondary" className="bg-white/20 text-white">
              {trainerStats.length} Trainers
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={trainerStats.sort((a, b) => b.conversionRate - a.conversionRate)}
            columns={trainerColumns}
            headerGradient="from-green-600 to-teal-600"
            showFooter={true}
            footerData={trainerTotals}
            maxHeight="400px"
          />
        </CardContent>
      </Card>
    </div>
  );
};
