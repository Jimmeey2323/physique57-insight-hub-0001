import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface LateCancellationsFilterSectionProps {
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  selectedTimeframe: string;
  onTimeframeChange: (timeframe: string) => void;
  locations: string[];
}

export function LateCancellationsFilterSection({
  selectedLocation,
  onLocationChange,
  selectedTimeframe,
  onTimeframeChange,
  locations
}: LateCancellationsFilterSectionProps) {
  
  const timeframes = [
    { value: 'all', label: 'All Time' },
    { value: '3m', label: 'Last 3 Months' },
    { value: '6m', label: 'Last 6 Months' },
    { value: '1y', label: 'Last 12 Months' }
  ];

  return (
    <Card className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-slate-700 mb-6">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location-select" className="text-slate-300">Location</Label>
            <Select value={selectedLocation} onValueChange={onLocationChange}>
              <SelectTrigger id="location-select" className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                <SelectItem value="all" className="text-white hover:bg-slate-700">All Locations</SelectItem>
                {locations.map(location => (
                  <SelectItem key={location} value={location} className="text-white hover:bg-slate-700">
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe-select" className="text-slate-300">Timeframe</Label>
            <Select value={selectedTimeframe} onValueChange={onTimeframeChange}>
              <SelectTrigger id="timeframe-select" className="bg-slate-800 border-slate-600 text-white">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600">
                {timeframes.map(timeframe => (
                  <SelectItem key={timeframe.value} value={timeframe.value} className="text-white hover:bg-slate-700">
                    {timeframe.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}