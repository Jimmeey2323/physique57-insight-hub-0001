import { useEffect, useState } from 'react';
import { getGoogleSheetData } from '@/lib/utils';

export interface LateCancellationLocationRow {
  location: string;
  [month: string]: string | number;
}

export interface LateCancellationClassRow {
  location: string;
  cleanedClass: string;
  [month: string]: string | number;
}

export interface LateCancellationTrainerRow {
  location: string;
  trainerName: string;
  [month: string]: string | number;
}

export interface LateCancellationProductRow {
  location: string;
  cleanedProduct: string;
  [month: string]: string | number;
}

export interface LateCancellationMemberRow {
  location: string;
  cleanedProduct: string;
  [month: string]: string | number;
}

export interface UseLateCancellationsDataResult {
  byLocation: LateCancellationLocationRow[];
  byClass: LateCancellationClassRow[];
  byTrainer: LateCancellationTrainerRow[];
  byProduct: LateCancellationProductRow[];
  byMember: LateCancellationMemberRow[];
  loading: boolean;
  error: string | null;
}

export function useLateCancellationsData(): UseLateCancellationsDataResult {
  const [data, setData] = useState<UseLateCancellationsDataResult>({
    byLocation: [],
    byClass: [],
    byTrainer: [],
    byProduct: [],
    byMember: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const sheetId = '12xbYJQrh5wyYDaFhQrq4L0-YkSSlA6z7nMCb66XEbCQ';
        const sheetName = 'Late Cancellations';
        const raw = await getGoogleSheetData(sheetId, sheetName);
        // TODO: Parse raw data into the 5 tables
        // For now, just set loading false
        setData((d) => ({ ...d, loading: false }));
      } catch (e: any) {
        setData((d) => ({ ...d, loading: false, error: e.message || 'Failed to load late cancellations data' }));
      }
    }
    fetchData();
  }, []);

  return data;
}
