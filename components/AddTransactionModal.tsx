import { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { TransactionType } from '../types';

interface AddTransactionModalProps {
  visible: boolean;
  onClose: () => void;
  onAdd: (type: TransactionType, amount: number, description: string) => void;
}

export function AddTransactionModal({ visible, onClose, onAdd }: AddTransactionModalProps) {
  const [type, setType] = useState<TransactionType>('out');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0 && description.trim()) {
      onAdd(type, numAmount, description.trim());
      setAmount('');
      setDescription('');
      setType('out');
      onClose();
    }
  };

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setType('out');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1 bg-white"
      >
        <View className="flex-1 bg-white px-6 pt-12 pb-8">
            <View className="flex-row justify-between items-center mb-8">
              <Text className="text-2xl font-bold text-black">New Transaction</Text>
              <TouchableOpacity onPress={handleClose} className="p-2">
                <Text className="text-ios-blue text-base font-medium">Cancel</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row mb-6 bg-gray-100 rounded-xl p-1">
              <TouchableOpacity
                onPress={() => setType('in')}
                className={`flex-1 py-3 rounded-lg ${type === 'in' ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-center font-semibold ${type === 'in' ? 'text-ios-blue' : 'text-gray-600'}`}>
                  Cash In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setType('out')}
                className={`flex-1 py-3 rounded-lg ${type === 'out' ? 'bg-white shadow-sm' : ''}`}
              >
                <Text className={`text-center font-semibold ${type === 'out' ? 'text-ios-blue' : 'text-gray-600'}`}>
                  Cash Out
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Amount (TND)</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                keyboardType="decimal-pad"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-lg font-semibold text-black"
              />
            </View>

            <View className="mb-6">
              <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="e.g., Fuel advance for driver"
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-4 text-base text-black"
                multiline
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              className="bg-ios-blue rounded-xl py-4 items-center"
            >
              <Text className="text-white text-lg font-semibold">Add Transaction</Text>
            </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

