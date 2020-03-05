const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let counter = 0;
let users = [];
let history = [];

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connect', function(socket) {
    //create an object for each of the connected sockets
    socket.emit('cookies', 'user' + counter++, '000000');

    for (i = 0; i < 400; i += 2) {
        if (!history[i] == '') {
            socket.emit('loadHistory', history[i]);
        }
    }

    socket.on('setNick', function(nick) {
        socket.username = nick;
        users.push(socket.username);
        io.emit('clearUsers');
        for (i = 0; i < users.length; i++) {
            io.emit('onlineUsers', users[i]);
            console.log('online: ' + users[i]);
        }
        console.log('********');
    });

    socket.on('setColor', function(color) {
        socket.color = color;
    });
    socket.on('storeHistory', function(msg) {
        history.push(msg);
    });
    //on connection of a socket
    socket.on('chat message', function(msg) {
        if (msg.startsWith('/nickcolor')) {
            let array = msg.split(' ', 2);
            let reg = /[0-9A-Fa-f]{6}/g;
            if (array[1].length != 6) {
                socket.emit('nickColorIncorrect');
            } else if (reg.test(array[1])) {
                socket.color = array[1];
                socket.emit('nickColorCorrect', socket.color);
            } else {
            }
            reg.lastIndex = 0;
        }
        //if the user is trying to change his nick name
        else if (msg.startsWith('/nick')) {
            let array = msg.split(' ', 2);
            //if the nickname is invalid
            if (array[1] == null || array[1] == '' || array[1] == undefined) {
                socket.emit('nickIncorrect');
                //the nickname is valid and is set.
            } else if (users.includes(array[1])) {
                let message = 'That nickname has already been taken.';
                socket.emit('uniqueNick', message);
            } else {
                let index = users.indexOf(socket.username);
                if (index > -1) {
                    users.splice(index, 1);
                }
                socket.username = array[1];
                users.push(socket.username);
                socket.emit('nickCorrect', socket.username);
                io.emit('clearUsers');
                for (i = 0; i < users.length; i++) {
                    io.emit('onlineUsers', users[i]);
                }
            }
        }

        //else, it is just a normal message
        else {
            if (msg.replace(' ', '') == '') {
                return;
            }
            let today = new Date();
            let hour = today.getHours();
            let minute = today.getMinutes();
            let second = today.getSeconds();
            if (hour < 10) {
                hour = '0' + hour;
            }
            if (minute < 10) {
                minute = '0' + minute;
            }
            if (second < 10) {
                second = '0' + second;
            }

            let date = '[' + hour + ':' + minute + ':' + second + '] ';
            //format the message to include date, and user nickname, and the message
            let fullmsg = date + socket.username + ': ' + ' ' + msg;
            io.emit('message', date, socket.username, msg, socket.color);
        }
    });

    //If the user disconnects, broadcast it to the entire world.
    socket.on('disconnect', function() {
        let msg = socket.username;
        let index = users.indexOf(msg);
        if (index > -1) {
            users.splice(index, 1);
        }
        io.emit('disconnect', msg);
        io.emit('clearUsers');
        for (i = 0; i < users.length; i++) {
            io.emit('onlineUsers', users[i]);
            console.log('disconnect: ' + users[i]);
        }
    });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
