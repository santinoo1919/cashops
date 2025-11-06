import { Text, View } from 'react-native';
import { Transaction } from '../types';

interface DrawerHeaderProps {
  openingBalance: number;
  currentBalance: number;
  closingBalance: number | null;
  transactions: Transaction[];
}

export function DrawerHeader({ openingBalance, currentBalance, closingBalance, transactions }: DrawerHeaderProps) {
  const difference = closingBalance !== null ? closingBalance - currentBalance : null;
  
  // Calculate net in and net out
  const netIn = parseFloat(
    transactions
      .filter((t) => t.type === "in")
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2)
  );
  
  const netOut = parseFloat(
    transactions
      .filter((t) => t.type === "out")
      .reduce((sum, t) => sum + t.amount, 0)
      .toFixed(2)
  );

  return (
    <View className="bg-background-card border-b border-border">
      <View className="px-6 py-4">
        <View className="flex-row justify-between items-start mb-3">
          <View className="flex-1">
            <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Opening Balance</Text>
            <Text className="text-lg font-medium text-text-secondary mb-2">{formatCurrency(openingBalance)}</Text>
            
            <View className="flex-row gap-4">
              <View>
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Net In</Text>
                <Text className="text-sm font-medium text-green-500">{formatCurrency(netIn)}</Text>
              </View>
              <View>
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Net Out</Text>
                <Text className="text-sm font-medium text-red-500">{formatCurrency(netOut)}</Text>
              </View>
            </View>
          </View>

          <View className="items-end">
            <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Current Balance</Text>
            <Text className="text-2xl font-bold text-text">{formatCurrency(currentBalance)}</Text>
          </View>
        </View>

        {closingBalance !== null && (
          <View className="border-t border-border pt-3">
            <View className="flex-row justify-between items-center mb-1">
              <Text className="text-xs text-text-muted uppercase tracking-wide">Closing Balance</Text>
              <Text className="text-xl font-semibold text-text">{formatCurrency(closingBalance)}</Text>
            </View>
            {difference !== null && (
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-text-muted uppercase tracking-wide">Difference</Text>
                <Text className={`text-base font-semibold ${difference === 0 ? 'text-text' : difference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {difference > 0 ? '+' : ''}{formatCurrency(difference)}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}
