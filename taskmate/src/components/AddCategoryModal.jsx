import { useState } from 'react';
import { Modal, View, Text, TextInput, Button, StyleSheet, Alert, Pressable } from 'react-native';

export default function AddCategoryModal({ visible, onClose, onSubmit, suggestedColor }) {
  const [name, setName] = useState('');

  const handleSave = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      Alert.alert('Validasi', 'Nama kategori tidak boleh kosong.');
      return;
    }
    onSubmit?.({ key: trimmed, color: suggestedColor });
    setName('');
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.card}>
          <Text style={styles.title}>Tambah Kategori Baru</Text>

          <TextInput
            style={styles.input}
            placeholder="Contoh: Kuliah"
            value={name}
            onChangeText={setName}
            autoFocus={true}
          />

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <Button title="Batal" onPress={onClose} color="#64748b" />
            <Button title="Simpan" onPress={handleSave} />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  card: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    gap: 12,
  },
  title: { fontSize: 16, fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 8, padding: 10 },
});