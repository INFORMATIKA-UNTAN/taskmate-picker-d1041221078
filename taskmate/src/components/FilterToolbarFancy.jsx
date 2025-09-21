import { useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, FlatList,
  SafeAreaView, StyleSheet, Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

function Pill({ label, value, onPress }) {
  return (
    <TouchableOpacity style={styles.pill} onPress={onPress}>
      <View>
        <Text style={styles.pillLabel}>{label}</Text>
        <Text style={styles.pillValue} numberOfLines={1}>{value}</Text>
      </View>
      <Ionicons name="chevron-down" size={16} color="#64748b" />
    </TouchableOpacity>
  );
}

function BottomPicker({ visible, title, options = [], current, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <SafeAreaView style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close-circle" size={24} color="#94a3b8" />
            </TouchableOpacity>
          </View>
          <FlatList
            data={options}
            keyExtractor={(it) => String(it.value)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const selected = item.value === current;
              return (
                <TouchableOpacity
                  style={[styles.optionRow, selected && styles.optionRowActive]}
                  onPress={() => { onSelect?.(item.value); onClose?.(); }}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextActive]}>
                    {item.label}
                  </Text>
                  {selected ? <Ionicons name="checkmark-circle" size={20} color="#0ea5e9" /> : null}
                </TouchableOpacity>
              );
            }}
            ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
            contentContainerStyle={{ paddingBottom: 16 }}
          />
        </SafeAreaView>
      </Pressable>
    </Modal>
  );
}

export default function FilterToolbarFancy({
  categories = [],
  categoryFilter, setCategoryFilter,
  statusFilter, setStatusFilter,
  priorityFilter, setPriorityFilter,
}) {
  const [open, setOpen] = useState(null);

  const catOptions = useMemo(() => ([
    { label: 'All Categories', value: 'all' },
    ...categories.map(c => ({ label: c.key, value: c.key }))
  ]), [categories]);

  const statusOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'To Do', value: 'todo' },
    { label: 'Pending', value: 'pending' },
    { label: 'Done', value: 'done' },
  ];

  const prioOptions = [
    { label: 'All Priorities', value: 'all' },
    { label: 'High', value: 'High' },
    { label: 'Medium', value: 'Medium' },
    { label: 'Low', value: 'Low' },
  ];

  const catValueText = categoryFilter === 'all' ? 'All Categories' : categoryFilter;

  const statusValueText = useMemo(() => {
    const selected = statusOptions.find(opt => opt.value === statusFilter);
    return selected ? selected.label : 'All Status';
  }, [statusFilter]);
  
  const prioValueText = priorityFilter === 'all' ? 'All Priorities' : priorityFilter;

  return (
    <View style={styles.wrap}>
      <Pill label="Category" value={catValueText} onPress={() => setOpen('cat')} />
      <Pill label="Status" value={statusValueText} onPress={() => setOpen('status')} />
      <Pill label="Priority" value={prioValueText} onPress={() => setOpen('prio')} />

      <BottomPicker
        visible={open === 'cat'}
        title="Select Category"
        options={catOptions}
        current={categoryFilter}
        onSelect={setCategoryFilter}
        onClose={() => setOpen(null)}
      />

      <BottomPicker
        visible={open === 'status'}
        title="Select Status"
        options={statusOptions}
        current={statusFilter}
        onSelect={setStatusFilter}
        onClose={() => setOpen(null)}
      />

      <BottomPicker
        visible={open === 'prio'}
        title="Select Priority"
        options={prioOptions}
        current={priorityFilter}
        onSelect={setPriorityFilter}
        onClose={() => setOpen(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 6,
    backgroundColor: '#fff', borderRadius: 20,
    paddingVertical: 10, paddingHorizontal: 12,
    borderWidth: 1, borderColor: '#e2e8f0',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 6, shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  pillLabel: { fontSize: 12, color: '#64748b', fontWeight: '600' },
  pillValue: { fontSize: 13, color: '#0f172a', fontWeight: '700' },
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.25)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#fff', borderTopLeftRadius: 16, borderTopRightRadius: 16, padding: 16, maxHeight: '60%' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  sheetTitle: { fontSize: 16, fontWeight: '700', color: '#0f172a' },
  optionRow: { paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', backgroundColor: '#fff', flexDirection: 'row', justifyContent: 'space-between' },
  optionRowActive: { backgroundColor: '#e0f2fe', borderColor: '#0ea5e9' },
  optionText: { color: '#0f172a', fontWeight: '600' },
  optionTextActive: { color: '#0c4a6e' },
});