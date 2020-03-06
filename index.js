/*
/**********************************************
 * Last Name:   Namkoong
 * First Name:  Kyoung Hwan
 * Student ID:  10125240
 * Course:      SENG 513
 * Tutorial:    05
 * Assignment:  3
 *********************************************
*/
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

let counter = 0;
let users = [];
let history = [];

app.use(express.static(__dirname));

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

//When a new socket connects to the server
io.on('connect', function(socket) {
    //sends a cookie function to the socket to see if cookies are set
    socket.emit('cookies', 'user' + counter++, '000000');

    //load up to 200 lines of history into the chat
    for (i = 0; i < 400; i += 2) {
        if (!history[i] == '') {
            socket.emit('loadHistory', history[i]);
        }
    }

    //set the nickname for the socket based on stored cookie
    socket.on('setNick', function(nick) {
        if (users.includes(nick)) {
            socket.username = 'user' + counter++;
            socket.emit('nickCorrect', socket.username);
        } else {
            socket.username = nick;
        }
        users.push(socket.username);
        //clear all the users in the "online Users" list
        io.emit('clearUsers');
        for (i = 0; i < users.length; i++) {
            //load all the online users to the "online user list"
            io.emit('onlineUsers', users[i]);
            console.log('online: ' + users[i]);
        }
        console.log('********');
    });

    //set the color for the user based on stored cookie
    socket.on('setColor', function(color) {
        socket.color = color;
    });

    //store each msg into an array for chat history
    socket.on('storeHistory', function(msg) {
        history.push(msg);
    });

    //for each chat message that is sent
    socket.on('chat message', function(msg) {
        //check if it is a /nickcolor command
        if (msg.startsWith('/nickcolor ')) {
            let array = msg.substring(11, msg.length);
            let reg = /[0-9A-Fa-f]{6}/g;
            if (array.length != 6) {
                //if the color is not in RRGGBB
                socket.emit('nickColorIncorrect');
            } else if (reg.test(array)) {
                socket.color = array;
                //color is correct and can be changed
                socket.emit('nickColorCorrect', socket.color);
            } else {
            }
            reg.lastIndex = 0;
        }
        //if the user is trying to change his nick name
        else if (msg.startsWith('/nick ')) {
            let array = msg.substring(6, msg.length);
            //if the nickname is invalid
            if (array == null || array == '' || array == undefined) {
                socket.emit('nickIncorrect');
                //if the username already exists in the onlineUsers list
            } else if (users.includes(array)) {
                let message = 'That nickname has already been taken.';
                socket.emit('uniqueNick', message);
            } else {
                //username is accepted
                let index = users.indexOf(socket.username);
                if (index > -1) {
                    users.splice(index, 1);
                }
                socket.username = array;
                users.push(socket.username);
                socket.emit('nickCorrect', socket.username);
                io.emit('clearUsers');
                for (i = 0; i < users.length; i++) {
                    io.emit('onlineUsers', users[i]);
                }
            }
        }
        //if the message is another command, it does not exist
        else if (msg.startsWith('/')) {
            let msg = '<li><i> That command does not exist.</i></li>';
            socket.emit('incorrectCommand', msg);
        }

        //else, it is just a normal message
        else {
            //if the message is just a bunch of spaces, don't send
            if (msg.trim() == '') {
                return;
            }
            //get the time of the message
            let today = new Date();
            let hour = today.getHours();
            let minute = today.getMinutes();
            let second = today.getSeconds();
            //for formatting purposes
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
