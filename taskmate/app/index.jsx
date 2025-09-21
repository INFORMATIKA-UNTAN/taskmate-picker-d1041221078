import { useState, useEffect, useMemo, useCallback } from 'react';
import { SafeAreaView, Text, FlatList, StyleSheet, View, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from 'expo-router';

// Komponen & Utilitas
import TaskItem from '../src/components/TaskItem';
import FilterToolbarFancy from '../src/components/FilterToolbarFancy';

// Penyimpanan & Konstanta (sesuaikan path jika perlu)
import { loadTasks, saveTasks } from '../src/storage/taskStorage';
import { loadCategories } from '../src/storage/categoryStorage';
import { weightOfPriority } from '../src/constants/priorities';

export default function HomeScreen() {
    // [STATE] Data utama aplikasi
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // [STATE] Kondisi filter
    const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'todo' | 'pending' | 'done'
    const [categoryFilter, setCategoryFilter] = useState('all'); // 'all' | 'Nama Kategori'
    const [priorityFilter, setPriorityFilter] = useState('all'); // 'all' | 'High' | 'Medium' | 'Low'

    // [EFFECT] Muat data tugas & kategori setiap kali layar ini mendapat fokus
    useFocusEffect(
        useCallback(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const loadedTasks = await loadTasks();
                    const loadedCategories = await loadCategories();
                    setTasks(loadedTasks);
                    setCategories(loadedCategories);
                } catch (error) {
                    Alert.alert("Error", "Gagal memuat data.");
                    console.error(error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, [])
    );

    // [AKSI] Toggle status tugas: To Do -> Pending -> Done -> To Do
    const handleToggle = async (task) => {
        const getNextStatus = (currentStatus) => {
            if (currentStatus === 'todo') return 'pending';
            if (currentStatus === 'pending') return 'done';
            if (currentStatus === 'done') return 'todo';
            return 'todo';
        };

        const updatedTasks = tasks.map(t =>
            t.id === task.id ? { ...t, status: getNextStatus(t.status) } : t
        );
        setTasks(updatedTasks);
        await saveTasks(updatedTasks);
    };

    // [AKSI] Hapus satu tugas dengan konfirmasi
    const handleDelete = (taskToDelete) => {
        Alert.alert(
            "Hapus Tugas",
            `Apakah Anda yakin ingin menghapus "${taskToDelete.title}"?`,
            [
                { text: "Batal", style: "cancel" },
                {
                    text: "Hapus", style: "destructive", onPress: async () => {
                        const updatedTasks = tasks.filter(t => t.id !== taskToDelete.id);
                        setTasks(updatedTasks);
                        await saveTasks(updatedTasks);
                    }
                }
            ]
        );
    };

    // [FILTERING] Terapkan filter berdasarkan state
    const filteredTasks = useMemo(() => {
        if (!tasks) return [];
        return tasks.filter(t => {
            const byStatus = statusFilter === 'all' || t.status === statusFilter;
            const byCategory = categoryFilter === 'all' || (t.category ?? 'Umum') === categoryFilter;
            const byPriority = priorityFilter === 'all' || (t.priority ?? 'Low') === priorityFilter;
            return byStatus && byCategory && byPriority;
        });
    }, [tasks, statusFilter, categoryFilter, priorityFilter]);

    // [SORTING] Urutkan tugas: Prioritas Tertinggi -> Tanggal Terdekat
    const sortedTasks = useMemo(() => {
        return [...filteredTasks].sort((a, b) => {
            const weightA = weightOfPriority(a.priority ?? 'Low');
            const weightB = weightOfPriority(b.priority ?? 'Low');
            if (weightA !== weightB) return weightB - weightA;

            if (!a.dueDate && !b.dueDate) return 0;
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            return new Date(a.dueDate) - new Date(b.dueDate);
        });
    }, [filteredTasks]);

    if (isLoading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text style={styles.loadingText}>Memuat Tugas...</Text>
            </View>
        );
    }
    
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.header}>Daftar Tugas Anda 📝</Text>
            </View>
            
            <View style={styles.toolbarContainer}>
                <FilterToolbarFancy
                    categories={categories}
                    categoryFilter={categoryFilter}
                    setCategoryFilter={setCategoryFilter}
                    statusFilter={statusFilter}
                    setStatusFilter={setStatusFilter}
                    priorityFilter={priorityFilter}
                    setPriorityFilter={setPriorityFilter}
                />
            </View>

            <FlatList
                data={sortedTasks}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <TaskItem
                        task={item}
                        categories={categories}
                        onToggle={handleToggle}
                        onDelete={handleDelete}
                    />
                )}
                ListEmptyComponent={
                    <View style={styles.centered}>
                        <Text style={styles.emptyText}>Tidak ada tugas yang cocok. ✨</Text>
                    </View>
                }
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc'
    },
    headerContainer: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1e293b'
    },
    toolbarContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        backgroundColor: '#f8fafc'
    },
    listContent: {
        padding: 16
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
        paddingHorizontal: 20,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#475569'
    },
    emptyText: {
        fontSize: 16,
        color: '#64748b',
        textAlign: 'center'
    },
});