import React from 'react';
import { useLateCancellationsData } from '@/hooks/useLateCancellationsData';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ModernDataTable } from '@/components/ui/ModernDataTable';
import { Loader2 } from 'lucide-react';

const tableConfigs = [
  {
    key: 'byLocation',
    label: 'By Location',
    columns: [
      { key: 'location', header: 'Location' },
      // months will be dynamically added
    ],
  },
  {
    key: 'byClass',
    label: 'By Class',
    columns: [
      { key: 'location', header: 'Location' },
      { key: 'cleanedClass', header: 'Class' },
      // months...
    ],
  },
  {
    key: 'byTrainer',
    label: 'By Trainer',
    columns: [
      { key: 'location', header: 'Location' },
      { key: 'trainerName', header: 'Trainer' },
      // months...
    ],
  },
  {
    key: 'byProduct',
    label: 'By Product',
    columns: [
      { key: 'location', header: 'Location' },
      { key: 'cleanedProduct', header: 'Product' },
      // months...
    ],
  },
  {
    key: 'byMember',
    label: 'Members >1/Day',
    columns: [
      { key: 'location', header: 'Location' },
      { key: 'cleanedProduct', header: 'Product' },
      // months...
    ],
  },
];

export default function ExecutiveLateCancellationsTab() {
  const { byLocation, byClass, byTrainer, byProduct, byMember, loading, error } = useLateCancellationsData();
  const months = React.useMemo(() => {
    // Try to extract months from the first row of byLocation
    const row = byLocation[0];
    if (!row) return [];
    return Object.keys(row).filter((k) => k !== 'location' && k !== 'cleanedClass' && k !== 'trainerName' && k !== 'cleanedProduct');
  }, [byLocation]);

  if (loading) return <div className="flex items-center justify-center h-96"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
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
                    case 'byLocation': return byLocation;
                    case 'byClass': return byClass;
                    case 'byTrainer': return byTrainer;
                    case 'byProduct': return byProduct;
                    case 'byMember': return byMember;
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
  );
}
