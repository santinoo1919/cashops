import { FlatList, View, Text, TouchableOpacity } from 'react-native';
import { DrawerSession } from '../types';

interface HistoryScreenProps {
  sessions: DrawerSession[];
  onClose: () => void;
  onDayPress: (session: DrawerSession) => void;
}

export function HistoryScreen({ sessions, onClose, onDayPress }: HistoryScreenProps) {
  const groupedSessions = groupSessionsByDate(sessions);

  if (sessions.length === 0) {
    return (
      <View className="flex-1 bg-background">
        <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-border">
          <Text className="text-2xl font-bold text-text">History</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-accent text-base font-medium">Close</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-text-muted text-base mb-2">No sessions yet</Text>
          <Text className="text-text-secondary text-sm">Close a drawer to see history</Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background dark">
      <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-border">
        <Text className="text-2xl font-bold text-text">History</Text>
        <TouchableOpacity onPress={onClose} className="p-2">
          <Text className="text-accent text-base font-medium">Close</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={groupedSessions}
        keyExtractor={(item) => item.date}
        renderItem={({ item }) => (
          <DayItem
            date={item.date}
            sessions={item.sessions}
            onPress={() => onDayPress(item.sessions[0])}
          />
        )}
        className="flex-1 bg-background"
      />
    </View>
  );
}

interface DayItemProps {
  date: string;
  sessions: DrawerSession[];
  onPress: () => void;
}

function DayItem({ date, sessions, onPress }: DayItemProps) {
  const totalIn = sessions.reduce((sum, s) => sum + s.totalIn, 0);
  const totalOut = sessions.reduce((sum, s) => sum + s.totalOut, 0);
  const netFlow = totalIn - totalOut;
  const totalDifference = sessions.reduce((sum, s) => sum + s.difference, 0);
  const totalClosed = sessions.reduce((sum, s) => sum + s.closingBalance, 0);
  const drawersClosed = sessions.length;

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-background-card border-b border-border px-6 py-4 active:bg-zinc-800"
    >
      <View className="flex-row justify-between items-start mb-2">
        <View className="flex-1">
          <Text className="text-base font-semibold text-text mb-1">{formatDate(date)}</Text>
          <Text className="text-xs text-text-muted">{drawersClosed} drawer{drawersClosed > 1 ? 's' : ''} closed</Text>
        </View>
        <View className="items-end">
          <Text className={`text-lg font-bold ${netFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
          </Text>
        </View>
      </View>
      <View className="flex-row gap-4 mt-3">
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Cash In</Text>
          <Text className="text-sm font-semibold text-green-500">{formatCurrency(totalIn)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Cash Out</Text>
          <Text className="text-sm font-semibold text-red-500">{formatCurrency(totalOut)}</Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Closed</Text>
          <Text className="text-sm font-semibold text-text">{formatCurrency(totalClosed)}</Text>
        </View>
      </View>
      <View className="flex-row gap-4 mt-2">
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Difference</Text>
          <Text className={`text-sm font-semibold ${totalDifference === 0 ? 'text-text' : totalDifference > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalDifference >= 0 ? '+' : ''}{formatCurrency(totalDifference)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function groupSessionsByDate(sessions: DrawerSession[]) {
  const grouped: { [key: string]: DrawerSession[] } = {};
  
  sessions.forEach((session) => {
    const dateKey = formatDateKey(session.date);
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    grouped[dateKey].push(session);
  });

  return Object.entries(grouped)
    .map(([date, sessions]) => ({ date, sessions }))
    .sort((a, b) => b.date.localeCompare(a.date));
}

function formatDateKey(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDate(dateKey: string): string {
  const date = new Date(dateKey);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateKey === formatDateKey(today)) {
    return 'Today';
  } else if (dateKey === formatDateKey(yesterday)) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
}

function formatCurrency(amount: number): string {
  return `${amount.toFixed(2)} TND`;
}

