import { Text, View } from 'react-native';
import { Transaction } from '../types';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../constants/categories';
import { useCurrencyStore } from '../store/currencyStore';
import { formatCurrency } from '../utils/currency';

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const { currency } = useCurrencyStore();
  const isIn = transaction.type === 'in';
  const sign = isIn ? '+' : '-';
  const colorClass = isIn ? 'text-green-500' : 'text-red-500';
  const bgClass = isIn ? 'bg-green-500/20' : 'bg-red-500/20';

  const categories = isIn ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const category = categories.find((c) => c.id === transaction.category);
  const isDelivery = transaction.category === 'deliveries' && isIn;

  return (
    <View className="bg-background-card border-b border-border px-6 py-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-4">
          {isDelivery ? (
            // Cleaner view for deliveries - just category and time
            <View>
              <Text className="text-base font-medium text-text mb-1">
                {category?.icon} {category?.label}
              </Text>
              <Text className="text-xs text-text-muted">{formatTime(transaction.timestamp)}</Text>
            </View>
          ) : (
            // Full view for other transactions
            <>
              <View className="flex-row items-center gap-2 mb-1">
                {category && (
                  <Text className="text-base font-medium text-text">
                    {category.icon} {category.label}
                  </Text>
                )}
                {transaction.driverName && (
                  <Text className="text-sm text-text-secondary">• {transaction.driverName}</Text>
                )}
              </View>
              {transaction.description && (
                <Text className="text-xs text-text-muted mb-1">{transaction.description}</Text>
              )}
              <Text className="text-xs text-text-muted">{formatTime(transaction.timestamp)}</Text>
            </>
          )}
        </View>
        <View className={`px-3 py-1 rounded-full ${bgClass}`}>
          <Text className={`text-lg font-semibold ${colorClass}`}>
            {sign}{formatCurrency(transaction.amount, currency)}
          </Text>
        </View>
      </View>
    </View>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}
