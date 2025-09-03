
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, TrendingDown, Award, AlertTriangle, Eye, BarChart3, Users, Package, Tag, UserCheck } from 'lucide-react';
import { SalesData } from '@/types/dashboard';
import { formatCurrency, formatNumber } from '@/utils/formatters';
import { cn } from '@/lib/utils';

interface UnifiedTopBottomSellersProps {
  data: SalesData[];
  onRowClick?: (row: any) => void;
}

export const UnifiedTopBottomSellers: React.FC<UnifiedTopBottomSellersProps> = ({ data, onRowClick }) => {
  const [activeType, setActiveType] = useState('product');

  const getGroupedData = (type: 'product' | 'category' | 'member' | 'seller') => {
    const grouped = data.reduce((acc, item) => {
      let key = '';
      switch (type) {
        case 'product':
          key = item.cleanedProduct;
          break;
        case 'category':
          key = item.cleanedCategory;
          break;
        case 'member':
          key = item.customerName;
          break;
        case 'seller':
          key = item.soldBy;
          break;
      }
      
      if (!acc[key]) {
        acc[key] = {
          name: key,
          totalValue: 0,
          unitsSold: 0,
          transactions: 0,
          uniqueMembers: new Set(),
          atv: 0,
          auv: 0,
          asv: 0,
          upt: 0
        };
      }
      
      acc[key].totalValue += item.paymentValue;
      acc[key].unitsSold += 1; // Each sale item is one unit
      acc[key].transactions += 1;
      acc[key].uniqueMembers.add(item.memberId);
      
      return acc;
    }, {} as Record<string, any>);
    
    // Calculate metrics correctly
    Object.values(grouped).forEach((item: any) => {
      const uniqueMembersCount = item.uniqueMembers.size;
      item.uniqueMembers = uniqueMembersCount;
      item.atv = item.transactions > 0 ? item.totalValue / item.transactions : 0; // ATV = Revenue/Transactions
      item.auv = item.unitsSold > 0 ? item.totalValue / item.unitsSold : 0; // AUV = Revenue/Units
      item.asv = uniqueMembersCount > 0 ? item.totalValue / uniqueMembersCount : 0; // ASV = Revenue/Members
      item.upt = item.transactions > 0 ? item.unitsSold / item.transactions : 0; // UPT = Units/Transactions
    });
    
    return Object.values(grouped).sort((a: any, b: any) => b.totalValue - a.totalValue);
  };

  const getTypeConfig = (type: string) => {
    switch (type) {
      case 'product':
        return { icon: Package, label: 'Products', description: 'Individual product performance' };
      case 'category':
        return { icon: Tag, label: 'Categories', description: 'Category-wise performance' };
      case 'member':
        return { icon: Users, label: 'Members', description: 'Customer spending patterns' };
      case 'seller':
        return { icon: UserCheck, label: 'Associates', description: 'Sales representative performance' };
      default:
        return { icon: Package, label: 'Products', description: 'Performance data' };
    }
  };

  const renderSellerCard = (sellers: any[], isTop: boolean, type: string) => {
    const config = getTypeConfig(type);
    const IconComponent = config.icon;
    // Totals row
    const totals = sellers.reduce(
      (acc, s) => {
        acc.totalValue += s.totalValue;
        acc.unitsSold += s.unitsSold;
        acc.transactions += s.transactions;
        acc.uniqueMembers += s.uniqueMembers;
        return acc;
      },
      { totalValue: 0, unitsSold: 0, transactions: 0, uniqueMembers: 0 }
    );
    return (
      <Card className={cn(
        "border-0 shadow-2xl transition-all duration-500",
        isTop
          ? "bg-gradient-to-br from-gray-900 via-yellow-900/60 to-orange-900/80"
          : "bg-gradient-to-br from-gray-900 via-red-900/60 to-rose-900/80"
      )}>
        <CardHeader className="pb-4 sticky top-0 z-30 bg-gradient-to-r from-yellow-700 to-orange-900 rounded-t-2xl shadow-md flex items-center gap-3">
          <CardTitle className="flex items-center gap-3 text-xl text-white animate-pulse">
            {isTop ? (
              <Award className="w-7 h-7 animate-bounce text-yellow-300" />
            ) : (
              <AlertTriangle className="w-7 h-7 animate-bounce text-rose-300" />
            )}
            <span className="font-bold tracking-wide">
              {isTop ? `Top 5 ${config.label}` : `Bottom 5 ${config.label}`}
            </span>
            <span className="ml-2 text-xs font-normal text-yellow-100/80">{config.description}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto rounded-lg">
            <table className="min-w-full bg-transparent border-t border-yellow-900 rounded-lg">
              <thead className="bg-gradient-to-r from-yellow-700 to-orange-900 text-yellow-100 font-semibold text-sm uppercase tracking-wider sticky top-0 z-20">
                <tr>
                  <th className="px-4 py-2 sticky left-0 bg-gradient-to-r from-yellow-700 to-orange-900 z-30 text-left rounded-tl-lg">#</th>
                  <th className="px-4 py-2 text-left">{config.label.slice(0, -1)} Name</th>
                  <th className="px-4 py-2 text-center">Txns</th>
                  <th className="px-4 py-2 text-center">Units</th>
                  <th className="px-4 py-2 text-center">Customers</th>
                  <th className="px-4 py-2 text-center">ATV</th>
                  <th className="px-4 py-2 text-center">AUV</th>
                  <th className="px-4 py-2 text-center">ASV</th>
                  <th className="px-4 py-2 text-center">UPT</th>
                  <th className="px-4 py-2 text-right">Revenue</th>
                  <th className="px-4 py-2 text-center">Details</th>
                </tr>
              </thead>
              <tbody>
                {sellers.map((seller, index) => (
                  <tr key={seller.name} className="hover:bg-yellow-900/30 cursor-pointer border-b border-yellow-800 transition-colors duration-200 group">
                    <td className="px-4 py-2 sticky left-0 bg-gradient-to-r from-yellow-700 to-orange-900 z-10 text-yellow-100 font-bold">{index + 1}</td>
                    <td className="px-4 py-2 text-yellow-50 font-semibold whitespace-normal break-words max-w-48">{seller.name}</td>
                    <td className="px-4 py-2 text-center">{formatNumber(seller.transactions)}</td>
                    <td className="px-4 py-2 text-center">{formatNumber(seller.unitsSold)}</td>
                    <td className="px-4 py-2 text-center">{formatNumber(seller.uniqueMembers)}</td>
                    <td className="px-4 py-2 text-center">{formatCurrency(seller.atv)}</td>
                    <td className="px-4 py-2 text-center">{formatCurrency(seller.auv)}</td>
                    <td className="px-4 py-2 text-center">{formatCurrency(seller.asv)}</td>
                    <td className="px-4 py-2 text-center">{seller.upt.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right font-bold">{formatCurrency(seller.totalValue)}</td>
                    <td className="px-4 py-2 text-center">
                      <Button variant="ghost" size="sm" className="opacity-80 hover:opacity-100 transition-opacity text-yellow-200 hover:text-white" onClick={e => {
                        e.stopPropagation();
                        // Drill down: show all sales for this seller
                        const filtered = data.filter(item => {
                          switch (type) {
                            case 'product': return item.cleanedProduct === seller.name;
                            case 'category': return item.cleanedCategory === seller.name;
                            case 'member': return item.customerName === seller.name;
                            case 'seller': return item.soldBy === seller.name;
                            default: return false;
                          }
                        });
                        onRowClick?.({ ...seller, rawData: filtered, type });
                      }}>
                        <Eye className="w-3 h-3 mr-1" />
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
                {/* Totals Row */}
                <tr className="bg-gradient-to-r from-yellow-900 to-orange-900 text-yellow-100 font-bold">
                  <td className="px-4 py-2 sticky left-0 bg-gradient-to-r from-yellow-900 to-orange-900 z-10">TOTAL</td>
                  <td className="px-4 py-2"></td>
                  <td className="px-4 py-2 text-center">{formatNumber(totals.transactions)}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(totals.unitsSold)}</td>
                  <td className="px-4 py-2 text-center">{formatNumber(totals.uniqueMembers)}</td>
                  <td className="px-4 py-2 text-center"></td>
                  <td className="px-4 py-2 text-center"></td>
                  <td className="px-4 py-2 text-center"></td>
                  <td className="px-4 py-2 text-center"></td>
                  <td className="px-4 py-2 text-right">{formatCurrency(totals.totalValue)}</td>
                  <td className="px-4 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-900 to-orange-900 rounded-lg border border-yellow-800/40">
            <h4 className="font-semibold text-yellow-100 mb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 animate-pulse" />
              Performance Summary
            </h4>
            <ul className="text-sm text-yellow-200 space-y-1">
              <li>• Average revenue: {formatCurrency(sellers.reduce((sum, s) => sum + s.totalValue, 0) / sellers.length)}</li>
              <li>• Total transactions: {formatNumber(sellers.reduce((sum, s) => sum + s.transactions, 0))}</li>
              <li>• Combined customer reach: {formatNumber(sellers.reduce((sum, s) => sum + s.uniqueMembers, 0))} unique customers</li>
              <li>• Performance spread: {((sellers[0]?.totalValue / sellers[sellers.length - 1]?.totalValue || 1) - 1).toFixed(1)}x variance</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  };

  const groupedData = getGroupedData(activeType as 'product' | 'category' | 'member' | 'seller');
  const topSellers = groupedData.slice(0, 5);
  const bottomSellers = groupedData.slice(-5).reverse();

  return (
    <div className="space-y-6">
      {/* Enhanced Tab Navigation */}
      <Card className="bg-gradient-to-br from-white via-slate-50/20 to-white border-0 shadow-xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-slate-700 via-slate-800 to-slate-900 bg-clip-text text-transparent">
            Performance Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeType} onValueChange={setActiveType} className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 p-2 rounded-2xl shadow-lg border border-slate-200/30">
              <TabsTrigger 
                value="product" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <Package className="w-4 h-4 mr-2" />
                Products
              </TabsTrigger>
              <TabsTrigger 
                value="category" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <Tag className="w-4 h-4 mr-2" />
                Categories
              </TabsTrigger>
              <TabsTrigger 
                value="member" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>
              <TabsTrigger 
                value="seller" 
                className="text-sm font-bold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Associates
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeType} className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {renderSellerCard(topSellers, true, activeType)}
                {renderSellerCard(bottomSellers, false, activeType)}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
