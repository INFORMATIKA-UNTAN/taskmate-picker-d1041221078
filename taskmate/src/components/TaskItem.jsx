import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colorOfName } from '../constants/categories';
import { colorOfPriority } from '../constants/priorities';
import { colorOfStatus, labelOfStatus } from '../constants/statuses';

// [FUNGSI BARU] Helper untuk merender informasi deadline
const renderDeadlineInfo = (dueDate, status) => {
    if (!dueDate) {
        return null; // Jika tidak ada deadline, jangan tampilkan apa-apa
    }

    const today = new Date();
    const deadlineDate = new Date(dueDate);
    // Set jam ke 0 untuk perbandingan tanggal yang akurat
    today.setHours(0, 0, 0, 0);

    // Cek apakah sudah lewat dan statusnya belum 'done'
    if (deadlineDate < today && status !== 'done') {
        return <Text style={styles.overdueText}>🔴 Overdue</Text>;
    }
    
    // Hitung sisa hari jika belum lewat
    if (deadlineDate >= today) {
        const diffTime = deadlineDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return <Text style={styles.deadlineText}>🔵 Hari ini</Text>;
        } else if (diffDays === 1) {
            return <Text style={styles.deadlineText}>🔵 Besok</Text>;
        } else {
            return <Text style={styles.deadlineText}>🔵 Sisa {diffDays} hari</Text>;
        }
    }

    return null; // Jangan tampilkan apa-apa jika sudah lewat tapi statusnya 'done'
};


export default function TaskItem({ task, categories, onToggle, onDelete }) {
    const isDone = task.status === 'done';

    const catColor = colorOfName(task.category ?? 'Umum', categories);
    const prioColor = colorOfPriority(task.priority ?? 'Low');
    const statusColor = colorOfStatus(task.status);
    const statusLabel = labelOfStatus(task.status);

    return (
        <TouchableOpacity
            onPress={() => onToggle?.(task)}
            onLongPress={() => onDelete?.(task)}
            style={[styles.card, isDone && styles.cardDone]}
        >
            <View style={{ flex: 1 }}>
                <Text style={[styles.title, isDone && styles.strike]}>
                    {task.title}
                </Text>

                {/* [UPDATE] Tampilkan informasi deadline di bawah judul */}
                <View style={styles.deadlineContainer}>
                    {renderDeadlineInfo(task.dueDate, task.status)}
                </View>

                {!!task.description && (
                    <Text style={[styles.desc, isDone && styles.strike]}>
                        {task.description}
                    </Text>
                )}

                <View style={styles.metaContainer}>
                    <View style={styles.badgeContainer}>
                        <View style={[styles.badge, { backgroundColor: catColor + '20', borderColor: catColor }]}>
                            <Text style={[styles.badgeText, { color: catColor }]}>
                                {task.category ?? 'Umum'}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: prioColor + '20', borderColor: prioColor }]}>
                            <Text style={[styles.badgeText, { color: prioColor }]}>
                                {task.priority ?? 'Low'}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: statusColor + '20', borderColor: statusColor }]}>
                            <Text style={[styles.badgeText, { color: statusColor }]}>
                                {statusLabel}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        padding: 16,
        borderRadius: 16,
        backgroundColor: '#fff',
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    cardDone: {
        backgroundColor: '#f8fafc'
    },
    title: {
        fontSize: 16,
        fontWeight: '700',
        color: '#0f172a',
    },
    strike: {
        textDecorationLine: 'line-through',
        color: '#94a3b8'
    },
    // [STYLE BARU] Style untuk deadline
    deadlineContainer: {
        marginBottom: 8,
        marginTop: 4,
    },
    deadlineText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0ea5e9', // Biru
    },
    overdueText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#ef4444', // Merah
    },
    desc: {
        color: '#475569',
        fontSize: 14,
        lineHeight: 20,
    },
    metaContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 12,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    badge: {
        alignSelf: 'flex-start',
        paddingVertical: 4,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
    },
    badgeText: {
        fontSize: 12,
        fontWeight: '700',
    },
});