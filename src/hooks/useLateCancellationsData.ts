import { useEffect, useState } from 'react';

const GOOGLE_CONFIG = {
  CLIENT_ID: "416630995185-007ermh3iidknbbtdmu5vct207mdlbaa.apps.googleusercontent.com",
  CLIENT_SECRET: "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",
  REFRESH_TOKEN: "1//04w4V2xMUIMzACgYIARAAGAQSNwF-L9Ir5__pXDmZVYaHKOSqyauTDVmTvrCvgaL2beep4gmp8_lVED0ppM9BPWDDimHyQKk50EY",
  TOKEN_URL: "https://oauth2.googleapis.com/token"
};

const SPREADSHEET_ID = "12xbYJQrh5wyYDaFhQrq4L0-YkSSlA6z7nMCb66XEbCQ";

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
        setData((d) => ({ ...d, loading: true, error: null }));
        // Get access token
        const tokenRes = await fetch(GOOGLE_CONFIG.TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: GOOGLE_CONFIG.CLIENT_ID,
            client_secret: GOOGLE_CONFIG.CLIENT_SECRET,
            refresh_token: GOOGLE_CONFIG.REFRESH_TOKEN,
            grant_type: 'refresh_token',
          }),
        });
        const tokenData = await tokenRes.json();
        const accessToken = tokenData.access_token;
        // Fetch the Late Cancellations sheet
        const response = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/Late%20Cancellations?alt=json`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );
        if (!response.ok) throw new Error('Failed to fetch late cancellations data');
        const result = await response.json();
        const rows = result.values || [];
        // Helper to parse a table from a given start row and columns
        function parseTable(startRow: number, keyMap: string[]): any[] {
          if (rows.length <= startRow) return [];
          const headers = rows[startRow];
          const dataRows = [];
          for (let i = startRow + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!row || row.length === 0 || row.every(cell => !cell || cell === '')) break;
            // If row is a section header or empty, stop
            if (row[0] && typeof row[0] === 'string' && row[0].toLowerCase().includes('grand total')) break;
            const obj: any = {};
            headers.forEach((h: string, idx: number) => {
              obj[keyMap[idx] || h] = row[idx] ?? '';
            });
            dataRows.push(obj);
          }
          return dataRows;
        }
        // Find table start indices by searching for section headers
        const findRowIndex = (label: string) => rows.findIndex(r => r[0] && typeof r[0] === 'string' && r[0].toLowerCase().includes(label.toLowerCase()));
        // By Location
        const byLocationStart = 0;
        const byLocationEnd = findRowIndex('Late Cancellations by Class') - 2;
        const byLocationRows = rows.slice(byLocationStart, byLocationEnd + 1);
        const byLocationHeaders = byLocationRows[0];
        const byLocation: LateCancellationLocationRow[] = byLocationRows.slice(1).filter(r => r[0] && !r[0].toLowerCase().includes('grand total')).map(row => {
          const obj: any = { location: row[0] };
          byLocationHeaders.forEach((h: string, idx: number) => {
            if (idx === 0) return;
            obj[h] = row[idx] ?? '';
          });
          return obj;
        });
        // By Class
        const byClassStart = findRowIndex('Late Cancellations by Class');
        const byClassEnd = findRowIndex('Late Cancellations by Trainer') - 2;
        const byClassRows = rows.slice(byClassStart + 1, byClassEnd + 1);
        const byClassHeaders = byClassRows[0];
        const byClass: LateCancellationClassRow[] = byClassRows.slice(1).filter(r => r[0] && !r[0].toLowerCase().includes('grand total')).map(row => {
          const obj: any = { location: row[0], cleanedClass: row[1] };
          byClassHeaders.forEach((h: string, idx: number) => {
            if (idx < 2) return;
            obj[h] = row[idx] ?? '';
          });
          return obj;
        });
        // By Trainer
        const byTrainerStart = findRowIndex('Late Cancellations by Trainer');
        const byTrainerEnd = findRowIndex('Late Cancellations by Product') - 2;
        const byTrainerRows = rows.slice(byTrainerStart + 1, byTrainerEnd + 1);
        const byTrainerHeaders = byTrainerRows[0];
        const byTrainer: LateCancellationTrainerRow[] = byTrainerRows.slice(1).filter(r => r[0] && !r[0].toLowerCase().includes('grand total')).map(row => {
          const obj: any = { location: row[0], trainerName: row[1] };
          byTrainerHeaders.forEach((h: string, idx: number) => {
            if (idx < 2) return;
            obj[h] = row[idx] ?? '';
          });
          return obj;
        });
        // By Product
        const byProductStart = findRowIndex('Late Cancellations by Product');
        const byProductEnd = findRowIndex('Members with >1 Late Cancellation Per Day') - 2;
        const byProductRows = rows.slice(byProductStart + 1, byProductEnd + 1);
        const byProductHeaders = byProductRows[0];
        const byProduct: LateCancellationProductRow[] = byProductRows.slice(1).filter(r => r[0] && !r[0].toLowerCase().includes('grand total')).map(row => {
          const obj: any = { location: row[0], cleanedProduct: row[1] };
          byProductHeaders.forEach((h: string, idx: number) => {
            if (idx < 2) return;
            obj[h] = row[idx] ?? '';
          });
          return obj;
        });
        // By Member
        const byMemberStart = findRowIndex('Members with >1 Late Cancellation Per Day');
        const byMemberEnd = findRowIndex('Members with >1 Check-in Per Day') - 2;
        const byMemberRows = rows.slice(byMemberStart + 1, byMemberEnd + 1);
        const byMemberHeaders = byMemberRows[0];
        const byMember: LateCancellationMemberRow[] = byMemberRows.slice(1).filter(r => r[0] && !r[0].toLowerCase().includes('grand total')).map(row => {
          const obj: any = { location: row[0], cleanedProduct: row[1] };
          byMemberHeaders.forEach((h: string, idx: number) => {
            if (idx < 2) return;
            obj[h] = row[idx] ?? '';
          });
          return obj;
        });
        setData({
          byLocation,
          byClass,
          byTrainer,
          byProduct,
          byMember,
          loading: false,
          error: null,
        });
      } catch (e: any) {
        setData((d) => ({ ...d, loading: false, error: e.message || 'Failed to load late cancellations data' }));
      }
    }
    fetchData();
  }, []);

  return data;
}
