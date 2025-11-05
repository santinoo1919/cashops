import { Text, View, TouchableOpacity } from 'react-native';

interface DrawerHeaderProps {
  openingBalance: number;
  currentBalance: number;
  closingBalance: number | null;
  onHistoryPress: () => void;
}

export function DrawerHeader({ openingBalance, currentBalance, closingBalance, onHistoryPress }: DrawerHeaderProps) {
  const difference = closingBalance !== null ? closingBalance - currentBalance : null;

  return (
    <View className="bg-white border-b border-gray-200">
      <View className="flex-row justify-between items-center px-6 pt-12 pb-4">
        <Text className="text-xl font-bold text-black">Cash Drawer</Text>
        <TouchableOpacity onPress={onHistoryPress} className="p-2">
          <Text className="text-2xl">📊</Text>
        </TouchableOpacity>
      </View>
      <View className="px-6 py-8">
      <View className="mb-6">
        <Text className="text-xs text-gray-600 uppercase tracking-wide mb-1">Opening Balance</Text>
        <Text className="text-3xl font-semibold text-black">{formatCurrency(openingBalance)}</Text>
      </View>

      <View className="mb-6">
        <Text className="text-xs text-gray-600 uppercase tracking-wide mb-1">Current Balance</Text>
        <Text className="text-4xl font-bold text-black">{formatCurrency(currentBalance)}</Text>
      </View>

      {closingBalance !== null && (
        <View className="border-t border-gray-200 pt-6">
          <View className="flex-row justify-between items-center mb-2">
            <Text className="text-xs text-gray-600 uppercase tracking-wide">Closing Balance</Text>
            <Text className="text-2xl font-semibold text-black">{formatCurrency(closingBalance)}</Text>
          </View>
          {difference !== null && (
            <View className="flex-row justify-between items-center">
              <Text className="text-xs text-gray-600 uppercase tracking-wide">Difference</Text>
              <Text className={`text-lg font-semibold ${difference === 0 ? 'text-black' : difference > 0 ? 'text-green-600' : 'text-red-600'}`}>
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

