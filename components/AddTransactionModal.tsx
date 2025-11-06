import { useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { TransactionType } from "../types";
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "../constants/categories";
import { useCurrencyStore } from "../store/currencyStore";

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (
    type: TransactionType,
    amount: number,
    category: string,
    driverName: string | undefined,
    cashGiven: number | undefined,
    cashChange: number | undefined
  ) => void;
}

// Helper to format amount to 2 decimals as user types
const formatAmount = (value: string): string => {
  // Remove non-numeric characters except decimal point
  const cleaned = value.replace(/[^0-9.]/g, "");

  // Split by decimal point
  const parts = cleaned.split(".");

  // If no decimal point, return as is
  if (parts.length === 1) {
    return cleaned;
  }

  // Limit to 2 decimal places
  if (parts[1].length > 2) {
    return parts[0] + "." + parts[1].substring(0, 2);
  }

  return cleaned;
};

export function AddTransactionModal({
  visible,
  onClose,
  onAdd,
}: AddTransactionModalProps) {
  const { currency } = useCurrencyStore();

  const [type, setType] = useState<TransactionType>("out");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>("");
  const [driverName, setDriverName] = useState("");
  const [cashGiven, setCashGiven] = useState("");
  const [cashChange, setCashChange] = useState("");
  const [showReconciliation, setShowReconciliation] = useState(false);

  const categories = type === "in" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Calculate order amount: cashGiven - cashChange
  const calculatedOrderAmount =
    cashGiven && cashChange
      ? (parseFloat(cashGiven) - parseFloat(cashChange)).toFixed(2)
      : "";

  const handleSubmit = () => {
    const numAmount = parseFloat(amount || "0");
    if (numAmount > 0 && category) {
      const cashGivenNum = cashGiven ? parseFloat(cashGiven) : undefined;
      const cashChangeNum = cashChange ? parseFloat(cashChange) : undefined;

      onAdd(
        type,
        parseFloat(numAmount.toFixed(2)),
        category,
        driverName.trim() || undefined,
        cashGivenNum ? parseFloat(cashGivenNum.toFixed(2)) : undefined,
        cashChangeNum ? parseFloat(cashChangeNum.toFixed(2)) : undefined
      );

      // Reset form
      setAmount("");
      setCategory("");
      setDriverName("");
      setCashGiven("");
      setCashChange("");
      setShowReconciliation(false);
      setType("out");
      onClose();
    }
  };

  const handleClose = () => {
    setAmount("");
    setCategory("");
    setDriverName("");
    setCashGiven("");
    setCashChange("");
    setShowReconciliation(false);
    setType("out");
    onClose();
  };

  const handleCategoryChange = (catId: string) => {
    setCategory(catId);
    // Show reconciliation for delivery-related transactions
    if (catId === "deliveries" && type === "in") {
      setShowReconciliation(true);
    } else {
      setShowReconciliation(false);
      setCashGiven("");
      setCashChange("");
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
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
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <View className="flex-row justify-between items-center mb-8">
                <Text className="text-2xl font-bold text-text">
                  New Transaction
                </Text>
                <TouchableOpacity onPress={handleClose} className="p-2">
                  <Text className="text-accent text-base font-medium">
                    Cancel
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="flex-row mb-6 bg-zinc-800 rounded-xl p-1">
                <TouchableOpacity
                  onPress={() => {
                    setType("in");
                    setCategory("");
                    setShowReconciliation(false);
                  }}
                  className={`flex-1 py-3 rounded-lg ${
                    type === "in" ? "bg-background-card shadow-sm" : ""
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      type === "in" ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    Cash In
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    setType("out");
                    setCategory("");
                    setShowReconciliation(false);
                  }}
                  className={`flex-1 py-3 rounded-lg ${
                    type === "out" ? "bg-background-card shadow-sm" : ""
                  }`}
                >
                  <Text
                    className={`text-center font-semibold ${
                      type === "out" ? "text-accent" : "text-text-secondary"
                    }`}
                  >
                    Cash Out
                  </Text>
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-text-secondary mb-2">
                  Amount ({currency})
                </Text>
                <TextInput
                  value={amount}
                  onChangeText={(text) => setAmount(formatAmount(text))}
                  placeholder="0.00"
                  placeholderTextColor="#71717a"
                  keyboardType="decimal-pad"
                  className="bg-background-input border border-border rounded-xl px-4 py-4 text-lg font-semibold text-text"
                />
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-text-secondary mb-2">
                  Category
                </Text>
                <View className="flex-row flex-wrap gap-2">
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => handleCategoryChange(cat.id)}
                      className={`px-4 py-2 rounded-lg border ${
                        category === cat.id
                          ? "bg-accent border-accent"
                          : "bg-background-card border-border"
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          category === cat.id ? "text-white" : "text-text"
                        }`}
                      >
                        {cat.icon} {cat.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View className="mb-4">
                <Text className="text-sm font-medium text-text-secondary mb-2">
                  Driver Name (Optional)
                </Text>
                <TextInput
                  value={driverName}
                  onChangeText={setDriverName}
                  placeholder="Enter driver name"
                  placeholderTextColor="#71717a"
                  className="bg-background-input border border-border rounded-xl px-4 py-3 text-base text-text"
                />
              </View>

              {showReconciliation && (
                <View className="mb-4 p-4 bg-accent/20 rounded-xl border border-accent">
                  <Text className="text-sm font-semibold text-text mb-3">
                    Order Reconciliation
                  </Text>

                  <View className="mb-3">
                    <Text className="text-xs text-text-secondary mb-1">
                      Cash Given to Driver ({currency})
                    </Text>
                    <TextInput
                      value={cashGiven}
                      onChangeText={(text) => setCashGiven(formatAmount(text))}
                      placeholder="0.00"
                      placeholderTextColor="#71717a"
                      keyboardType="decimal-pad"
                      className="bg-background-input border border-border rounded-lg px-3 py-2 text-base text-text"
                    />
                  </View>

                  <View className="mb-3">
                    <Text className="text-xs text-text-secondary mb-1">
                      Cash Change to Customer ({currency})
                    </Text>
                    <TextInput
                      value={cashChange}
                      onChangeText={(text) => setCashChange(formatAmount(text))}
                      placeholder="0.00"
                      placeholderTextColor="#71717a"
                      keyboardType="decimal-pad"
                      className="bg-background-input border border-border rounded-lg px-3 py-2 text-base text-text"
                    />
                  </View>

                  {calculatedOrderAmount && (
                    <View className="mb-2 p-3 bg-zinc-800 rounded-lg">
                      <Text className="text-xs text-text-secondary mb-1">
                        Order Amount (Calculated)
                      </Text>
                      <Text className="text-base font-semibold text-text">
                        {calculatedOrderAmount} {currency}
                      </Text>
                      <Text className="text-xs text-text-muted mt-1">
                        Cash Given - Cash Change
                      </Text>
                    </View>
                  )}
                </View>
              )}

              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!amount || !category}
                className={`bg-accent rounded-xl py-4 items-center mt-4 ${
                  !amount || !category ? "opacity-50" : ""
                }`}
              >
                <Text className="text-white text-lg font-semibold">
                  Add Transaction
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
}
