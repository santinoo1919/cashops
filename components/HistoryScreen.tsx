import { useState, useEffect } from "react";
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { DrawerSession } from "../types";
import { useCurrencyStore } from "../store/currencyStore";
import { useExportStore } from "../store/exportStore";
import { formatCurrency } from "../utils/currency";
import {
  exportSessionsToCSV,
  filterSessionsSinceDate,
} from "../utils/csvExport";

interface HistoryScreenProps {
  sessions: DrawerSession[];
  onClose: () => void;
  onDayPress: (session: DrawerSession) => void;
}

export function HistoryScreen({
  sessions,
  onClose,
  onDayPress,
}: HistoryScreenProps) {
  const groupedSessions = groupSessionsByDate(sessions);
  const { lastExportDate, loadLastExportDate, setLastExportDate } =
    useExportStore();
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [isExportingNew, setIsExportingNew] = useState(false);

  useEffect(() => {
    loadLastExportDate();
  }, [loadLastExportDate]);

  const handleExportAll = async () => {
    if (sessions.length === 0) {
      Alert.alert("No Data", "There are no sessions to export.");
      return;
    }

    setIsExportingAll(true);
    try {
      await exportSessionsToCSV(sessions, "opscash-export-all");
      await setLastExportDate(new Date());
      Alert.alert("Success", "All sessions exported successfully!");
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Failed",
        error instanceof Error ? error.message : "Failed to export sessions."
      );
    } finally {
      setIsExportingAll(false);
    }
  };

  const handleExportNew = async () => {
    const newSessions = filterSessionsSinceDate(sessions, lastExportDate);

    if (newSessions.length === 0) {
      Alert.alert(
        "No New Data",
        lastExportDate
          ? "There are no new sessions since your last export."
          : "Export all sessions first to enable incremental exports."
      );
      return;
    }

    setIsExportingNew(true);
    try {
      await exportSessionsToCSV(newSessions, "opscash-export-new");
      await setLastExportDate(new Date());
      Alert.alert(
        "Success",
        `${newSessions.length} new session(s) exported successfully!`
      );
    } catch (error) {
      console.error("Export error:", error);
      Alert.alert(
        "Export Failed",
        error instanceof Error ? error.message : "Failed to export sessions."
      );
    } finally {
      setIsExportingNew(false);
    }
  };

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
          <Text className="text-text-muted text-base mb-2">
            No sessions yet
          </Text>
          <Text className="text-text-secondary text-sm">
            Close a drawer to see history
          </Text>
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

      {/* Export Buttons Section */}
      <View className="px-6 py-4 border-b border-border bg-background">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={handleExportNew}
            disabled={isExportingNew || isExportingAll}
            className={`flex-1 py-3 rounded-lg border items-center justify-center ${
              isExportingNew || isExportingAll
                ? "bg-background-card border-border opacity-50"
                : "bg-background-card border-border"
            }`}
          >
            {isExportingNew ? (
              <ActivityIndicator size="small" color="#fafafa" />
            ) : (
              <Text className="text-text text-base font-medium">
                Export New
              </Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleExportAll}
            disabled={isExportingNew || isExportingAll}
            className={`flex-1 py-3 rounded-lg border items-center justify-center ${
              isExportingNew || isExportingAll
                ? "bg-background-card border-border opacity-50"
                : "bg-background-card border-border"
            }`}
          >
            {isExportingAll ? (
              <ActivityIndicator size="small" color="#fafafa" />
            ) : (
              <Text className="text-text text-base font-medium">
                Export All
              </Text>
            )}
          </TouchableOpacity>
        </View>
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
  const { currency } = useCurrencyStore();
  const totalIn = sessions.reduce((sum, s) => sum + s.totalIn, 0);
  const totalOut = sessions.reduce((sum, s) => sum + s.totalOut, 0);
  const netFlow = totalIn - totalOut;

  // Calculate expected vs actual for reconciliation
  const totalExpected = sessions.reduce((sum, s) => {
    const expected = s.openingBalance + s.totalIn - s.totalOut;
    return sum + expected;
  }, 0);
  const totalActual = sessions.reduce((sum, s) => sum + s.closingBalance, 0);
  const totalDifference = totalActual - totalExpected; // Cashier reconciliation

  const totalOpening = sessions.reduce((sum, s) => sum + s.openingBalance, 0);
  const totalClosed = sessions.reduce((sum, s) => sum + s.closingBalance, 0);
  const drawersClosed = sessions.length;

  // Check if there are driver reconciliations
  const hasDriverReconciliations = sessions.some(
    (s) => s.driverReconciliations && s.driverReconciliations.length > 0
  );
  const totalDriverDifferences = sessions.reduce((sum, s) => {
    if (s.driverReconciliations) {
      return (
        sum + s.driverReconciliations.reduce((ds, d) => ds + d.difference, 0)
      );
    }
    return sum;
  }, 0);

  // Determine status badge
  const isPerfect = totalDifference === 0;
  const hasDiscrepancy = Math.abs(totalDifference) > 0.01; // Account for floating point

  return (
    <TouchableOpacity
      onPress={onPress}
      className="bg-background-card border-b border-border px-6 py-4 active:bg-zinc-800"
    >
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1">
          <Text className="text-base font-semibold text-text mb-1">
            {formatDate(date)}
          </Text>
          <Text className="text-xs text-text-muted">
            {drawersClosed} drawer{drawersClosed > 1 ? "s" : ""} •{" "}
            {sessions.reduce((sum, s) => sum + s.transactions.length, 0)}{" "}
            transactions
          </Text>
        </View>
        {isPerfect && (
          <View className="bg-green-500/20 px-2 py-1 rounded">
            <Text className="text-xs font-semibold text-green-500">
              ✓ Balanced
            </Text>
          </View>
        )}
        {hasDiscrepancy && (
          <View
            className={`px-2 py-1 rounded ${
              totalDifference > 0 ? "bg-yellow-500/20" : "bg-red-500/20"
            }`}
          >
            <Text
              className={`text-xs font-semibold ${
                totalDifference > 0 ? "text-yellow-500" : "text-red-500"
              }`}
            >
              {totalDifference > 0 ? "↑ Over" : "↓ Short"}
            </Text>
          </View>
        )}
      </View>

      {/* Cashier Reconciliation - Above counters */}
      <View className="flex-row justify-between items-center mb-3">
        <View className="flex-1">
          <Text className="text-xs text-text-muted uppercase tracking-wide mb-0.5">
            Cashier Reconciliation
          </Text>
          <Text className="text-xs text-text-secondary">
            Expected: {formatCurrency(totalExpected, currency)}
          </Text>
        </View>
        <View className="items-end">
          <Text
            className={`text-lg font-bold ${
              totalDifference === 0
                ? "text-green-500"
                : totalDifference > 0
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {totalDifference === 0 ? "✓" : totalDifference > 0 ? "+" : ""}
            {formatCurrency(Math.abs(totalDifference), currency)}
          </Text>
          {totalDifference !== 0 && (
            <Text className="text-xs text-text-muted mt-0.5">
              {totalDifference > 0 ? "Overage" : "Shortage"}
            </Text>
          )}
        </View>
      </View>

      {/* Main Metrics - Side by side */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1 bg-background rounded-lg p-3 border border-border">
          <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">
            Opening
          </Text>
          <Text className="text-base font-bold text-text">
            {formatCurrency(totalOpening, currency)}
          </Text>
        </View>
        <View className="flex-1 bg-background rounded-lg p-3 border border-border">
          <Text className="text-xs text-text-muted uppercase tracking-wide mb-1">
            Closing
          </Text>
          <Text className="text-base font-bold text-text">
            {formatCurrency(totalClosed, currency)}
          </Text>
        </View>
      </View>

      {/* Cash Flow */}
      <View className="flex-row gap-3 mb-3">
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Cash In</Text>
          <Text className="text-sm font-semibold text-green-500">
            {formatCurrency(totalIn, currency)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Cash Out</Text>
          <Text className="text-sm font-semibold text-red-500">
            {formatCurrency(totalOut, currency)}
          </Text>
        </View>
        <View className="flex-1">
          <Text className="text-xs text-text-muted mb-1">Net Flow</Text>
          <Text
            className={`text-sm font-semibold ${
              netFlow >= 0 ? "text-green-500" : "text-red-500"
            }`}
          >
            {netFlow >= 0 ? "+" : ""}
            {formatCurrency(netFlow, currency)}
          </Text>
        </View>
      </View>

      {/* Driver Reconciliations Summary */}
      {hasDriverReconciliations && (
        <View className="bg-background rounded-lg p-2 border border-border/50">
          <View className="flex-row justify-between items-center">
            <Text className="text-xs text-text-muted">
              Driver Reconciliations
            </Text>
            <Text
              className={`text-xs font-semibold ${
                totalDriverDifferences === 0
                  ? "text-text"
                  : totalDriverDifferences > 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {totalDriverDifferences >= 0 ? "+" : ""}
              {formatCurrency(totalDriverDifferences, currency)}
            </Text>
          </View>
        </View>
      )}
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
  return date.toISOString().split("T")[0];
}

function formatDate(dateKey: string): string {
  const date = new Date(dateKey);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (dateKey === formatDateKey(today)) {
    return "Today";
  } else if (dateKey === formatDateKey(yesterday)) {
    return "Yesterday";
  } else {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  }
}
