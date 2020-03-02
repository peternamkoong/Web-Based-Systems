const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
let counter = 1;

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connect', function(socket) {
    //by default, set the user nickname to a boring "user #" format
    let nickID = 'user ' + counter++;

    //create an object for each of the connected sockets
    let user = {
        id: socket.id,
        nick: nickID,
        color: 'black',
    };
    socket.on('connect', function() {
        io.emit('disconnect', user.nick);
    });

    //on connection of a socket
    socket.on('chat message', function(msg) {
        if (msg.startsWith('/nickcolor')) {
            let array = msg.split(' ', 2);
            let reg = /[0-9A-Fa-f]{6}/g;
            if (array[1].length != 6) {
                socket.emit('nickColorIncorrect');
            } else if (reg.test(array[1])) {
                user.color = array[1];
                socket.emit('nickColorCorrect');
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
            } else {
                user.nick = array[1];
                socket.emit('nickCorrect');
            }
        }

        //else, it is just a normal message
        else {
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
            let fullmsg = date + user.nick + ': ' + ' ' + msg;
            io.emit('colored', fullmsg, user.color);
        }
    });

    //If the user disconnects, broadcast it to the entire world.
    socket.on('disconnect', function() {
        let msg = user.nick;
        io.emit('disconnect', msg);
    });

    // socket.on('connect', function() {
    //     let msg = 'User connected.';
    //     io.emit('connection', msg);
    // });
});

http.listen(3000, function() {
    console.log('listening on *:3000');
});
