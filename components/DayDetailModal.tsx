import { Modal, View, Text, TouchableOpacity, FlatList, ScrollView } from 'react-native';
import { DrawerSession, Transaction } from '../types';
import { TransactionItem } from './TransactionItem';
import { ReconciliationSummary } from './ReconciliationSummary';
import { useCurrencyStore } from '../store/currencyStore';
import { formatCurrency } from '../utils/currency';

interface DayDetailModalProps {
  visible: boolean;
  session: DrawerSession | null;
  onClose: () => void;
}

export function DayDetailModal({ visible, session, onClose }: DayDetailModalProps) {
  const { currency } = useCurrencyStore();
  
  if (!session) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-border">
          <Text className="text-2xl font-bold text-text">Session Details</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-accent text-base font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <ScrollView className="flex-1">
          <View className="px-6 py-6 bg-background-card border-b border-border">
            <View className="mb-4">
              <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Date</Text>
              <Text className="text-lg font-semibold text-text">
                {formatDate(session.date)}
              </Text>
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Opening Balance</Text>
                <Text className="text-xl font-bold text-text">{formatCurrency(session.openingBalance, currency)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Closing Balance</Text>
                <Text className="text-xl font-bold text-text">{formatCurrency(session.closingBalance, currency)}</Text>
              </View>
            </View>

            <View className="flex-row gap-4 mb-4">
              <View className="flex-1">
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Cash In</Text>
                <Text className="text-lg font-semibold text-green-500">{formatCurrency(session.totalIn, currency)}</Text>
              </View>
              <View className="flex-1">
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">Cash Out</Text>
                <Text className="text-lg font-semibold text-red-500">{formatCurrency(session.totalOut, currency)}</Text>
              </View>
            </View>

            <View className="pt-4 border-t border-border">
              <View className="flex-row justify-between items-center">
                <Text className="text-xs text-text-muted uppercase tracking-wide">Difference</Text>
                <Text className={`text-xl font-bold ${session.difference === 0 ? 'text-text' : session.difference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {session.difference >= 0 ? '+' : ''}{formatCurrency(session.difference, currency)}
                </Text>
              </View>
            </View>
          </View>

          {session.driverReconciliations && session.driverReconciliations.length > 0 && (
            <View className="px-6 py-4">
              <ReconciliationSummary reconciliations={session.driverReconciliations} />
            </View>
          )}

          <View className="px-6 py-4">
            <Text className="text-lg font-semibold text-text mb-4">
              Transactions ({session.transactions.length})
            </Text>
            {session.transactions.length === 0 ? (
              <Text className="text-text-muted text-center py-8">No transactions</Text>
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

