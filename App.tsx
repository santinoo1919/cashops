import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerSessionScreen } from "./components/DrawerSessionScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { DayDetailModal } from "./components/DayDetailModal";
import { CurrencySettingsModal } from "./components/CurrencySettingsModal";
import { useCurrencyStore } from "./store/currencyStore";
import { useSessions } from "./store/sessionsStore";
import { DrawerSession } from "./types";

export default function App() {
  // Use sessions with normalized dates (safety net for deserialization)
  const { sessions: historySessions, addSession } = useSessions();
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DrawerSession | null>(
    null
  );

  // Initialize currency store on app start
  const { loadCurrency } = useCurrencyStore();
  useEffect(() => {
    loadCurrency();
  }, [loadCurrency]);

  // Handle completed session - save to history (auto-persisted)
  const handleSessionComplete = (session: DrawerSession) => {
    addSession(session);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      {/* Persistent Header - Always visible */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-border">
        <Text className="text-2xl font-bold text-text">OpsCash</Text>
        <View className="flex-row items-center gap-2">
          <TouchableOpacity
            onPress={() => setShowCurrencyModal(true)}
            className="p-2"
          >
            <Ionicons name="settings" size={28} color="#fafafa" />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowHistoryModal(true)}
            className="p-2"
          >
            <Ionicons name="time" size={28} color="#fafafa" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main session screen - self-contained */}
      <DrawerSessionScreen
        onSessionComplete={handleSessionComplete}
        onHistoryPress={() => setShowHistoryModal(true)}
      />

      {/* History Modal */}
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

      {/* Day Detail Modal */}
      <DayDetailModal
        visible={showDayDetailModal}
        session={selectedSession}
        onClose={() => {
          setShowDayDetailModal(false);
          setSelectedSession(null);
        }}
      />

      {/* Currency Settings Modal */}
      <CurrencySettingsModal
        visible={showCurrencyModal}
        onClose={() => setShowCurrencyModal(false)}
      />
    </View>
  );
}
