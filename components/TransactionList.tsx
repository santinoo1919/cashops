import { FlatList, View, Text } from 'react-native';
import { Transaction } from '../types';
import { TransactionItem } from './TransactionItem';

interface TransactionListProps {
  transactions: Transaction[];
}

export function TransactionList({ transactions }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <View className="flex-1 items-center justify-center py-20">
        <Text className="text-gray-400 text-base mb-2">No transactions yet</Text>
        <Text className="text-gray-300 text-sm">Add your first transaction to get started</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <TransactionItem transaction={item} />}
      className="flex-1 bg-gray-50"
    />
  );
}

