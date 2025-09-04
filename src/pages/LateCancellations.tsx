import React, { useState, useMemo } from 'react';
import { useLateCancellationsData } from '@/hooks/useLateCancellationsData';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Loader2 } from 'lucide-react';
import { LateCancellationsMetricCards } from '@/components/dashboard/LateCancellationsMetricCards';
import { LateCancellationsFilterSection } from '@/components/dashboard/LateCancellationsFilterSection';
import { LateCancellationsCharts } from '@/components/dashboard/LateCancellationsCharts';

const tableConfigs = [
  {
    key: 'byLocation',
    label: 'By Location',
    columns: [
      { key: 'Location', header: 'Location' },
      // months will be dynamically added
    ],
  },
  {
    key: 'byClass',
    label: 'By Class',
    columns: [
      { key: 'Location', header: 'Location' },
      { key: 'Cleaned Class', header: 'Class' },
      // months...
    ],
  },
  {
    key: 'byTrainer',
    label: 'By Trainer',
    columns: [
      { key: 'Location', header: 'Location' },
      { key: 'Trainer Name', header: 'Trainer' },
      // months...
    ],
  },
  {
    key: 'byProduct',
    label: 'By Product',
    columns: [
      { key: 'Location', header: 'Location' },
      { key: 'Cleaned Product', header: 'Product' },
      // months...
    ],
  },
  {
    key: 'byMember',
    label: 'Members >1/Day',
    columns: [
      { key: 'Location', header: 'Location' },
      { key: 'Cleaned Product', header: 'Product' },
      // months...
    ],
  },
];

export default function LateCancellations() {
  const { byLocation, byClass, byTrainer, byProduct, byMember, loading, error } = useLateCancellationsData();
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('all');
  
  const months = useMemo(() => {
    // Try to extract months from the first row of byLocation
    const row = byLocation[0];
    if (!row) return [];
    return Object.keys(row).filter((k) => k !== 'Location' && k !== 'Cleaned Class' && k !== 'Trainer Name' && k !== 'Cleaned Product');
  }, [byLocation]);

  const locations = useMemo(() => {
    return [...new Set(byLocation.map(row => row.Location).filter(Boolean).map(String))];
  }, [byLocation]);

  const filteredData = useMemo(() => {
    const filterByLocation = (data: any[]) => {
      if (selectedLocation === 'all') return data;
      return data.filter(row => row.Location === selectedLocation);
    };

    return {
      byLocation: filterByLocation(byLocation),
      byClass: filterByLocation(byClass),
      byTrainer: filterByLocation(byTrainer),
      byProduct: filterByLocation(byProduct),
      byMember: filterByLocation(byMember),
    };
  }, [byLocation, byClass, byTrainer, byProduct, byMember, selectedLocation]);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <LateCancellationsFilterSection
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        selectedTimeframe={selectedTimeframe}
        onTimeframeChange={setSelectedTimeframe}
        locations={locations}
      />

      {/* Metric Cards */}
      <LateCancellationsMetricCards 
        byLocation={byLocation}
        byClass={byClass}
        byTrainer={byTrainer}
        byProduct={byProduct}
        byMember={byMember}
      />

      {/* Charts */}
      <LateCancellationsCharts 
        byLocation={byLocation}
        byClass={byClass}
        selectedLocation={selectedLocation}
      />

      {/* Data Tables */}
      <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-0 shadow-xl rounded-2xl">
        <CardContent className="p-0">
          <Tabs defaultValue="byLocation" className="w-full">
            <TabsList className="sticky top-0 z-10 bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 rounded-t-2xl flex gap-2 p-2">
              {tableConfigs.map((tab) => (
                <TabsTrigger key={tab.key} value={tab.key} className="text-lg font-semibold text-white/90">
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {tableConfigs.map((tab) => (
              <TabsContent key={tab.key} value={tab.key} className="p-4">
                <ModernDataTable
                  data={(() => {
                    switch (tab.key) {
                      case 'byLocation': return filteredData.byLocation;
                      case 'byClass': return filteredData.byClass;
                      case 'byTrainer': return filteredData.byTrainer;
                      case 'byProduct': return filteredData.byProduct;
                      case 'byMember': return filteredData.byMember;
                      default: return [];
                    }
                  })()}
                  columns={[
                    ...tab.columns,
                    ...months.map((m) => ({ key: m, header: m })),
                  ]}
                  stickyHeader
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
