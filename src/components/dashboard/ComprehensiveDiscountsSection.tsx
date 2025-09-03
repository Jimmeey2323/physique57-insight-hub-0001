import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingDown, 
  DollarSign, 
  Percent, 
  Package, 
  Users, 
  Calendar,
  MapPin,
  User,
  ShoppingCart,
  CreditCard,
  Eye
} from 'lucide-react';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';
import { SalesData } from '@/types/dashboard';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';

interface ComprehensiveDiscountsSectionProps {
  data: SalesData[];
  filters?: any;
  onDrillDown?: (title: string, data: any[]) => void;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export const ComprehensiveDiscountsSection: React.FC<ComprehensiveDiscountsSectionProps> = ({
  data,
  filters,
  onDrillDown
}) => {
  const [selectedView, setSelectedView] = useState<'overview' | 'details' | 'analytics'>('overview');

  // Process discount data
  const discountAnalysis = useMemo(() => {
    if (!data || data.length === 0) return {
      totalTransactions: 0,
      discountedTransactions: 0,
      totalRevenue: 0,
      totalDiscounts: 0,
      avgDiscountPercent: 0,
      topDiscountedProducts: [],
      monthlyTrends: [],
      locationBreakdown: []
    };

    const discountedItems = data.filter(item => (item.discountAmount || 0) > 0);
    
    const totalTransactions = data.length;
    const discountedTransactions = discountedItems.length;
    const totalRevenue = data.reduce((sum, item) => sum + (item.paymentValue || 0), 0);
    const totalDiscounts = data.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    
    const avgDiscountPercent = discountedItems.length > 0 
      ? discountedItems.reduce((sum, item) => sum + (item.discountPercentage || 0), 0) / discountedItems.length 
      : 0;

    // Top discounted products
    const productDiscounts = data.reduce((acc, item) => {
      const product = item.cleanedProduct || 'Unknown';
      if (!acc[product]) {
        acc[product] = { 
          name: product, 
          totalDiscount: 0, 
          transactions: 0,
          revenue: 0
        };
      }
      acc[product].totalDiscount += item.discountAmount || 0;
      acc[product].transactions += 1;
      acc[product].revenue += item.paymentValue || 0;
      return acc;
    }, {} as Record<string, any>);

    const topDiscountedProducts = Object.values(productDiscounts)
      .sort((a: any, b: any) => b.totalDiscount - a.totalDiscount)
      .slice(0, 10);

    // Monthly trends
    const monthlyData = data.reduce((acc, item) => {
      if (!item.paymentDate) return acc;
      
      let month;
      if (item.paymentDate.includes('/')) {
        const [day, monthNum, year] = item.paymentDate.split(' ')[0].split('/');
        month = `${year}-${monthNum.padStart(2, '0')}`;
      } else {
        month = item.paymentDate.substring(0, 7);
      }
      
      if (!acc[month]) {
        acc[month] = { 
          month, 
          revenue: 0, 
          discounts: 0, 
          transactions: 0,
          discountedTransactions: 0
        };
      }
      acc[month].revenue += item.paymentValue || 0;
      acc[month].discounts += item.discountAmount || 0;
      acc[month].transactions += 1;
      if ((item.discountAmount || 0) > 0) {
        acc[month].discountedTransactions += 1;
      }
      return acc;
    }, {} as Record<string, any>);

    const monthlyTrends = Object.values(monthlyData).sort((a: any, b: any) => 
      a.month.localeCompare(b.month)
    );

    // Location breakdown
    const locationData = data.reduce((acc, item) => {
      const location = item.calculatedLocation || 'Unknown';
      if (!acc[location]) {
        acc[location] = { 
          location, 
          revenue: 0, 
          discounts: 0, 
          transactions: 0 
        };
      }
      acc[location].revenue += item.paymentValue || 0;
      acc[location].discounts += item.discountAmount || 0;
      acc[location].transactions += 1;
      return acc;
    }, {} as Record<string, any>);

    const locationBreakdown = Object.values(locationData);

    return {
      totalTransactions,
      discountedTransactions,
      totalRevenue,
      totalDiscounts,
      avgDiscountPercent,
      topDiscountedProducts,
      monthlyTrends,
      locationBreakdown
    };
  }, [data]);

  // Metric Cards
  const metricCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(discountAnalysis.totalRevenue),
      icon: DollarSign,
      gradient: 'from-green-500 to-emerald-600',
      description: 'Total sales revenue'
    },
    {
      title: 'Total Discounts',
      value: formatCurrency(discountAnalysis.totalDiscounts),
      icon: TrendingDown,
      gradient: 'from-red-500 to-rose-600',
      description: 'Amount saved by customers'
    },
    {
      title: 'Discount Rate',
      value: formatPercentage(discountAnalysis.totalDiscounts / discountAnalysis.totalRevenue * 100),
      icon: Percent,
      gradient: 'from-blue-500 to-indigo-600',
      description: 'Discount as % of revenue'
    },
    {
      title: 'Discounted Sales',
      value: `${formatNumber(discountAnalysis.discountedTransactions)} / ${formatNumber(discountAnalysis.totalTransactions)}`,
      icon: ShoppingCart,
      gradient: 'from-purple-500 to-violet-600',
      description: 'Sales with discounts applied'
    },
    {
      title: 'Avg Discount %',
      value: formatPercentage(discountAnalysis.avgDiscountPercent),
      icon: Package,
      gradient: 'from-orange-500 to-red-600',
      description: 'Average discount percentage'
    },
    {
      title: 'Penetration Rate',
      value: formatPercentage(discountAnalysis.discountedTransactions / discountAnalysis.totalTransactions * 100),
      icon: Users,
      gradient: 'from-cyan-500 to-blue-600',
      description: 'Percentage of discounted sales'
    }
  ];

  // Table columns for detailed view
  const detailColumns = [
    {
      key: 'paymentDate' as keyof SalesData,
      header: 'Date',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="font-medium">{value}</span>
        </div>
      )
    },
    {
      key: 'cleanedProduct' as keyof SalesData,
      header: 'Product',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-500" />
          <Badge variant="outline" className="font-medium">
            {value || 'Unknown'}
          </Badge>
        </div>
      )
    },
    {
      key: 'calculatedLocation' as keyof SalesData,
      header: 'Location',
      render: (value: any) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">{value}</span>
        </div>
      )
    },
    {
      key: 'paymentValue' as keyof SalesData,
      header: 'Revenue',
      align: 'right' as const,
      render: (value: any) => (
        <Badge className="bg-green-100 text-green-800 font-bold">
          {formatCurrency(value || 0)}
        </Badge>
      )
    },
    {
      key: 'discountAmount' as keyof SalesData,
      header: 'Discount',
      align: 'right' as const,
      render: (value: any) => (
        <Badge className="bg-red-100 text-red-800 font-bold">
          {formatCurrency(value || 0)}
        </Badge>
      )
    },
    {
      key: 'discountPercentage' as keyof SalesData,
      header: 'Discount %',
      align: 'center' as const,
      render: (value: any) => (
        <Badge className="bg-blue-100 text-blue-800 font-bold">
          {formatPercentage(value || 0)}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header with View Tabs */}
      <Card className="border-0 shadow-xl bg-gradient-to-r from-orange-50 to-red-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <Percent className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Discounts & Promotions Analytics
                </CardTitle>
                <p className="text-gray-600">Comprehensive discount impact analysis</p>
              </div>
            </div>
            <div className="flex gap-2">
              {(['overview', 'details', 'analytics'] as const).map((view) => (
                <Button
                  key={view}
                  variant={selectedView === view ? 'default' : 'outline'}
                  onClick={() => setSelectedView(view)}
                  className="capitalize"
                >
                  {view}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {metricCards.map((metric, index) => (
          <Card 
            key={metric.title} 
            className="bg-white shadow-xl border-0 overflow-hidden hover:shadow-2xl transition-all duration-300 group cursor-pointer"
            onClick={() => onDrillDown?.(metric.title, data)}
          >
            <CardContent className="p-0">
              <div className={`bg-gradient-to-r ${metric.gradient} p-6 text-white relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 opacity-20">
                  <metric.icon className="w-20 h-20" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <metric.icon className="w-6 h-6" />
                    <h3 className="font-semibold text-sm">{metric.title}</h3>
                  </div>
                  <p className="text-3xl font-bold mb-1">{metric.value}</p>
                  <p className="text-sm opacity-90">{metric.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content based on selected view */}
      {selectedView === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Trends Chart */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-blue-600" />
                Monthly Discount Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={discountAnalysis.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value: any, name: string) => [
                    name === 'discounts' ? formatCurrency(value) : formatNumber(value),
                    name
                  ]} />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                  <Line type="monotone" dataKey="discounts" stroke="#82ca9d" name="Discounts" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top Discounted Products */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                Top Discounted Products
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {discountAnalysis.topDiscountedProducts.slice(0, 5).map((product: any, index) => (
                  <div 
                    key={product.name}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    onClick={() => onDrillDown?.(product.name, data.filter(item => item.cleanedProduct === product.name))}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-[200px]">{product.name}</p>
                        <p className="text-sm text-gray-600">{formatNumber(product.transactions)} sales</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{formatCurrency(product.totalDiscount)}</p>
                      <p className="text-sm text-gray-600">{formatCurrency(product.revenue)} revenue</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedView === 'details' && (
        <Card className="bg-white shadow-xl border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-600" />
              Detailed Discount Transactions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ModernDataTable
              data={data.filter(item => (item.discountAmount || 0) > 0)}
              columns={detailColumns}
              maxHeight="600px"
            />
          </CardContent>
        </Card>
      )}

      {selectedView === 'analytics' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Location Performance */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-purple-600" />
                Location Discount Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={discountAnalysis.locationBreakdown}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="location" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Bar dataKey="discounts" fill="#8884d8" name="Discounts" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Discount Distribution */}
          <Card className="bg-white shadow-xl border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-orange-600" />
                Discount Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={discountAnalysis.topDiscountedProducts.slice(0, 6)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name.substring(0, 10)}... ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="totalDiscount"
                  >
                    {discountAnalysis.topDiscountedProducts.slice(0, 6).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};