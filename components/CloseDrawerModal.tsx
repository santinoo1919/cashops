import { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TextInput,
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
  // Selected denomination and current input count
  const [selectedDenomination, setSelectedDenomination] = useState<
    50 | 20 | 10 | 5 | 1 | 0.5 | 0.2 | 0.1 | null
  >(null);
  const [currentCount, setCurrentCount] = useState("");

  // Saved counts (what's been added)
  const [savedCounts, setSavedCounts] = useState<{
    [key: number]: number;
  }>({
    50: 0,
    20: 0,
    10: 0,
    5: 0,
    1: 0,
    0.5: 0,
    0.2: 0,
    0.1: 0,
  });

  // Input ref for keyboard
  const inputRef = useRef<TextInput>(null);

  // Reset when modal opens
  useEffect(() => {
    if (visible) {
      setSelectedDenomination(null);
      setCurrentCount("");
      setSavedCounts({
        50: 0,
        20: 0,
        10: 0,
        5: 0,
        1: 0,
        0.5: 0,
        0.2: 0,
        0.1: 0,
      });
    }
  }, [visible]);

  // Focus input when denomination is selected
  useEffect(() => {
    if (selectedDenomination) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [selectedDenomination]);

  // Calculate running total from saved counts
  const calculateRunningTotal = () => {
    const total =
      savedCounts[50] * 50 +
      savedCounts[20] * 20 +
      savedCounts[10] * 10 +
      savedCounts[5] * 5 +
      savedCounts[1] * 1 +
      savedCounts[0.5] * 0.5 +
      savedCounts[0.2] * 0.2 +
      savedCounts[0.1] * 0.1;
    return parseFloat(total.toFixed(2));
  };

  const runningTotal = calculateRunningTotal();
  const difference = runningTotal - expectedBalance;

  // Handle current count input change
  const handleCountInputChange = (value: string) => {
    const cleaned = value.replace(/[^0-9]/g, "");
    setCurrentCount(cleaned);
  };

  // Handle increment
  const handleIncrement = () => {
    if (!selectedDenomination) return;
    const current = parseInt(currentCount) || 0;
    setCurrentCount((current + 1).toString());
  };

  // Handle decrement
  const handleDecrement = () => {
    if (!selectedDenomination) return;
    const current = parseInt(currentCount) || 0;
    if (current > 0) {
      setCurrentCount((current - 1).toString());
    }
  };

  // Handle add button
  const handleAdd = () => {
    if (!selectedDenomination) return;
    const count = parseInt(currentCount) || 0;
    if (count > 0) {
      setSavedCounts((prev) => ({
        ...prev,
        [selectedDenomination]: prev[selectedDenomination] + count,
      }));
      setCurrentCount("");
      setSelectedDenomination(null);
      inputRef.current?.blur();
    }
  };

  // Handle clear saved count
  const handleClearCount = (
    denomination: 50 | 20 | 10 | 5 | 1 | 0.5 | 0.2 | 0.1
  ) => {
    setSavedCounts((prev) => ({
      ...prev,
      [denomination]: 0,
    }));
  };

  // Handle denomination selection
  const handleDenominationSelect = (
    denomination: 50 | 20 | 10 | 5 | 1 | 0.5 | 0.2 | 0.1
  ) => {
    setSelectedDenomination(denomination);
    setCurrentCount("");
  };

  // Handle confirm
  const handleConfirm = () => {
    if (runningTotal >= 0) {
      onConfirm(runningTotal);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    setSelectedDenomination(null);
    setCurrentCount("");
    setSavedCounts({ 50: 0, 20: 0, 10: 0, 5: 0, 1: 0, 0.5: 0, 0.2: 0, 0.1: 0 });
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

            {/* Denomination Selection - 3 columns */}
            <View className="mb-6">
              <Text className="text-sm font-medium text-text-secondary mb-4">
                Select Denomination
              </Text>
              <View className="gap-3">
                {/* First row: 50, 20, 10 */}
                <View className="flex-row gap-3">
                  {([50, 20, 10] as const).map((denom) => {
                    const isSelected = selectedDenomination === denom;
                    return (
                      <TouchableOpacity
                        key={denom}
                        onPress={() => handleDenominationSelect(denom)}
                        className={`flex-1 py-4 rounded-xl items-center justify-center border ${
                          isSelected
                            ? "bg-accent border-accent"
                            : "bg-background-card border-border"
                        }`}
                      >
                        <Text
                          className={`text-lg font-bold ${
                            isSelected ? "text-white" : "text-text"
                          }`}
                        >
                          {denom} TND
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                {/* Second row: 5, 1 */}
                <View className="flex-row gap-3">
                  {([5, 1] as const).map((denom) => {
                    const isSelected = selectedDenomination === denom;
                    return (
                      <TouchableOpacity
                        key={denom}
                        onPress={() => handleDenominationSelect(denom)}
                        className={`flex-1 py-4 rounded-xl items-center justify-center border ${
                          isSelected
                            ? "bg-accent border-accent"
                            : "bg-background-card border-border"
                        }`}
                      >
                        <Text
                          className={`text-lg font-bold ${
                            isSelected ? "text-white" : "text-text"
                          }`}
                        >
                          {denom} TND
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                  {/* Empty space to maintain 3-column layout */}
                  <View className="flex-1" />
                </View>
                {/* Third row: 0.5, 0.2, 0.1 (cents) */}
                <View className="flex-row gap-3">
                  {([0.5, 0.2, 0.1] as const).map((denom) => {
                    const isSelected = selectedDenomination === denom;
                    return (
                      <TouchableOpacity
                        key={denom}
                        onPress={() => handleDenominationSelect(denom)}
                        className={`flex-1 py-4 rounded-xl items-center justify-center border ${
                          isSelected
                            ? "bg-accent border-accent"
                            : "bg-background-card border-border"
                        }`}
                      >
                        <Text
                          className={`text-lg font-bold ${
                            isSelected ? "text-white" : "text-text"
                          }`}
                        >
                          {denom.toFixed(2)} TND
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* Saved Counts Display */}
            {Object.values(savedCounts).some((count) => count > 0) && (
              <View className="mb-6">
                <Text className="text-sm font-medium text-text-secondary mb-3">
                  Counted
                </Text>
                <View className="gap-2">
                  {([50, 20, 10, 5, 1, 0.5, 0.2, 0.1] as const).map((denom) => {
                    const count = savedCounts[denom];
                    if (count === 0) return null;
                    const total = count * denom;
                    return (
                      <View
                        key={denom}
                        className="flex-row justify-between items-center bg-background-card rounded-lg p-3 border border-border"
                      >
                        <View className="flex-1 justify-center">
                          <Text className="text-sm font-semibold text-text">
                            {denom.toFixed(2)} TND × {count}
                          </Text>
                        </View>
                        <View className="flex-row items-center gap-3">
                          <View className="justify-center">
                            <Text className="text-base font-bold text-text">
                              = {total.toFixed(2)} TND
                            </Text>
                          </View>
                          <TouchableOpacity
                            onPress={() => handleClearCount(denom)}
                            className="items-center justify-center"
                          >
                            <Ionicons
                              name="close-circle"
                              size={20}
                              color="#71717a"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

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
              className={`bg-accent rounded-xl py-4 items-center mb-24 ${
                runningTotal < 0 ? "opacity-50" : ""
              }`}
            >
              <Text className="text-white text-lg font-semibold">
                Confirm Close
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Sticky Bottom Container */}
        {selectedDenomination && (
          <View className="absolute bottom-0 left-0 right-0 bg-background border-t border-border px-6 py-4 safe-area-bottom">
            <View className="gap-2">
              <Text className="text-xs text-text-muted text-center">
                {selectedDenomination !== null
                  ? selectedDenomination < 1
                    ? selectedDenomination.toFixed(2) + " TND"
                    : selectedDenomination + " TND"
                  : ""}
              </Text>
              <View className="flex-row items-center gap-3">
                {/* Decrement Button */}
                <TouchableOpacity
                  onPress={handleDecrement}
                  disabled={!currentCount || parseInt(currentCount) === 0}
                  className={`w-12 h-12 rounded-lg items-center justify-center border ${
                    !currentCount || parseInt(currentCount) === 0
                      ? "border-border opacity-30"
                      : "border-border-light"
                  }`}
                >
                  <Ionicons
                    name="remove"
                    size={24}
                    color={
                      !currentCount || parseInt(currentCount) === 0
                        ? "#71717a"
                        : "#fafafa"
                    }
                  />
                </TouchableOpacity>

                {/* Input Field */}
                <TextInput
                  ref={inputRef}
                  value={currentCount}
                  onChangeText={handleCountInputChange}
                  placeholder="0"
                  placeholderTextColor="#71717a"
                  keyboardType="number-pad"
                  className="flex-1 bg-background-input border border-border rounded-lg px-4 text-xl font-bold text-text text-center"
                  style={{ height: 48 }}
                />

                {/* Increment Button */}
                <TouchableOpacity
                  onPress={handleIncrement}
                  className="w-12 h-12 rounded-lg items-center justify-center border border-border-light"
                >
                  <Ionicons name="add" size={24} color="#fafafa" />
                </TouchableOpacity>

                {/* Add Button */}
                <TouchableOpacity
                  onPress={handleAdd}
                  disabled={!currentCount || parseInt(currentCount) === 0}
                  className={`bg-accent rounded-lg px-6 h-12 items-center justify-center ${
                    !currentCount || parseInt(currentCount) === 0
                      ? "opacity-50"
                      : ""
                  }`}
                >
                  <Text className="text-white text-base font-semibold">
                    Add
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}
