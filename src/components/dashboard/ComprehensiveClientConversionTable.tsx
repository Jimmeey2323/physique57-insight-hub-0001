import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  Search, 
  Download, 
  Filter,
  Eye,
  MapPin,
  Calendar,
  DollarSign,
  Target,
  TrendingUp,
  UserCheck,
  Clock,
  BarChart3,
  Percent,
  Activity
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage, formatDate } from '@/utils/formatters';
import { NewClientData } from '@/types/dashboard';

interface ComprehensiveClientConversionTableProps {
  data: NewClientData[];
  onItemClick?: (item: NewClientData) => void;
}

export const ComprehensiveClientConversionTable: React.FC<ComprehensiveClientConversionTableProps> = ({
  data,
  onItemClick
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('firstVisitDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter(client => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      return (
        fullName.includes(searchLower) ||
        client.trainerName?.toLowerCase().includes(searchLower) ||
        client.firstVisitLocation?.toLowerCase().includes(searchLower) ||
        client.membershipUsed?.toLowerCase().includes(searchLower) ||
        client.conversionStatus?.toLowerCase().includes(searchLower) ||
        client.retentionStatus?.toLowerCase().includes(searchLower) ||
        client.paymentMethod?.toLowerCase().includes(searchLower)
      );
    });

    // Sort data
    filtered.sort((a, b) => {
      let aValue = a[sortField as keyof NewClientData];
      let bValue = b[sortField as keyof NewClientData];
      
      if (typeof aValue === 'string') aValue = aValue?.toLowerCase() || '';
      if (typeof bValue === 'string') bValue = bValue?.toLowerCase() || '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getConversionStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('converted')) {
      return <Badge className="bg-green-100 text-green-800 border-green-200">✓ Converted</Badge>;
    } else if (statusLower.includes('pending')) {
      return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">⏳ Pending</Badge>;
    } else {
      return <Badge className="bg-red-100 text-red-800 border-red-200">✗ Not Converted</Badge>;
    }
  };

  const getRetentionStatusBadge = (status: string) => {
    const statusLower = status?.toLowerCase() || '';
    if (statusLower.includes('retained')) {
      return <Badge className="bg-blue-100 text-blue-800 border-blue-200">🔄 Retained</Badge>;
    } else if (statusLower.includes('risk')) {
      return <Badge className="bg-orange-100 text-orange-800 border-orange-200">⚠️ At Risk</Badge>;
    } else {
      return <Badge className="bg-gray-100 text-gray-800 border-gray-200">❌ Not Retained</Badge>;
    }
  };

  const getLTVBadge = (ltv: number) => {
    if (ltv >= 100000) return <Badge className="bg-emerald-100 text-emerald-800">💎 Premium</Badge>;
    if (ltv >= 50000) return <Badge className="bg-blue-100 text-blue-800">🌟 High Value</Badge>;
    if (ltv >= 20000) return <Badge className="bg-yellow-100 text-yellow-800">⭐ Medium</Badge>;
    if (ltv >= 5000) return <Badge className="bg-orange-100 text-orange-800">📈 Standard</Badge>;
    return <Badge className="bg-gray-100 text-gray-800">🔹 Low</Badge>;
  };

  const columns = [
    {
      key: 'clientDetails',
      header: 'Client Information',
      render: (value: any, item: NewClientData) => (
        <div className="space-y-2 min-w-[220px]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {item.firstName ? item.firstName[0] : '?'}{item.lastName ? item.lastName[0] : '?'}
            </div>
            <div>
              <div className="font-semibold text-slate-900">
                {`${item.firstName || ''} ${item.lastName || ''}`.trim() || 'Unknown Client'}
              </div>
              <div className="text-xs text-slate-500">
                Client Profile
              </div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Calendar className="w-3 h-3" />
              First Visit: {formatDate(item.firstVisitDate)}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <MapPin className="w-3 h-3" />
              {item.firstVisitLocation || 'Unknown location'}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Users className="w-3 h-3" />
              {item.isNew || 'Unknown status'}
            </div>
          </div>
        </div>
      ),
      className: 'min-w-[220px]',
      sortable: true
    },
    {
      key: 'trainerName',
      header: 'Trainer & Service',
      render: (value: string, item: NewClientData) => (
        <div className="space-y-2 min-w-[180px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {value ? value.split(' ').map(n => n[0]).join('').slice(0, 2) : 'UK'}
            </div>
            <div>
              <div className="font-medium text-slate-800">{value || 'Unassigned'}</div>
              <div className="text-xs text-slate-500">Primary Trainer</div>
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium text-slate-700">
              {item.membershipUsed || 'No membership'}
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <Target className="w-3 h-3" />
              {item.paymentMethod || 'Unknown payment'}
            </div>
          </div>
        </div>
      ),
      className: 'min-w-[180px]',
      sortable: true
    },
    {
      key: 'conversionMetrics',
      header: 'Conversion Journey',
      render: (value: any, item: NewClientData) => (
        <div className="text-center space-y-2 min-w-[160px]">
          <div className="space-y-1">
            {getConversionStatusBadge(item.conversionStatus)}
            {getRetentionStatusBadge(item.retentionStatus)}
          </div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Visits post-trial:</span>
              <Badge variant="outline" className="text-xs">
                {item.visitsPostTrial || 0}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Conversion span:</span>
              <Badge variant="outline" className="text-xs">
                {item.conversionSpan || 0} days
              </Badge>
            </div>
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'ltv',
      header: 'Financial Value',
      render: (value: number, item: NewClientData) => (
        <div className="text-center space-y-2 min-w-[140px]">
          <div className="space-y-1">
            <div className="text-xl font-bold text-emerald-600">
              {formatCurrency(value || 0)}
            </div>
            <div className="text-xs text-slate-500">Lifetime Value</div>
          </div>
          {getLTVBadge(value || 0)}
          <div className="text-xs text-slate-500 space-y-1">
            <div>Avg per visit: {formatCurrency((value || 0) / Math.max(1, item.visitsPostTrial || 1))}</div>
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'activityMetrics',
      header: 'Activity & Engagement',
      render: (value: any, item: NewClientData) => (
        <div className="text-center space-y-2 min-w-[150px]">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex flex-col items-center p-2 bg-blue-50 rounded">
              <Activity className="w-4 h-4 text-blue-600 mb-1" />
              <span className="font-bold text-blue-800">{item.visitsPostTrial || 0}</span>
              <span className="text-blue-600">Visits</span>
            </div>
            <div className="flex flex-col items-center p-2 bg-green-50 rounded">
              <Clock className="w-4 h-4 text-green-600 mb-1" />
              <span className="font-bold text-green-800">{item.conversionSpan || 0}</span>
              <span className="text-green-600">Days</span>
            </div>
          </div>
          <div className="text-xs text-slate-500">
            Engagement Score: {item.visitsPostTrial && item.conversionSpan 
              ? formatNumber((item.visitsPostTrial / Math.max(1, item.conversionSpan)) * 100)
              : '0'
            }%
          </div>
        </div>
      ),
      align: 'center' as const,
      sortable: true
    },
    {
      key: 'locationInfo',
      header: 'Location Details',
      render: (value: any, item: NewClientData) => (
        <div className="space-y-2 min-w-[140px]">
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <MapPin className="w-3 h-3 text-blue-600" />
              <span className="font-medium">First Visit:</span>
            </div>
            <div className="text-xs text-slate-600 ml-4">
              {item.firstVisitLocation || 'Unknown'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1 text-sm">
              <Users className="w-3 h-3 text-green-600" />
              <span className="font-medium">Home:</span>
            </div>
            <div className="text-xs text-slate-600 ml-4">
              {item.homeLocation || 'Not specified'}
            </div>
          </div>
        </div>
      ),
      className: 'min-w-[140px]',
      sortable: true
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (value: any, item: NewClientData) => (
        <div className="flex flex-col gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onItemClick?.(item)}
            className="gap-1 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <BarChart3 className="w-4 h-4" />
            Analytics
          </Button>
        </div>
      ),
      align: 'center' as const
    }
  ];

  const summaryStats = useMemo(() => {
    const converted = filteredAndSortedData.filter(c => c.conversionStatus?.toLowerCase().includes('converted')).length;
    const retained = filteredAndSortedData.filter(c => c.retentionStatus?.toLowerCase().includes('retained')).length;
    
    return {
      totalClients: filteredAndSortedData.length,
      conversionRate: filteredAndSortedData.length > 0 ? (converted / filteredAndSortedData.length) * 100 : 0,
      retentionRate: filteredAndSortedData.length > 0 ? (retained / filteredAndSortedData.length) * 100 : 0,
      avgLTV: filteredAndSortedData.reduce((sum, client) => sum + (client.ltv || 0), 0) / filteredAndSortedData.length,
      totalRevenue: filteredAndSortedData.reduce((sum, client) => sum + (client.ltv || 0), 0),
      avgVisitsPostTrial: filteredAndSortedData.reduce((sum, client) => sum + (client.visitsPostTrial || 0), 0) / filteredAndSortedData.length,
      avgConversionSpan: filteredAndSortedData.reduce((sum, client) => sum + (client.conversionSpan || 0), 0) / filteredAndSortedData.length,
      uniqueTrainers: new Set(filteredAndSortedData.map(client => client.trainerName)).size
    };
  }, [filteredAndSortedData]);

  return (
    <Card className="bg-white shadow-xl border-0 overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <Users className="w-6 h-6" />
            Comprehensive Client Conversion Analysis
            <Badge className="bg-white/20 text-white border-white/30">
              {filteredAndSortedData.length} clients
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="bg-white/10 border-white/30 text-white hover:bg-white/20">
              <Download className="w-4 h-4 mr-1" />
              Export Data
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Comprehensive Summary Statistics */}
      <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 border-b border-slate-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-800">{formatNumber(summaryStats.totalClients)}</div>
            <div className="text-sm text-purple-600">Total Clients</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{formatPercentage(summaryStats.conversionRate)}</div>
            <div className="text-sm text-green-600">Conversion Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{formatPercentage(summaryStats.retentionRate)}</div>
            <div className="text-sm text-blue-600">Retention Rate</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-600">{formatCurrency(summaryStats.avgLTV)}</div>
            <div className="text-sm text-emerald-600">Avg LTV</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{formatCurrency(summaryStats.totalRevenue)}</div>
            <div className="text-sm text-indigo-600">Total Revenue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{formatNumber(summaryStats.avgVisitsPostTrial)}</div>
            <div className="text-sm text-orange-600">Avg Visits</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-pink-600">{formatNumber(summaryStats.avgConversionSpan)}</div>
            <div className="text-sm text-pink-600">Avg Days</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-teal-600">{formatNumber(summaryStats.uniqueTrainers)}</div>
            <div className="text-sm text-teal-600">Trainers</div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filters */}
      <div className="p-6 border-b border-slate-200 bg-slate-50">
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
            <Input
              placeholder="Search clients, trainers, locations, status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>
          <Badge variant="outline" className="text-slate-600">
            <Filter className="w-3 h-3 mr-1" />
            {filteredAndSortedData.length} of {data.length} clients
          </Badge>
          <Badge variant="outline" className="text-green-600">
            <TrendingUp className="w-3 h-3 mr-1" />
            {formatPercentage(summaryStats.conversionRate)} converted
          </Badge>
        </div>
      </div>

      <CardContent className="p-0">
        <ModernDataTable
          data={filteredAndSortedData}
          columns={columns}
          maxHeight="700px"
          stickyHeader={true}
          onSort={handleSort}
          sortField={sortField}
          sortDirection={sortDirection}
        />
      </CardContent>
    </Card>
  );
};