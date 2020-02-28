const app = require('express')();
const http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket) {
    socket.on('chat message', function(msg) {
        var today = new Date();
        var date =
            '[' +
            today.getHours() +
            ':' +
            today.getMinutes() +
            ':' +
            today.getSeconds() +
            '] ';
        var fullmsg = date + msg;
        io.emit('chat message', fullmsg);
    });
    socket.on('disconnect', function() {
        let msg = 'User disconnected.';
        io.emit('disconnect', msg);
    });
    socket.on('connect', function() {
        let msg = 'User connected.';
        io.emit('connection', msg);
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
