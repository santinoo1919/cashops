import { Text, View } from 'react-native';
import { Transaction } from '../types';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const isIn = transaction.type === 'in';
  const sign = isIn ? '+' : '-';
  const colorClass = isIn ? 'text-green-600' : 'text-red-600';
  const bgClass = isIn ? 'bg-green-50' : 'bg-red-50';

  return (
    <View className="bg-white border-b border-gray-100 px-6 py-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          <Text className="text-base font-medium text-black mb-1">{transaction.description}</Text>
          <Text className="text-xs text-gray-500">{formatTime(transaction.timestamp)}</Text>
        </View>
        <View className={`px-3 py-1 rounded-full ${bgClass}`}>
          <Text className={`text-lg font-semibold ${colorClass}`}>
            {sign}{formatCurrency(transaction.amount)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

