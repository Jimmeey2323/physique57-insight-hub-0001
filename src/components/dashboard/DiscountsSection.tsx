
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Target, TrendingUp, Calendar, MapPin, User, DollarSign, Tag } from 'lucide-react';
import { useSalesData } from '@/hooks/useSalesData';
import { usePayrollData } from '@/hooks/usePayrollData';
import { formatCurrency, formatNumber, formatPercentage } from '@/utils/formatters';

interface DiscountAnalysisData {
  date: string;
  location: string;
  itemsSold: number;
  mrpPreTax: number;
  discountPercentage: number;
  mrpPostTax: number;
  tax: number;
  totalRevenue: number;
}

const DiscountsSection = () => {
  const { data: salesData, loading, error } = useSalesData();
  const { data: payrollData } = usePayrollData();

  // Transform SalesData to DiscountAnalysisData format and compute metrics
  const discountData = useMemo(() => {
    if (!salesData) return [];
    return salesData.map(item => ({
      date: item.paymentDate || '',
      location: item.calculatedLocation || 'Unknown',
      itemsSold: 1,
      mrpPreTax: item.mrpPreTax || item.paymentValue || 0,
  discountPercentage: item.discountPercentage || 0,
  mrpPostTax: item.mrpPostTax || item.paymentValue || 0,
  tax: item.paymentVAT || 0,
  totalRevenue: item.paymentValue || 0,
  product: item.cleanedProduct || '',
  category: item.cleanedCategory || '',
  member: item.customerName || '',
  discountAmount: item.discountAmount || 0,
  paymentMethod: item.paymentMethod || '',
    }));
  }, [salesData]);

  // Metric cards
  const totalDiscount = discountData.reduce((sum, d) => sum + (d.discountAmount || 0), 0);
  const avgDiscountPct = discountData.length ? discountData.reduce((sum, d) => sum + (d.discountPercentage || 0), 0) / discountData.length : 0;
  const totalRevenue = discountData.reduce((sum, d) => sum + (d.totalRevenue || 0), 0);
  const totalItems = discountData.length;
  const topDiscountedProducts = [...discountData].sort((a, b) => b.discountAmount - a.discountAmount).slice(0, 5);
  const topDiscountedCategories = [...discountData].sort((a, b) => b.discountAmount - a.discountAmount).slice(0, 5);

  const discountColumns: Array<{
    key: keyof DiscountAnalysisData;
    header: string;
    align?: 'left' | 'center' | 'right';
    render?: (value: any, item: any) => React.ReactNode;
  }> = [
    {
      key: 'date',
      header: 'Date',
      align: 'left',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <Badge className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 font-semibold">
            {value}
          </Badge>
        </div>
      )
    },
    {
      key: 'location',
      header: 'Location',
      align: 'left',
      render: (value: string) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-500" />
          <Badge className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 font-semibold">
            {value}
          </Badge>
        </div>
      )
    },
    {
      key: 'itemsSold',
      header: 'Items Sold',
      align: 'center',
      render: (value: number) => (
        <Badge className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 font-bold">
          {formatNumber(value)}
        </Badge>
      )
    },
    {
      key: 'mrpPreTax',
      header: 'MRP Pre-Tax',
      align: 'right',
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold">
            {formatCurrency(value)}
          </Badge>
        </div>
      )
    },
    {
      key: 'discountPercentage',
      header: 'Discount %',
      align: 'center',
      render: (value: number) => (
        <Badge className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 font-semibold">
          {formatPercentage(value)}
        </Badge>
      )
    },
    {
      key: 'mrpPostTax',
      header: 'MRP Post-Tax',
      align: 'right',
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold">
            {formatCurrency(value)}
          </Badge>
        </div>
      )
    },
    {
      key: 'tax',
      header: 'Tax',
      align: 'right',
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold">
            {formatCurrency(value)}
          </Badge>
        </div>
      )
    },
    {
      key: 'totalRevenue',
      header: 'Total Revenue',
      align: 'right',
      render: (value: number) => (
        <div className="flex items-center justify-end gap-1">
          <DollarSign className="w-4 h-4 text-green-600" />
          <Badge className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold">
            {formatCurrency(value)}
          </Badge>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-100 to-yellow-200 shadow-md border-0">
          <CardContent className="flex flex-col items-center p-4">
            <TrendingUp className="w-6 h-6 text-orange-600 mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(totalDiscount)}</div>
            <div className="text-xs text-orange-700">Total Discount Given</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-100 to-green-200 shadow-md border-0">
          <CardContent className="flex flex-col items-center p-4">
            <Badge className="bg-gradient-to-r from-yellow-400 to-green-400 text-white mb-2">%</Badge>
            <div className="text-2xl font-bold">{avgDiscountPct.toFixed(2)}%</div>
            <div className="text-xs text-green-700">Avg. Discount %</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-100 to-blue-200 shadow-md border-0">
          <CardContent className="flex flex-col items-center p-4">
            <DollarSign className="w-6 h-6 text-green-600 mb-2" />
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <div className="text-xs text-green-700">Total Revenue</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-100 to-purple-200 shadow-md border-0">
          <CardContent className="flex flex-col items-center p-4">
            <Users className="w-6 h-6 text-blue-600 mb-2" />
            <div className="text-2xl font-bold">{formatNumber(totalItems)}</div>
            <div className="text-xs text-blue-700">Total Discounted Sales</div>
          </CardContent>
        </Card>
      </div>

      {/* Discount % Over Time Chart */}
      <Card className="bg-gradient-to-br from-orange-50 to-green-50 shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Discount % Over Time
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={discountData.slice(0, 30)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" fontSize={10} angle={-45} textAnchor="end" height={50} />
              <YAxis fontSize={12} />
              <Tooltip />
              <Bar dataKey="discountPercentage" fill="#f59e42" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Discounted Products Table */}
      <Card className="bg-gradient-to-br from-pink-100 to-orange-200 shadow-md border-0">
        <CardHeader className="bg-gradient-to-r from-pink-500 to-orange-500 text-white rounded-t-xl">
          <CardTitle className="flex items-center gap-2">
            <Tag className="w-5 h-5" />
            Top Discounted Products
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={topDiscountedProducts}
            columns={[
              { key: 'product', header: 'Product', className: 'font-semibold min-w-[120px]' },
              { key: 'discountAmount', header: 'Discount Amount', align: 'right', render: (v: number) => formatCurrency(v) },
              { key: 'discountPercentage', header: 'Discount %', align: 'center', render: (v: number) => `${v.toFixed(2)}%` },
              { key: 'totalRevenue', header: 'Revenue', align: 'right', render: (v: number) => formatCurrency(v) },
            ]}
            headerGradient="from-pink-500 to-orange-500"
            showFooter={false}
            maxHeight="300px"
            onRowClick={row => {
              // Drill down: show all sales for this product
              const filtered = discountData.filter(d => d.product === row.product);
              // Show modal or analytics (implement modal as needed)
              alert(`Drill Down: ${row.product}\nCount: ${filtered.length}`);
            }}
          />
        </CardContent>
      </Card>

      {/* Main Discount Table */}
      <Card className="bg-white shadow-xl border-0 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-50 via-yellow-50 to-green-50 border-b border-gray-200">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            Discount Analysis
            <Badge className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-semibold">
              {discountData.length} records
            </Badge>
          </CardTitle>
          <p className="text-sm text-gray-600 mt-2">
            Analysis of discounts applied and their impact on revenue
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <ModernDataTable
            data={discountData}
            columns={discountColumns}
            maxHeight="500px"
            headerGradient="from-orange-500 to-green-500"
            onRowClick={row => {
              // Drill down: show all sales for this row's product
              const filtered = discountData.filter(d => d.product === row.product && d.date === row.date);
              alert(`Drill Down: ${row.product} on ${row.date}\nCount: ${filtered.length}`);
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default DiscountsSection;
