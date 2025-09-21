import { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    Alert,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { v4 as uuidv4 } from 'uuid';
import { Picker } from '@react-native-picker/picker';

// Sesuaikan path jika perlu
import { loadTasks, saveTasks } from '../src/storage/taskStorage';
import { loadCategories, saveCategories } from '../src/storage/categoryStorage';
import AddCategoryModal from '../src/components/AddCategoryModal';
import { pickColor } from '../src/constants/categories';
import { PRIORITIES } from '../src/constants/priorities';

export default function AddTaskScreen() {
    const router = useRouter();

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showCatModal, setShowCatModal] = useState(false);
    const [priority, setPriority] = useState('Low');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const loadedCategories = await loadCategories();
                setCategories(loadedCategories);
                if (loadedCategories.length > 0) {
                    setSelectedCategory(loadedCategories[0].key);
                }
            } catch (error) {
                console.error("Gagal memuat kategori:", error);
                Alert.alert("Error", "Tidak dapat memuat daftar kategori.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleAddTask = async () => {
        if (!title.trim()) {
            Alert.alert('Input Tidak Valid', 'Judul tugas wajib diisi.');
            return;
        }

        if (!selectedCategory) {
            Alert.alert('Input Tidak Valid', 'Anda harus memilih kategori terlebih dahulu.');
            return;
        }

        const trimmedDueDate = dueDate.trim();
        if (trimmedDueDate && !/^\d{4}-\d{2}-\d{2}$/.test(trimmedDueDate)) {
            Alert.alert('Format Salah', 'Harap masukkan format tanggal YYYY-MM-DD.');
            return;
        }

        try {
            const existingTasks = (await loadTasks()) || [];
            
            const newTask = {
                id: uuidv4(),
                title: title.trim(),
                description: description.trim(),
                category: selectedCategory,
                priority: priority,
                dueDate: trimmedDueDate || null,
                status: 'todo',
            };

            const updatedTasks = [newTask, ...existingTasks];
            await saveTasks(updatedTasks);

            Alert.alert(
                'Sukses',
                'Tugas baru berhasil disimpan!',
                [{ text: 'OK', onPress: () => router.replace('/') }],
                { cancelable: false }
            );

        } catch (error) {
            console.error("Gagal total saat menambah tugas:", error);
            Alert.alert("Error", "Terjadi kesalahan saat mencoba menyimpan tugas.");
        }
    };
    
    const handleSubmitCategory = async ({ key, color }) => {
        if (categories.some(c => c.key.toLowerCase() === key.toLowerCase())) {
            Alert.alert('Info', 'Kategori dengan nama tersebut sudah ada.');
            setShowCatModal(false);
            return;
        }
        const newCategory = { key, color: color || pickColor(categories.length) };
        const updatedCategories = [...categories, newCategory];

        if (categories.length === 0) {
            await saveTasks([]);
        }
        
        setCategories(updatedCategories);
        await saveCategories(updatedCategories);
        setSelectedCategory(key);
        setShowCatModal(false);
    };

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#3b82f6" />
                <Text>Memuat Kategori...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 50 }}>
            <Text style={styles.header}>Tambah Tugas Baru ✍️</Text>

            <Text style={styles.label}>Judul Tugas</Text>
            <TextInput
                style={styles.input}
                placeholder="Contoh: Selesaikan UI/UX Design"
                value={title}
                onChangeText={setTitle}
            />

            <Text style={styles.label}>Deadline (Opsional)</Text>
            <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (Contoh: 2025-12-31)"
                value={dueDate}
                onChangeText={setDueDate}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Deskripsi (Opsional)</Text>
            <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Contoh: Buat wireframe dan high-fidelity prototype di Figma."
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
            />

            <Text style={styles.label}>Kategori</Text>
            <View style={styles.pickerWrap}>
                <Picker
                    selectedValue={selectedCategory}
                    enabled={categories.length > 0}
                    onValueChange={(itemValue) => {
                        if (itemValue === '__ADD__') {
                            setShowCatModal(true);
                        } else {
                            setSelectedCategory(itemValue);
                        }
                    }}>
                    {categories.map((cat) => (
                        <Picker.Item label={cat.key} value={cat.key} key={cat.key} />
                    ))}
                    <Picker.Item label=" Tambah Kategori Baru..." value="__ADD__" style={{color: '#3b82f6'}}/>
                </Picker>
            </View>

            <Text style={styles.label}>Prioritas</Text>
            <View style={styles.pickerWrap}>
                <Picker
                    selectedValue={priority}
                    onValueChange={(itemValue) => setPriority(itemValue)}>
                    {PRIORITIES.map((p) => (
                        <Picker.Item label={p} value={p} key={p} />
                    ))}
                </Picker>
            </View>

            <TouchableOpacity style={styles.button} onPress={handleAddTask}>
                <Text style={styles.buttonText}>Simpan Tugas</Text>
            </TouchableOpacity>

            <AddCategoryModal
                visible={showCatModal}
                onClose={() => setShowCatModal(false)}
                onSubmit={handleSubmitCategory}
                suggestedColor={pickColor(categories.length)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8fafc',
    },
    header: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 24,
        color: '#1e293b',
    },
    label: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 8,
        color: '#475569',
        marginTop: 12,
    },
    input: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#ffffff',
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    pickerWrap: {
        borderWidth: 1,
        borderColor: '#cbd5e1',
        borderRadius: 8,
        backgroundColor: '#ffffff',
    },
    button: {
        backgroundColor: '#3b82f6',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 24,
    },
    buttonText: {
        color: '#ffffff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});