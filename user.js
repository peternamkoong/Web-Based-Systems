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
$(function() {
    //connect to the server via socket
    var socket = io.connect();
    $('form').submit(function(e) {
        e.preventDefault(); // prevents page reloading
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    //on connection, check to see if cookies are set
    socket.on('cookies', function(nick, color) {
        let cookieUsername;
        let cookieColor;
        //if they are set, get them
        if (checkCookie()) {
            cookieUsername = getCookie('username');
            cookieColor = getCookie('color');
        }
        //else, set the cookies to the defaulted ones
        else {
            cookieUsername = nick;
            cookieColor = color;
            setCookie('username', nick, 7);
            setCookie('color', color, 7);
        }
        //emit it back to the server to set socket variables
        socket.emit('setNick', cookieUsername);
        socket.emit('setColor', cookieColor);
    });

    //load the history of the chat
    socket.on('loadHistory', function(msg) {
        $('#messages').prepend(msg);
    });
    //load the message onto the chat area
    socket.on('message', function(date, nick, msg, color) {
        let msg2 =
            '<li><font color =' +
            color +
            '><b> ' +
            date +
            nick +
            ': ' +
            msg +
            '</li>';
        //store this message in the history
        socket.emit('storeHistory', msg2);
        $('#messages').prepend(msg2);
    });
    //send a message saying that this user has disconnected
    socket.on('disconnect', function(msg) {
        let msg2 = '<li><i>' + msg + ' has disconnected.</i></li>';
        $('#messages').prepend(msg2);
    });

    //adds a message to the chat, informing that the command is incorrect
    socket.on('incorrectCommand', function(msg) {
        $('#messages').prepend(msg);
    });

    //Correct Nickname, set the cookies and inform user
    socket.on('nickCorrect', function(username) {
        setCookie('username', username, 7);
        let msg =
            '<li><i>Your nickname has been set to <b>' +
            username +
            '.</i></li>';
        $('#messages').prepend(msg);
    });

    //someone else has the name, inform user
    socket.on('uniqueNick', function(message) {
        let msg = '<li><i>' + message + '</i></li>';
        $('#messages').prepend(msg);
    });
    //nickname is not valid
    socket.on('nickIncorrect', function() {
        let msg = '<li><i>Your nickname could not be set.</i></li>';
        $('#messages').prepend(msg);
    });

    //nickname color is correct Hex color code
    socket.on('nickColorCorrect', function(color) {
        setCookie('color', color, 7);
        let msg = '<li><i>your text color is has been changed.</i></li>';
        $('#messages').prepend(msg);
    });

    //nickname color is not proper hexcode or not a color
    socket.on('nickColorIncorrect', function() {
        let msg =
            '<li><i>your text color could not be changed. Make sure it is in a proper hexcolor format RRGGBB. </i></li>';
        $('#messages').prepend(msg);
    });

    //append all the online users at the moment
    socket.on('onlineUsers', function(msg) {
        $('#users').append($('<li>').text(msg));
    });

    //clear all the users in the online users section
    socket.on('clearUsers', function() {
        $('#users').empty();
    });
});

//function that sets the cookies
function setCookie(cname, cvalue, exdays) {
    let d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    let expires = 'expires=' + d.toUTCString();
    document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

//function that gets the cookies
function getCookie(cname) {
    var name = cname + '=';
    var ca = document.cookie.split(';');
    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}

//function that checks if cookies exists
function checkCookie() {
    var user = getCookie('username');
    if (user != '') {
        return true;
    } else {
        return false;
    }
}
