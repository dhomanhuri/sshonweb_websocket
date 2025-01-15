const term = new Terminal();
term.open(document.getElementById('terminal'));

// Parse query parameters from URL
function getQueryParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const pairs = queryString.split("&");
    for (const pair of pairs) {
        const [key, value] = pair.split("=");
        if (key && value) {
            params[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    }
    return params;
}

const socket = io('http://10.20.11.3:3000');
socket.on('output', (data) => term.write(data));
socket.on('error', (err) => term.write(`\r\nError: ${err}`));
socket.on('status', (status) => term.write(`\r\nStatus: ${status}`));

const queryParams = getQueryParams();

if (queryParams.host && queryParams.port && queryParams.username && queryParams.password) {
    console.log(queryParams);
    
    socket.emit('connectSSH', queryParams);
} else {
    term.write('\r\nMissing required query parameters: host, port, username, password');
}

// Send terminal input to backend
term.onData((data) => socket.emit('input', data));
