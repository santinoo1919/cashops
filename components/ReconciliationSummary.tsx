import { View, Text, ScrollView } from 'react-native';
import { DriverReconciliation } from '../types';
import { useCurrencyStore } from '../store/currencyStore';
import { formatCurrency } from '../utils/currency';

interface ReconciliationSummaryProps {
  reconciliations: DriverReconciliation[];
}

export function ReconciliationSummary({ reconciliations }: ReconciliationSummaryProps) {
  const { currency } = useCurrencyStore();
  
  if (reconciliations.length === 0) {
    return null;
  }

  const totalOrders = reconciliations.reduce((sum, r) => sum + r.totalOrders, 0);
  const totalCashGiven = reconciliations.reduce((sum, r) => sum + r.totalCashGiven, 0);
  const totalCashChange = reconciliations.reduce((sum, r) => sum + r.totalCashChange, 0);
  const totalReceived = reconciliations.reduce((sum, r) => sum + r.totalReceived, 0);
  const totalDifference = reconciliations.reduce((sum, r) => sum + r.difference, 0);

  return (
    <View className="bg-background-card border-t border-border px-6 py-6">
      <Text className="text-lg font-bold text-text mb-4">Order Reconciliation</Text>
      
      <View className="bg-zinc-800 rounded-xl p-4 mb-4 border border-border">
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-text-secondary">Expected (Orders Amount)</Text>
          <Text className="text-base font-semibold text-text">{formatCurrency(totalOrders, currency)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-text-secondary">Total Cash Given</Text>
          <Text className="text-base font-semibold text-blue-400">{formatCurrency(totalCashGiven, currency)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3">
          <Text className="text-sm text-text-secondary">Total Cash Change</Text>
          <Text className="text-base font-semibold text-orange-400">{formatCurrency(totalCashChange, currency)}</Text>
        </View>
        <View className="flex-row justify-between items-center mb-3 border-t border-border pt-3">
          <Text className="text-sm text-text-secondary">Actually Received (Given - Change)</Text>
          <Text className="text-base font-semibold text-green-500">{formatCurrency(totalReceived, currency)}</Text>
        </View>
        <View className="flex-row justify-between items-center pt-3 border-t border-border">
          <Text className="text-sm font-semibold text-text-secondary">Difference (Received - Expected)</Text>
          <Text className={`text-base font-bold ${totalDifference === 0 ? 'text-text' : totalDifference > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference, currency)}
          </Text>
        </View>
      </View>

      <Text className="text-sm font-semibold text-text-secondary mb-3">By Driver</Text>
      <ScrollView className="max-h-64">
        {reconciliations.map((recon) => (
          <View key={recon.driverName} className="bg-zinc-800 rounded-xl p-4 mb-3 border border-border">
            <Text className="text-base font-semibold text-text mb-3">{recon.driverName}</Text>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-text-secondary">Expected (Orders)</Text>
              <Text className="text-sm font-medium text-text">{formatCurrency(recon.totalOrders, currency)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-text-secondary">Cash Given</Text>
              <Text className="text-sm font-medium text-blue-400">{formatCurrency(recon.totalCashGiven, currency)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-text-secondary">Cash Change</Text>
              <Text className="text-sm font-medium text-orange-400">{formatCurrency(recon.totalCashChange, currency)}</Text>
            </View>
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-xs text-text-secondary">Received (Given - Change)</Text>
              <Text className="text-sm font-medium text-green-500">{formatCurrency(recon.totalReceived, currency)}</Text>
            </View>
            <View className="flex-row justify-between items-center pt-2 border-t border-border">
              <Text className="text-xs font-semibold text-text-secondary">Difference</Text>
              <Text className={`text-sm font-bold ${recon.difference === 0 ? 'text-text' : recon.difference > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {recon.difference >= 0 ? '+' : ''}{formatCurrency(recon.difference, currency)}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}
