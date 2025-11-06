import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { StatusBar } from "expo-status-bar";
import { Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DrawerSessionScreen } from "./components/DrawerSessionScreen";
import { HistoryScreen } from "./components/HistoryScreen";
import { DayDetailModal } from "./components/DayDetailModal";
import { DrawerSession } from "./types";

export default function App() {
  // App-level state: Only history management
  const [historySessions, setHistorySessions] = useState<DrawerSession[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDayDetailModal, setShowDayDetailModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<DrawerSession | null>(
    null
  );

  // Handle completed session - save to history
  const handleSessionComplete = (session: DrawerSession) => {
    setHistorySessions([session, ...historySessions]);
  };

  return (
    <View className="flex-1 bg-background">
      <StatusBar style="light" />
      {/* Persistent Header - Always visible */}
      <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-border">
        <Text className="text-2xl font-bold text-text">OpsCash</Text>
        <TouchableOpacity
          onPress={() => setShowHistoryModal(true)}
          className="p-2"
        >
          <Ionicons name="time" size={28} color="#fafafa" />
        </TouchableOpacity>
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
    </View>
  );
}
