const express = require('express')
const socket = require('socket.io')


//app setup
const app = express()
var port = 4001

const server = app.listen(port, ()=>{
    console.log(`listenning on http://localhost:${port}`)
})

//static files
app.use(express.static('public'))

//dynamic route
app.get('/room/:room', function(req, res){
    res.send(
        `<h1>${req.params.room}</h1>`
        );
 });

//socket setup

const io = socket(server)
const allConnections = []
var rooms = ['room5', 'room1', 'room4']
var roomFound = false

const userInRoom = []
const userRooms = []
const userData = []

io.on('connection', (socket)=>{
    allConnections.push(socket.id)
    console.log(`made connected ${socket.id} total connection: ${allConnections.length}`)
    console.log(socket.rooms, 'no')

    io.to("room1").emit('myroom', 'you are in myroom')

    socket.on('disconnecting', () => {
        console.log(socket.id); // the Set contains at least the socket ID
      });

    socket.on('createroom', (data)=>{
        socket.join(data)
        rooms.push(data)
        io.to(data).emit('roomcreated', `Success Fully created ${data}`)
    })

    socket.on('adduser', (data)=>{
        var UserName = data.name
        var UserRoom = data.room
        var obj = new Object
        if(userInRoom.includes(data.name) == false){
        if(data.name !== undefined){
        userInRoom.push(data.name)
        userRooms.push(data.room)

        obj['data'] = {
            Uroom: UserRoom,
            Uname: UserName
        }

        userData.push(obj)
        


        console.log(userInRoom)
        console.log(JSON.stringify(userData))

        io.to(data.room).emit('addeduser', {
            currentRoom: data.room,
            names: userInRoom,
            UserRooms: userRooms
        })
    }
    }

    })


    socket.on('joinroom', (data)=>{
        console.log(socket.rooms)
        roomFound = false
        for (var i = 0; i < rooms.length; i++){
            if(rooms[i] == data.code){
                socket.join(data.code)
                console.log(socket.rooms)
                io.to(data.code).emit('myroom', {
                    room: data.code,
                    name: data.name
                })
                roomFound = true
            }
            else{
                //
            }
        }
        if (roomFound == false){
            io.sockets.emit('roomcallback', {
                message: 'Room not Found :(',
                joined: false
            })
        }
        if(roomFound == true){
            io.sockets.emit('roomcallback', {
                message: `Room ${data.code} Found!`,
                joined: true
            })
        }
        
    })
})