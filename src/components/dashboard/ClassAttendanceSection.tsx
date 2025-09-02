
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, BarChart3, Users, Target, Filter, MapPin, Building2, Home } from 'lucide-react';
import { useRecurringSessionsData, RecurringSessionData } from '@/hooks/useRecurringSessionsData';
import { RecurringSessionsFilterSection } from './RecurringSessionsFilterSection';
import { RecurringSessionsGroupedTable } from './RecurringSessionsGroupedTable';
import { RecurringSessionsMetricCards } from './RecurringSessionsMetricCards';
import { RecurringSessionsTopBottomLists } from './RecurringSessionsTopBottomLists';
import { SessionsQuickFilters } from './SessionsQuickFilters';
import { RecurringSessionsAttendanceAnalytics } from './RecurringSessionsAttendanceAnalytics';
import { RecurringClassFormatAnalysis } from './RecurringClassFormatAnalysis';
import { useNavigate } from 'react-router-dom';

const locations = [{
  id: 'all',
  name: 'All Locations',
  fullName: 'All Locations'
}, {
  id: 'Kwality House, Kemps Corner',
  name: 'Kwality House',
  fullName: 'Kwality House, Kemps Corner'
}, {
  id: 'Supreme HQ, Bandra',
  name: 'Supreme HQ',
  fullName: 'Supreme HQ, Bandra'
}, {
  id: 'Kenkere House',
  name: 'Kenkere House',
  fullName: 'Kenkere House'
}];

export const ClassAttendanceSection: React.FC = () => {
  const navigate = useNavigate();
  const {
    data: recurringData,
    teacherData,
    loading,
    error,
    refetch
  } = useRecurringSessionsData();
  const [activeLocation, setActiveLocation] = useState('all');
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [quickFilters, setQuickFilters] = useState({
    locations: [] as string[],
    trainers: [] as string[],
    classes: [] as string[],
    days: [] as string[]
  });

  const combinedData = useMemo(() => {
    // Combine both datasets
    const combined = [...(recurringData || []), ...(teacherData || [])];
    
    // Remove duplicates based on uniqueId1 and uniqueId2
    const uniqueData = combined.filter((item, index, self) => 
      index === self.findIndex(t => 
        t.uniqueId1 === item.uniqueId1 && t.uniqueId2 === item.uniqueId2
      )
    );
    
    return uniqueData;
  }, [recurringData, teacherData]);

  const filteredData = useMemo(() => {
    if (!combinedData) return [];
    let filtered = combinedData;

    // Apply location filter
    if (activeLocation !== 'all') {
      filtered = filtered.filter(item => item.location === activeLocation);
    }

    // Apply quick filters
    if (quickFilters.locations.length > 0) {
      filtered = filtered.filter(item => quickFilters.locations.includes(item.location));
    }
    if (quickFilters.trainers.length > 0) {
      filtered = filtered.filter(item => quickFilters.trainers.includes(item.trainer));
    }
    if (quickFilters.classes.length > 0) {
      filtered = filtered.filter(item => quickFilters.classes.includes(item.class));
    }
    if (quickFilters.days.length > 0) {
      filtered = filtered.filter(item => quickFilters.days.includes(item.day));
    }

    return filtered;
  }, [combinedData, activeLocation, quickFilters]);

  const uniqueOptions = useMemo(() => {
    if (!combinedData) return {
      trainers: [],
      classTypes: [],
      daysOfWeek: [],
      timeSlots: [],
      locations: [],
      classes: [],
      days: []
    };
    return {
      trainers: [...new Set(combinedData.map(item => item.trainer))].filter(Boolean),
      classTypes: [...new Set(combinedData.map(item => item.class))].filter(Boolean),
      daysOfWeek: [...new Set(combinedData.map(item => item.day))].filter(Boolean),
      timeSlots: [...new Set(combinedData.map(item => item.time))].filter(Boolean),
      locations: [...new Set(combinedData.map(item => item.location))].filter(Boolean),
      classes: [...new Set(combinedData.map(item => item.class))].filter(Boolean),
      days: [...new Set(combinedData.map(item => item.day))].filter(Boolean)
    };
  }, [combinedData]);

  const handleQuickFilterChange = (type: string, values: string[]) => {
    setQuickFilters(prev => ({
      ...prev,
      [type]: values
    }));
  };

  const clearQuickFilters = () => {
    setQuickFilters({
      locations: [],
      trainers: [],
      classes: [],
      days: []
    });
  };

  if (!combinedData || combinedData.length === 0) {
    return <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-slate-600">No class attendance data available</p>
        </div>
      </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-6 py-8">
        {/* Location Tabs */}
        <Tabs value={activeLocation} onValueChange={setActiveLocation} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white/90 backdrop-blur-sm p-2 rounded-2xl shadow-xl border-0 grid grid-cols-4 w-full max-w-3xl overflow-hidden">
              {locations.map(location => <TabsTrigger key={location.id} value={location.id} className="relative rounded-xl px-6 py-4 font-semibold text-sm transition-all duration-300 ease-out hover:scale-105 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2">
                    {location.id === 'all' ? <Building2 className="w-4 h-4" /> : <MapPin className="w-4 h-4" />}
                    <div className="text-center">
                      <div className="font-bold">{location.name.split(',')[0]}</div>
                      {location.name.includes(',') && <div className="text-xs opacity-80">{location.name.split(',')[1]?.trim()}</div>}
                    </div>
                  </div>
                </TabsTrigger>)}
            </TabsList>
          </div>

          {locations.map(location => <TabsContent key={location.id} value={location.id} className="space-y-8">
              {/* Quick Filters */}
              <SessionsQuickFilters filters={quickFilters} options={uniqueOptions} onFilterChange={handleQuickFilterChange} onClearAll={clearQuickFilters} />

              {/* Collapsible Advanced Filters */}
              <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 overflow-hidden">
                <Collapsible open={isFilterExpanded} onOpenChange={setIsFilterExpanded}>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="pb-4 cursor-pointer hover:bg-gray-50/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                          <Filter className="w-5 h-5 text-blue-600" />
                          Advanced Filters
                        </CardTitle>
                        {isFilterExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent>
                      <RecurringSessionsFilterSection data={filteredData} />
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Metrics Cards */}
              <RecurringSessionsMetricCards data={filteredData} />

              {/* Top/Bottom Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecurringSessionsTopBottomLists data={filteredData} title="Top Performing Classes" type="classes" variant="top" />
                <RecurringSessionsTopBottomLists data={filteredData} title="Top Performing Trainers" type="trainers" variant="top" />
              </div>

              {/* Analytics Sections */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <RecurringSessionsGroupedTable data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <RecurringClassFormatAnalysis data={filteredData} />
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 overflow-hidden">
                <RecurringSessionsAttendanceAnalytics data={filteredData} />
              </div>
            </TabsContent>)}
        </Tabs>
      </div>
    </div>
  );
};
