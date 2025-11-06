import { View, Text } from 'react-native';
import { Transaction } from '../types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <Text className="text-text-muted text-base mb-2">No transactions yet</Text>
        <Text className="text-text-secondary text-sm">Add your first transaction to get started</Text>
      </View>
    );
  }

  return (
    <View className="bg-background">
      {transactions.map((transaction) => (
        <TransactionItem key={transaction.id} transaction={transaction} />
      ))}
    </View>
  );
}
