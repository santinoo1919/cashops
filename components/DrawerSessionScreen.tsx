import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Keyboard,
  TouchableWithoutFeedback,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerHeader } from "./DrawerHeader";
import { TransactionList } from "./TransactionList";
import { AddTransactionModal } from "./AddTransactionModal";
import { CloseDrawerModal } from "./CloseDrawerModal";
import { useCurrencyStore } from "../store/currencyStore";
import {
  Transaction,
  TransactionType,
  DrawerSession,
  DriverReconciliation,
} from "../types";

interface DrawerSessionScreenProps {
  onSessionComplete: (session: DrawerSession) => void;
  onHistoryPress: () => void;
}

export function DrawerSessionScreen({
  onSessionComplete,
  onHistoryPress,
}: DrawerSessionScreenProps) {
  const { currency } = useCurrencyStore();

  // Internal state - completely self-contained
  const [openingBalance, setOpeningBalance] = useState<number | null>(null);
  const [openingBalanceInput, setOpeningBalanceInput] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [closingBalance, setClosingBalance] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calculate current balance
  const currentBalance =
    openingBalance !== null
      ? parseFloat(
          (
            openingBalance +
            transactions.reduce((sum, t) => {
              return sum + (t.type === "in" ? t.amount : -t.amount);
            }, 0)
          ).toFixed(2)
        )
      : 0;

  // Handle starting a new session
  const handleStartSession = () => {
    Keyboard.dismiss();
    setError(null);

    const balance = parseFloat(openingBalanceInput);

    if (!openingBalanceInput.trim()) {
      setError("Please enter an opening balance");
      return;
    }

    if (isNaN(balance)) {
      setError("Please enter a valid number");
      return;
    }

    if (balance <= 0) {
      setError("Opening balance must be greater than 0");
      return;
    }

    // Start session
    setOpeningBalance(balance);
    setOpeningBalanceInput("");
    setTransactions([]);
    setClosingBalance(null);
  };

  // Handle input change for opening balance
  const handleOpeningBalanceChange = (text: string) => {
    if (error) {
      setError(null);
    }
    const cleaned = text.replace(/[^0-9.]/g, "");
    const parts = cleaned.split(".");
    if (parts.length > 2) {
      return;
    }
    setOpeningBalanceInput(cleaned);
  };

  // Handle adding a transaction
  const handleAddTransaction = (
    type: TransactionType,
    amount: number,
    category: string,
    driverName: string | undefined,
    cashGiven: number | undefined,
    cashChange: number | undefined
  ) => {
    const orderAmount =
      cashGiven !== undefined && cashChange !== undefined
        ? parseFloat((cashGiven - cashChange).toFixed(2))
        : undefined;

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount: parseFloat(amount.toFixed(2)),
      category,
      driverName,
      cashGiven: cashGiven ? parseFloat(cashGiven.toFixed(2)) : undefined,
      cashChange: cashChange ? parseFloat(cashChange.toFixed(2)) : undefined,
      orderAmount,
      timestamp: new Date(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  // Handle closing the drawer
  const handleCloseDrawer = (actualBalance: number) => {
    setShowClosingModal(false);
    setClosingBalance(actualBalance);

    // Calculate totals
    const totalIn = parseFloat(
      transactions
        .filter((t) => t.type === "in")
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    );
    const totalOut = parseFloat(
      transactions
        .filter((t) => t.type === "out")
        .reduce((sum, t) => sum + t.amount, 0)
        .toFixed(2)
    );
    const difference = parseFloat((actualBalance - currentBalance).toFixed(2));

    // Calculate driver reconciliations for session
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

    const driverReconciliations = Object.values(driverMap);

    // Create session object
    const session: DrawerSession = {
      id: Date.now().toString(),
      date: new Date(),
      openingBalance: openingBalance!,
      closingBalance: actualBalance,
      transactions: [...transactions],
      totalIn,
      totalOut,
      difference,
      driverReconciliations:
        driverReconciliations.length > 0 ? driverReconciliations : undefined,
    };

    // Notify parent
    onSessionComplete(session);

    // Reset for next session
    setOpeningBalance(null);
    setOpeningBalanceInput("");
    setTransactions([]);
    setClosingBalance(null);
  };

  // Handle reset (start new session from closed state)
  const handleReset = () => {
    setOpeningBalance(null);
    setOpeningBalanceInput("");
    setTransactions([]);
    setClosingBalance(null);
  };

  // Render opening balance screen
  if (openingBalance === null) {
    const isValid =
      openingBalanceInput.trim() !== "" && parseFloat(openingBalanceInput) > 0;

    return (
      <View className="flex-1 bg-background">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            <View className="flex-1 items-center justify-center px-6">
              <View className="w-full max-w-sm">
                <View className="mb-6">
                  <Text className="text-sm font-medium text-text-secondary mb-2">
                    Opening Balance ({currency})
                  </Text>
                  <TextInput
                    value={openingBalanceInput}
                    onChangeText={handleOpeningBalanceChange}
                    placeholder="500.00"
                    placeholderTextColor="#71717a"
                    keyboardType="decimal-pad"
                    className="bg-background-input border border-border rounded-xl px-4 py-4 text-2xl font-semibold text-text text-center"
                  />
                  {error && (
                    <Text className="text-red-500 text-sm mt-2">{error}</Text>
                  )}
                </View>

                <TouchableOpacity
                  onPress={handleStartSession}
                  disabled={!isValid}
                  className={`bg-accent rounded-xl py-4 items-center ${
                    !isValid ? "opacity-50" : ""
                  }`}
                >
                  <Text className="text-white text-lg font-semibold">
                    Start
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </View>
    );
  }

  // Render active or closed drawer screen
  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1 bg-background"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 16 }}
      >
        <DrawerHeader
          openingBalance={openingBalance}
          currentBalance={currentBalance}
          closingBalance={closingBalance}
          transactions={transactions}
        />
        <TransactionList transactions={transactions} />
      </ScrollView>

      {/* Sticky buttons at bottom */}
      <View className="bg-background border-t border-border px-6 py-4 safe-area-bottom">
        {closingBalance === null ? (
          // Active drawer - show Add Transaction and Close buttons
          <View className="flex-row gap-3">
            <TouchableOpacity
              onPress={() => setShowAddModal(true)}
              className="flex-1 bg-accent rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-semibold">
                Add Transaction
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setShowClosingModal(true)}
              className="px-6 py-4 border border-border-light rounded-xl items-center justify-center"
            >
              <Ionicons name="cash" size={28} color="#fafafa" />
            </TouchableOpacity>
          </View>
        ) : (
          // Closed drawer - show Start New Session button
          <TouchableOpacity onPress={handleReset} className="py-3 items-center">
            <Text className="text-text-secondary font-medium">
              Start New Session
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Add Transaction Modal */}
      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
      />

      {/* Closing Balance Modal */}
      <CloseDrawerModal
        visible={showClosingModal}
        expectedBalance={currentBalance}
        transactions={transactions}
        onClose={() => setShowClosingModal(false)}
        onConfirm={handleCloseDrawer}
      />
    </View>
  );
}
