const cors = require('cors');
const express = require('express');
const { Client } = require('ssh2');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST'],
    },
});

app.use(cors());

io.on('connection', (socket) => {
    const conn = new Client();

    socket.on('connectSSH', (query) => {
        const { host, port, username, password } = query;

        if (!host || !port || !username || !password) {
            socket.emit('error', 'Missing required query parameters');
            return;
        }

        conn.on('ready', () => {
            socket.emit('status', 'Connected to SSH');
            conn.shell((err, stream) => {
                if (err) {
                    socket.emit('error', 'Failed to open shell');
                    return;
                }
                socket.on('input', (data) => stream.write(data));
                stream.on('data', (data) => socket.emit('output', data.toString()));
                stream.stderr.on('data', (data) => socket.emit('output', data.toString()));
            });
        }).connect({
            host,
            port: parseInt(port, 10),
            username,
            password,
        });

        conn.on('error', (err) => {
            socket.emit('error', `SSH connection error: ${err.message}`);
        });
    });

    socket.on('disconnect', () => {
        conn.end();
    });
});

const PORT = 3000;
server.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
