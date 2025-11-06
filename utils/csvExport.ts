import Papa from 'papaparse';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { DrawerSession, Transaction } from '../types';

interface CSVRow {
  'Session Date': string;
  'Session ID': string;
  'Opening Balance': string;
  'Closing Balance': string;
  'Total In': string;
  'Total Out': string;
  'Difference': string;
  'Transaction ID': string;
  'Transaction Type': string;
  'Transaction Amount': string;
  'Category': string;
  'Description': string;
  'Driver Name': string;
  'Transaction Timestamp': string;
  'Cash Given': string;
  'Cash Change': string;
  'Order Amount': string;
}

export async function exportSessionsToCSV(
  sessions: DrawerSession[],
  filename: string = 'opscash-export'
): Promise<void> {
  if (sessions.length === 0) {
    throw new Error('No sessions to export');
  }

  // Flatten sessions and transactions into rows
  const rows: CSVRow[] = [];

  sessions.forEach((session) => {
    const sessionDate = session.date.toISOString();
    const sessionId = session.id;
    const openingBalance = session.openingBalance.toFixed(2);
    const closingBalance = session.closingBalance.toFixed(2);
    const totalIn = session.totalIn.toFixed(2);
    const totalOut = session.totalOut.toFixed(2);
    const difference = session.difference.toFixed(2);

    // If no transactions, still create a row for the session
    if (session.transactions.length === 0) {
      rows.push({
        'Session Date': sessionDate,
        'Session ID': sessionId,
        'Opening Balance': openingBalance,
        'Closing Balance': closingBalance,
        'Total In': totalIn,
        'Total Out': totalOut,
        'Difference': difference,
        'Transaction ID': '',
        'Transaction Type': '',
        'Transaction Amount': '',
        'Category': '',
        'Description': '',
        'Driver Name': '',
        'Transaction Timestamp': '',
        'Cash Given': '',
        'Cash Change': '',
        'Order Amount': '',
      });
    } else {
      // Create a row for each transaction
      session.transactions.forEach((transaction) => {
        rows.push({
          'Session Date': sessionDate,
          'Session ID': sessionId,
          'Opening Balance': openingBalance,
          'Closing Balance': closingBalance,
          'Total In': totalIn,
          'Total Out': totalOut,
          'Difference': difference,
          'Transaction ID': transaction.id,
          'Transaction Type': transaction.type,
          'Transaction Amount': transaction.amount.toFixed(2),
          'Category': transaction.category || '',
          'Description': transaction.description || '',
          'Driver Name': transaction.driverName || '',
          'Transaction Timestamp': transaction.timestamp.toISOString(),
          'Cash Given': transaction.cashGiven?.toFixed(2) || '',
          'Cash Change': transaction.cashChange?.toFixed(2) || '',
          'Order Amount': transaction.orderAmount?.toFixed(2) || '',
        });
      });
    }
  });

  // Generate CSV string
  const csv = Papa.unparse(rows, {
    header: true,
    delimiter: ',',
  });

  // Create filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const fullFilename = `${filename}-${timestamp}.csv`;

  // Write file using legacy API (compatible with current Expo SDK)
  const fileUri = `${FileSystem.documentDirectory}${fullFilename}`;
  await FileSystem.writeAsStringAsync(fileUri, csv);

  // Share file
  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/csv',
      dialogTitle: 'Export Operations',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

export function filterSessionsSinceDate(
  sessions: DrawerSession[],
  sinceDate: Date | null
): DrawerSession[] {
  // If no last export date, return empty array (user needs to export all first)
  if (!sinceDate) {
    return [];
  }

  return sessions.filter((session) => {
    // Compare dates (ignore time)
    const sessionDate = new Date(session.date);
    sessionDate.setHours(0, 0, 0, 0);
    const filterDate = new Date(sinceDate);
    filterDate.setHours(0, 0, 0, 0);
    
    return sessionDate > filterDate;
  });
}

