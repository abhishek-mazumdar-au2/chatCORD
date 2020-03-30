const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');
const formatMessage = require('./UTILS/message');
const { joinUser, getCurrentUser, userLeavesChat, getRoomUsers } = require('./UTILS/users');

const app = express();
const server = http.createServer(app);
const io = socket(server) 
app.use(express.static(path.join(__dirname, 'public')))
const botName = 'ChatCord';
const PORT = 3000 || process.env.PORT;

io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room}) => {
        // user join
        const user = joinUser(socket.id, username, room)
        socket.join(user.room)

        //Welcome message
        socket.emit('message', formatMessage(botName, `Welcome to Chatcord-room: ${room}!`));

        //Broadcast when a user joins
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined!`));

        //Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })
     
     //Listen to a chatMessage
     socket.on('chatMessage', (e) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, e))
    })

    //Broadcast when user leaves

    socket.on('disconnect', () => {
        const user = userLeavesChat(socket.id)
        if(user){
            io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left.`))
            //Send users and room info
            io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
        }
    })
})

app.get('/', (req, res) => {
    res.json({
        msg: "Hello from the server. This is chatbot in the making."
    })
})

server.listen(PORT, () => {
    console.log('Server listening at port:'+PORT);
})