import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';

// Buat terminal instance
const term = new Terminal({
  cursorBlink: true,
  theme: {
    background: '#000000', // Background warna hitam
    foreground: '#00ff00', // Teks warna hijau
  },
});

const fitAddon = new FitAddon();
term.loadAddon(fitAddon);

// Mount terminal ke DOM
term.open(document.getElementById('terminal'));

// Sesuaikan ukuran terminal ke kontainer
fitAddon.fit();

// Dengarkan resize event browser
window.addEventListener('resize', () => {
  fitAddon.fit();
});

// Contoh output awal
term.write('Welcome to the SSH Terminal!\r\n');

// Sambungkan ke WebSocket backend
const socket = io('http://10.20.11.3:3000');
term.onData((data) => {
  socket.emit('input', data); // Kirim data input ke backend
});

socket.on('output', (data) => {
  term.write(data); // Tampilkan data output dari backend
});
