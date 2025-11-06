import { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { CURRENCIES, CurrencyCode } from '../constants/currencies';
import { useCurrencyStore } from '../store/currencyStore';

interface CurrencySettingsModalProps {
  visible: boolean;
  onClose: () => void;
}

export function CurrencySettingsModal({
  visible,
  onClose,
}: CurrencySettingsModalProps) {
  const { currency: selectedCurrency, setCurrency } = useCurrencyStore();

  const handleSelect = async (code: CurrencyCode) => {
    await setCurrency(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row justify-between items-center px-6 pt-12 pb-6 border-b border-border">
          <Text className="text-2xl font-bold text-text">Select Currency</Text>
          <TouchableOpacity onPress={onClose} className="p-2">
            <Text className="text-accent text-base font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        {/* Currency List */}
        <FlatList
          data={CURRENCIES}
          keyExtractor={(item) => item.code}
          renderItem={({ item }) => {
            const isSelected = selectedCurrency === item.code;
            return (
              <TouchableOpacity
                onPress={() => handleSelect(item.code)}
                className={`px-6 py-4 border-b border-border ${
                  isSelected ? 'bg-accent/10' : ''
                }`}
              >
                <View className="flex-row justify-between items-center">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-text">
                      {item.name}
                    </Text>
                    <Text className="text-sm text-text-muted">{item.code}</Text>
                  </View>
                  <View className="flex-row items-center gap-3">
                    <Text className="text-lg text-text">{item.symbol}</Text>
                    {isSelected && (
                      <Text className="text-accent text-lg">✓</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          className="flex-1 bg-background"
        />
      </View>
    </Modal>
  );
}

