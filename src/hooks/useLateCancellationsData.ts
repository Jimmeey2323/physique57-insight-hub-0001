import { useEffect, useState } from 'react';
import { useGoogleSheets } from './useGoogleSheets';

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
        const accessToken = await getAccessToken();
        const sheetId = '12xbYJQrh5wyYDaFhQrq4L0-YkSSlA6z7nMCb66XEbCQ';
        
        // Fetch data from Late Cancellations sheet
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/Late%20Cancellations?alt=json`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch late cancellations data');
        }

        const result = await response.json();
        const rows = result.values || [];
        
        if (rows.length < 2) {
          setData(prev => ({ ...prev, loading: false }));
          return;
        }

        // Parse the different sections of data
        const parsedData = parseLateCancellationsData(rows);
        setData(prev => ({ ...prev, ...parsedData, loading: false }));
        
      } catch (error) {
        console.error('Error fetching late cancellations data:', error);
        setData(prev => ({ ...prev, loading: false, error: error.message || 'Failed to load late cancellations data' }));
      }
    }

    // Helper function to get access token
    async function getAccessToken() {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: '416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com',
          client_secret: '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',
          refresh_token: '1//04w4V2xMUIMzACgYIARAAGAQSNwF-L9Ir5__pXDmZVYaHKOSqyauTDVmTvrCvgaL2beep4gmp8_lVED0ppM9BPWDDimHyQKk50EY',
          grant_type: 'refresh_token',
        }),
      });
      const tokenData = await response.json();
      return tokenData.access_token;
    }

    // Helper function to parse the late cancellations data
    function parseLateCancellationsData(rows) {
      const result = {
        byLocation: [],
        byClass: [],
        byTrainer: [],
        byProduct: [],
        byMember: [],
      };

      let currentSection = '';
      let sectionHeaders = [];
      
      for (let i = 0; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const firstCell = row[0]?.toString().trim();
        
        // Detect section headers
        if (firstCell === 'Late Cancellations by Location') {
          currentSection = 'byLocation';
          continue;
        } else if (firstCell === 'Late Cancellations by Class') {
          currentSection = 'byClass';
          continue;
        } else if (firstCell === 'Late Cancellations by Trainer') {
          currentSection = 'byTrainer';
          continue;
        } else if (firstCell === 'Late Cancellations by Product') {
          currentSection = 'byProduct';
          continue;
        } else if (firstCell === 'Members with >1 Late Cancellation Per Day (Count of Unique Members)') {
          currentSection = 'byMember';
          continue;
        }

        // Skip empty rows and Grand Total rows
        if (!firstCell || firstCell === 'Grand Total' || firstCell.includes('Grand Total')) {
          continue;
        }

        // Check if this is a header row (contains month names)
        if (row.some(cell => cell?.toString().includes('Aug-2025') || cell?.toString().includes('Location'))) {
          sectionHeaders = row.map(cell => cell?.toString().trim() || '');
          continue;
        }

        // Parse data rows
        if (currentSection && sectionHeaders.length > 0) {
          const dataRow = {};
          
          sectionHeaders.forEach((header, index) => {
            if (header && row[index] !== undefined) {
              const value = row[index]?.toString().trim();
              // Parse numeric values
              if (header !== 'Location' && header !== 'Cleaned Class' && header !== 'Trainer Name' && header !== 'Cleaned Product') {
                dataRow[header] = isNaN(Number(value)) ? value : Number(value);
              } else {
                dataRow[header] = value;
              }
            }
          });

          if (Object.keys(dataRow).length > 0) {
            result[currentSection].push(dataRow);
          }
        }
      }

      return result;
    }

    fetchData();
  }, []);

  return data;
}
