import { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Transaction, DriverReconciliation } from "../types";
import { ReconciliationSummary } from "./ReconciliationSummary";

interface CloseDrawerModalProps {
  visible: boolean;
  expectedBalance: number;
  transactions: Transaction[];
  onClose: () => void;
  onConfirm: (actualBalance: number) => void;
}

// Calculate driver reconciliations
const calculateDriverReconciliations = (
  transactions: Transaction[]
): DriverReconciliation[] => {
  const driverMap: { [key: string]: DriverReconciliation } = {};

  transactions.forEach((transaction) => {
    if (
      transaction.category === "deliveries" &&
      transaction.cashGiven !== undefined &&
      transaction.driverName
    ) {
      const driverName = transaction.driverName;
      const orderAmount = transaction.orderAmount || 0;

      if (!driverMap[driverName]) {
        driverMap[driverName] = {
          driverName,
          totalOrders: 0,
          totalCashGiven: 0,
          totalCashChange: 0,
          totalReceived: 0,
          difference: 0,
        };
      }

      driverMap[driverName].totalOrders += orderAmount;
      driverMap[driverName].totalCashGiven += transaction.cashGiven || 0;
      driverMap[driverName].totalCashChange += transaction.cashChange || 0;
      driverMap[driverName].totalReceived +=
        (transaction.cashGiven || 0) - (transaction.cashChange || 0);
    }
  });

  Object.values(driverMap).forEach((recon) => {
    recon.difference = parseFloat(
      (recon.totalReceived - recon.totalOrders).toFixed(2)
    );
  });

  return Object.values(driverMap);
};

export function CloseDrawerModal({
  visible,
  expectedBalance,
  transactions,
  onClose,
  onConfirm,
}: CloseDrawerModalProps) {
  // Denomination counts for physical counting
  const [denominationCounts, setDenominationCounts] = useState({
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
  });

  // Reset counts when modal opens
  useEffect(() => {
    if (visible) {
      setDenominationCounts({ 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 });
    }
  }, [visible]);

  // Calculate running total from denomination counts
  const calculateRunningTotal = () => {
    const total =
      denominationCounts[50] * 50 +
      denominationCounts[20] * 20 +
      denominationCounts[10] * 10 +
      denominationCounts[5] * 5 +
      denominationCounts[1] * 1;
    return parseFloat(total.toFixed(2));
  };

  const runningTotal = calculateRunningTotal();
  const difference = runningTotal - expectedBalance;

  // Handle denomination button tap
  const handleDenominationTap = (denomination: 50 | 20 | 10 | 5 | 1) => {
    setDenominationCounts((prev) => ({
      ...prev,
      [denomination]: prev[denomination] + 1,
    }));
  };

  // Handle removing from denomination count
  const handleDenominationRemove = (denomination: 50 | 20 | 10 | 5 | 1) => {
    if (denominationCounts[denomination] > 0) {
      setDenominationCounts((prev) => ({
        ...prev,
        [denomination]: prev[denomination] - 1,
      }));
    }
  };

  // Handle confirm
  const handleConfirm = () => {
    if (runningTotal >= 0) {
      onConfirm(runningTotal);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setDenominationCounts({ 50: 0, 20: 0, 10: 0, 5: 0, 1: 0 });
    onClose();
  };

  const driverReconciliations = calculateDriverReconciliations(transactions);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 bg-background"
      >
        <ScrollView
          className="flex-1 bg-background"
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingTop: 48,
            paddingBottom: 32,
          }}
        >
          <View>
            {/* Header */}
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold text-text">Close Drawer</Text>
              <TouchableOpacity onPress={handleCancel} className="p-2">
                <Text className="text-accent text-base font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>

            {/* Side by side Expected vs Actual */}
            <View className="flex-row gap-4 mb-6">
              <View className="flex-1 bg-background-card rounded-xl p-4 border border-border">
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-2">
                  Expected
                </Text>
                <Text className="text-2xl font-bold text-text">
                  {expectedBalance.toFixed(2)} TND
                </Text>
              </View>
              <View className="flex-1 bg-background-card rounded-xl p-4 border border-border">
                <Text className="text-xs text-text-muted uppercase tracking-wide mb-2">
                  Actual
                </Text>
                <Text className="text-2xl font-bold text-accent">
                  {runningTotal.toFixed(2)} TND
                </Text>
              </View>
            </View>

            {/* Difference Display */}
            <View className="mb-6">
              <View className="flex-row justify-between items-center bg-background-card rounded-xl p-4 border border-border">
                <Text className="text-sm font-medium text-text-secondary">
                  Difference
                </Text>
                <Text
                  className={`text-xl font-bold ${
                    difference === 0
                      ? "text-green-500"
                      : difference > 0
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {difference >= 0 ? "+" : ""}
                  {difference.toFixed(2)} TND
                </Text>
              </View>
            </View>

            {/* Denomination Counting Buttons */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text-secondary mb-4">
                Count Bills & Coins
              </Text>
              <View className="gap-3">
                {([50, 20, 10, 5, 1] as const).map((denom) => {
                  const count = denominationCounts[denom];
                  const total = count * denom;
                  return (
                    <View
                      key={denom}
                      className="flex-row items-center gap-3 bg-background-card rounded-xl p-4 border border-border"
                    >
                      <TouchableOpacity
                        onPress={() => handleDenominationRemove(denom)}
                        disabled={count === 0}
                        className={`w-10 h-10 rounded-lg items-center justify-center border ${
                          count === 0
                            ? "border-border opacity-30"
                            : "border-border-light"
                        }`}
                      >
                        <Ionicons
                          name="remove"
                          size={20}
                          color={count === 0 ? "#71717a" : "#fafafa"}
                        />
                      </TouchableOpacity>

                      <TouchableOpacity
                        onPress={() => handleDenominationTap(denom)}
                        className="flex-1 bg-accent rounded-xl py-4 items-center"
                      >
                        <Text className="text-white text-xl font-bold">
                          {denom} TND
                        </Text>
                      </TouchableOpacity>

                      <View className="w-20 items-end">
                        {count > 0 && (
                          <>
                            <Text className="text-xs text-text-muted">
                              {count} × {denom}
                            </Text>
                            <Text className="text-base font-semibold text-text">
                              {total.toFixed(2)} TND
                            </Text>
                          </>
                        )}
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Driver Reconciliations */}
            {driverReconciliations.length > 0 && (
              <View className="mb-6">
                <ReconciliationSummary
                  reconciliations={driverReconciliations}
                />
              </View>
            )}

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={runningTotal < 0}
              className={`bg-accent rounded-xl py-4 items-center mb-8 ${
                runningTotal < 0 ? "opacity-50" : ""
              }`}
            >
              <Text className="text-white text-lg font-semibold">
                Confirm Close
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
