// src/constants/statuses.js

export const STATUS_META = [
    { key: 'todo',    label: 'To Do',   color: '#94a3b8' }, // Abu-abu
    { key: 'pending', label: 'Pending', color: '#f97316' }, // Oranye
    { key: 'done',    label: 'Done',    color: '#16a34a' }, // Hijau
];

// Fungsi untuk mendapatkan warna berdasarkan key status
export function colorOfStatus(statusKey) {
    const found = STATUS_META.find(s => s.key === statusKey);
    return found ? found.color : '#94a3b8'; // fallback ke To Do
}

// Fungsi untuk mendapatkan label yang rapi berdasarkan key status
export function labelOfStatus(statusKey) {
    const found = STATUS_META.find(s => s.key === statusKey);
    return found ? found.label : 'To Do';
}