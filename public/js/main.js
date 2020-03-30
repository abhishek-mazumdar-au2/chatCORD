const socket = io();
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const usersList = document.getElementById('users');

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
})

socket.emit('joinRoom', {username, room})

const chatForm = document.getElementById('chat-form');
socket.on('message', message => {
  console.log(username, room)
  console.log(message);
  outputMessage(message)
  chatMessages.scrollTop = chatMessages.scrollHeight;

})

// collect all the room users
socket.on('roomUsers', (obj) => {
  const { room, users } = obj;
  outputRoomName(room);
  outputUsers(users);
})

// message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault()
  const msg = document.getElementById('msg').value
  socket.emit('chatMessage', msg);
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus()
})

outputMessage = (message) => {
  const div = document.createElement('div');
  div.classList.add('message')
  div.innerHTML = `<p class='meta'>${message.username} <span>${message.time}</span></p>
                    <p class='text'>${message.text}</p>`
  document.querySelector('.chat-messages').appendChild(div);
}

outputRoomName = (room) => {
  roomName.innerText = room;
}

outputUsers = (users) => {
  usersList.innerHTML =  `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
  `
}