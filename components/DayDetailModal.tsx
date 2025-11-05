import { Modal, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { DrawerSession, Transaction } from '../types';
import { TransactionItem } from './TransactionItem';

interface DayDetailModalProps {
  visible: boolean;
  session: DrawerSession | null;
  onClose: () => void;
}

export function DayDetailModal({ visible, session, onClose }: DayDetailModalProps) {
  if (!session) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-black">Session Details</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-ios-blue text-base font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 py-6 bg-gray-50 border-b border-gray-200">
            <View className="mb-4">
              <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Date</Text>
              <Text className="text-lg font-semibold text-black">
                {formatDate(session.date)}
              </Text>
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Opening Balance</Text>
                <Text className="text-xl font-bold text-black">{formatCurrency(session.openingBalance)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Closing Balance</Text>
                <Text className="text-xl font-bold text-black">{formatCurrency(session.closingBalance)}</Text>
              </View>
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cash In</Text>
                <Text className="text-lg font-semibold text-green-600">{formatCurrency(session.totalIn)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-gray-500 uppercase tracking-wide mb-1">Cash Out</Text>
                <Text className="text-lg font-semibold text-red-600">{formatCurrency(session.totalOut)}</Text>
              </View>
            </View>

            <View className="pt-4 border-t border-gray-200">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-gray-500 uppercase tracking-wide">Difference</Text>
                <Text className={`text-xl font-bold ${session.difference === 0 ? 'text-black' : session.difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {session.difference >= 0 ? '+' : ''}{formatCurrency(session.difference)}
                </Text>
              </View>
            </View>
          </View>

          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-black mb-4">
              Transactions ({session.transactions.length})
            </Text>
            {session.transactions.length === 0 ? (
              <Text className="text-gray-400 text-center py-8">No transactions</Text>
            ) : (
              <View>
                {session.transactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}

