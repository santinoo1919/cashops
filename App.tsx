import { useState } from "react";
import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { DrawerHeader } from "./components/DrawerHeader";
import { TransactionList } from "./components/TransactionList";
import { AddTransactionModal } from "./components/AddTransactionModal";
import { HistoryScreen } from "./components/HistoryScreen";
import { DayDetailModal } from "./components/DayDetailModal";
import { Transaction, TransactionType, DrawerSession } from "./types";

export default function App() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openingBalance, setOpeningBalance] = useState("");
  const [closingBalance, setClosingBalance] = useState<number | null>(null);
  const [closingBalanceInput, setClosingBalanceInput] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DrawerSession | null>(
    null
  );
  const [historySessions, setHistorySessions] = useState<DrawerSession[]>([]);

  const currentBalance = isDrawerOpen
    ? parseFloat(openingBalance) +
      transactions.reduce((sum, t) => {
        return sum + (t.type === "in" ? t.amount : -t.amount);
      }, 0)
    : 0;

  const handleOpenDrawer = () => {
    const balance = parseFloat(openingBalance);
    if (balance > 0) {
      setIsDrawerOpen(true);
      setTransactions([]);
      setClosingBalance(null);
      setClosingBalanceInput("");
    }
  };

  const handleCloseDrawer = () => {
    const balance = parseFloat(closingBalanceInput);
    if (balance >= 0) {
      setShowClosingModal(false);

      // Save session to history
      const totalIn = transactions
        .filter((t) => t.type === "in")
        .reduce((sum, t) => sum + t.amount, 0);
      const totalOut = transactions
        .filter((t) => t.type === "out")
        .reduce((sum, t) => sum + t.amount, 0);
      const difference = balance - currentBalance;

      const session: DrawerSession = {
        id: Date.now().toString(),
        date: new Date(),
        openingBalance: parseFloat(openingBalance),
        closingBalance: balance,
        transactions: [...transactions],
        totalIn,
        totalOut,
        difference,
      };

      setHistorySessions([session, ...historySessions]);

      // Automatically reset and show new drawer screen
      handleReset();
    }
  };

  const handleAddTransaction = (
    type: TransactionType,
    amount: number,
    description: string
  ) => {
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type,
      amount,
      description,
      timestamp: new Date(),
    };
    setTransactions([newTransaction, ...transactions]);
  };

  const handleReset = () => {
    setIsDrawerOpen(false);
    setOpeningBalance("");
    setClosingBalance(null);
    setClosingBalanceInput("");
    setTransactions([]);
  };

  if (!isDrawerOpen) {
    return (
      <View className="flex-1 bg-white">
        <StatusBar style="dark" />
        <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-gray-200">
          <Text className="text-2xl font-bold text-black">Ops Cash Drawer</Text>
          <TouchableOpacity
            onPress={() => setShowHistoryModal(true)}
            className="p-2"
          >
            <Text className="text-2xl">📊</Text>
          </TouchableOpacity>
        </View>
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-full max-w-sm">
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Opening Balance (TND)
              </Text>
              <TextInput
                value={openingBalance}
                onChangeText={setOpeningBalance}
                placeholder="500.00"
                keyboardType="decimal-pad"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-2xl font-semibold text-black text-center"
              />
            </View>

            <TouchableOpacity
              onPress={handleOpenDrawer}
              disabled={!openingBalance || parseFloat(openingBalance) <= 0}
              className={`bg-ios-blue rounded-xl py-4 items-center ${
                !openingBalance || parseFloat(openingBalance) <= 0
                  ? "opacity-50"
                  : ""
              }`}
            >
              <Text className="text-white text-lg font-semibold">Start</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Modal
          visible={showHistoryModal}
          animationType="slide"
          presentationStyle="fullScreen"
          onRequestClose={() => setShowHistoryModal(false)}
        >
          <HistoryScreen
            sessions={historySessions}
            onClose={() => setShowHistoryModal(false)}
            onDayPress={(session) => {
              setSelectedSession(session);
              setShowHistoryModal(false);
              setShowDayDetailModal(true);
            }}
          />
        </Modal>

        <DayDetailModal
          visible={showDayDetailModal}
          session={selectedSession}
          onClose={() => {
            setShowDayDetailModal(false);
            setSelectedSession(null);
          }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <StatusBar style="dark" />
      <DrawerHeader
        openingBalance={parseFloat(openingBalance)}
        currentBalance={currentBalance}
        closingBalance={closingBalance}
        onHistoryPress={() => setShowHistoryModal(true)}
      />
      <TransactionList transactions={transactions} />
      <View className="bg-white border-t border-gray-200 px-6 py-4 safe-area-bottom">
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={() => setShowAddModal(true)}
            className="flex-1 bg-ios-blue rounded-xl py-4 items-center"
          >
            <Text className="text-white text-lg font-semibold">
              Add Transaction
            </Text>
          </TouchableOpacity>
          {closingBalance === null && (
            <TouchableOpacity
              onPress={() => setShowClosingModal(true)}
              className="px-6 py-4 border border-gray-300 rounded-xl"
            >
              <Text className="text-black font-semibold">Close</Text>
            </TouchableOpacity>
          )}
        </View>
        {closingBalance !== null && (
          <TouchableOpacity
            onPress={handleReset}
            className="mt-3 py-3 items-center"
          >
            <Text className="text-gray-600 font-medium">Start New Session</Text>
          </TouchableOpacity>
        )}
      </View>

      <AddTransactionModal
        visible={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddTransaction}
      />

      <Modal
        visible={showClosingModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowClosingModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 bg-white"
        >
          <View className="flex-1 bg-white px-6 pt-12 pb-8">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold text-black">
                Close Drawer
              </Text>
              <TouchableOpacity
                onPress={() => setShowClosingModal(false)}
                className="p-2"
              >
                <Text className="text-ios-blue text-base font-medium">
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Expected Balance
              </Text>
              <Text className="text-2xl font-semibold text-black mb-4">
                {currentBalance.toFixed(2)} TND
              </Text>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Actual Counted Balance (TND)
              </Text>
              <TextInput
                value={closingBalanceInput}
                onChangeText={setClosingBalanceInput}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg font-semibold text-black"
              />
            </View>
            <TouchableOpacity
              onPress={handleCloseDrawer}
              className="bg-ios-blue rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-semibold">
                Confirm Close
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal
        visible={showHistoryModal}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowHistoryModal(false)}
      >
        <HistoryScreen
          sessions={historySessions}
          onClose={() => setShowHistoryModal(false)}
          onDayPress={(session) => {
            setSelectedSession(session);
            setShowHistoryModal(false);
            setShowDayDetailModal(true);
          }}
        />
      </Modal>

      <DayDetailModal
        visible={showDayDetailModal}
        session={selectedSession}
        onClose={() => {
          setShowDayDetailModal(false);
          setSelectedSession(null);
        }}
      />
    </View>
  );
}
