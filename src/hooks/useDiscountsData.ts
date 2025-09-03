
import { useState, useEffect, useMemo } from 'react';
import { useGoogleSheets } from './useGoogleSheets';
import { SalesData } from '@/types/dashboard';

export const useDiscountsData = () => {
  const { data: salesData, loading, error } = useGoogleSheets();
  const [discountData, setDiscountData] = useState<SalesData[]>([]);
  
  // Add debug logging
  useEffect(() => {
    console.log('Discounts hook - loading:', loading, 'error:', error, 'salesData length:', salesData?.length || 0);
    if (error) {
      console.error('Sales data error in discounts hook:', error);
    }
  }, [loading, error, salesData]);

  useEffect(() => {
    if (salesData && salesData.length > 0) {
      try {
        console.log('Processing sales data for discounts...', salesData.length, 'items');
        
        const processedData: SalesData[] = salesData.map((item: any) => {
          // Parse date correctly - handle DD/MM/YYYY HH:mm:ss format
          const parseDate = (dateStr: string) => {
            if (!dateStr) return '';
            try {
              // Split date and time if present
              const [datePart] = dateStr.split(' ');
              const [day, month, year] = datePart.split('/');
              // Create ISO date string for proper parsing
              const isoDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
              const date = new Date(isoDate);
              return date.toISOString().split('T')[0]; // Return YYYY-MM-DD format
            } catch (e) {
              console.error('Date parsing error for:', dateStr, e);
              return '';
            }
          };

          // Parse numeric values safely
          const parseNumber = (value: any): number => {
            if (value === null || value === undefined || value === '') return 0;
            // Handle string values with currency symbols or commas
            const cleanValue = value.toString().replace(/[₹,\s]/g, '');
            const num = parseFloat(cleanValue);
            return isNaN(num) ? 0 : num;
          };

          // Fix the column names to match the Google Sheets structure
          const discountAmount = parseNumber(item['Discount Amount -Mrp- Payment Value']);
          const discountPercentage = parseNumber(item['Discount Percentage - discount amount/mrp*100']);
          const paymentValue = parseNumber(item['Payment Value']);
          const mrpPreTax = parseNumber(item['Mrp - Pre Tax']);
          const mrpPostTax = parseNumber(item['Mrp - Post Tax']);
          const paymentVAT = parseNumber(item['Payment VAT']);
          
          console.log('Processing item:', {
            discountAmount,
            discountPercentage,
            paymentValue,
            mrpPreTax,
            mrpPostTax,
            paymentVAT
          });
          
          return {
            memberId: item['Member ID']?.toString() || '',
            customerName: item['Customer Name'] || '',
            customerEmail: item['Customer Email'] || '',
            saleItemId: item['Sale Item ID']?.toString() || '',
            paymentCategory: item['Payment Category'] || '',
            membershipType: item['Membership Type'] || '',
            paymentDate: parseDate(item['Payment Date'] || ''),
            paymentValue,
            paidInMoneyCredits: parseNumber(item['Paid In Money Credits']),
            paymentVAT,
            paymentItem: item['Payment Item'] || '',
            paymentStatus: item['Payment Status'] || '',
            paymentMethod: item['Payment Method'] || '',
            paymentTransactionId: item['Payment Transaction ID']?.toString() || '',
            stripeToken: item['Stripe Token'] || '',
            soldBy: item['Sold By'] === '-' ? 'Online/System' : (item['Sold By'] || 'Unknown'),
            saleReference: item['Sale Reference']?.toString() || '',
            calculatedLocation: item['Calculated Location'] || '',
            cleanedProduct: item['Cleaned Product'] || '',
            cleanedCategory: item['Cleaned Category'] || '',
            hostId: item['Host Id']?.toString() || '',
            mrpPreTax,
            mrpPostTax,
            discountAmount,
            discountPercentage,
            netRevenue: paymentValue - paymentVAT,
            vat: paymentVAT,
            grossRevenue: paymentValue,
          };
        });

        // Since we have actual discount columns in the data, use them directly
        console.log('Sample processed items with discounts:', processedData.slice(0, 3).map(item => ({
          discountAmount: item.discountAmount,
          discountPercentage: item.discountPercentage,
          paymentValue: item.paymentValue,
          customerName: item.customerName
        })));

        // Filter for items with actual discounts from the spreadsheet
        const discountedItems = processedData.filter(item => 
          (item.discountAmount && item.discountAmount > 0) || 
          (item.discountPercentage && item.discountPercentage > 0)
        );
        
        // If we have actual discount data, show that; otherwise show all data for analysis
        let finalData = discountedItems.length > 0 ? discountedItems : processedData;
        
        // Sort by date (newest first) and limit for performance
        finalData = finalData
          .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
          .slice(0, 2000); // Limit for performance

        console.log('Total processed items:', processedData.length);
        console.log('Items with actual discounts:', discountedItems.length);
        console.log('Final data shown:', finalData.length);
        
        if (finalData.length > 0) {
          console.log('Sample discount item:', {
            customerName: finalData[0].customerName,
            paymentValue: finalData[0].paymentValue,
            discountAmount: finalData[0].discountAmount,
            discountPercentage: finalData[0].discountPercentage
          });
        }
        
        setDiscountData(finalData);
      } catch (error) {
        console.error('Error processing discount data:', error);
        setDiscountData([]);
      }
    } else {
      console.log('No sales data available for discount processing');
      setDiscountData([]);
    }
  }, [salesData]);

  return {
    data: discountData,
    loading,
    error,
  };
};
