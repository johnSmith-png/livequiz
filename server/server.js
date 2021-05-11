const { Socket } = require('socket.io')

const io = require('socket.io')(3001, {
    cors: {
        origin: 'http://localhost:3000',
        method: ["GET", "POST"],
    },
})

const allConnections = []
var rooms = []
var roomFound = false

const userInRoom = []
const userRooms = []
const userData = []

var playerArr = []
const Players = {}
const UsersInRoom = {}
const playerSocketIdPorps = {}
const hostSocketIdPorps = {}

io.on('connection', (socket)=>{
    allConnections.push(socket.id)
    console.log(`made connected ${socket.id} total connection: ${allConnections.length}`)
    console.log(socket.rooms)


    socket.on('disconnecting', () => {
        console.log(socket.id);
        if(hostSocketIdPorps[socket.id] !== undefined){
            console.log(hostSocketIdPorps, 'hahahahahahahahahahahha')
            console.log(hostSocketIdPorps[socket.id])
            console.log(hostSocketIdPorps[socket.id].room)

            //terminate the room
            socket.leave(hostSocketIdPorps[socket.id].room)
            io.to(hostSocketIdPorps[socket.id].room).emit('EndedGame', 'end')

            console.log(rooms, 'this is your rooms')
            rooms.splice(rooms.indexOf(hostSocketIdPorps[socket.id].room), 1)
            console.log(rooms, 'this is your rooms')

            delete hostSocketIdPorps[socket.id]
        }
        if(playerSocketIdPorps[socket.id] !== undefined){
            console.log(playerSocketIdPorps, 'gagagagagagagagagagagag')
            console.log(playerSocketIdPorps[socket.id])
            console.log(playerSocketIdPorps[socket.id].room)

            //make the player leave the room

            socket.leave(playerSocketIdPorps[socket.id].room)
            console.log(socket.rooms, 'see the room you left')
            delete Players[`${playerSocketIdPorps[socket.id].name}${playerSocketIdPorps[socket.id].room}`]
            UsersInRoom[playerSocketIdPorps[socket.id].room].splice(UsersInRoom[playerSocketIdPorps[socket.id].room].indexOf(playerSocketIdPorps[socket.id].name), 1)
            console.log(UsersInRoom[playerSocketIdPorps[socket.id].room])
    
            console.log(Players)
            io.to(playerSocketIdPorps[socket.id].room).emit('playerLeftRoom', {
                UsersInRoom: UsersInRoom[playerSocketIdPorps[socket.id].room]
            })

            delete playerSocketIdPorps[socket.id]
        }
      });


    socket.on('createroom', (data)=>{
        socket.join(data.room)
        rooms.push(data.room)
        console.log(socket.rooms)
        io.to(data.room).emit('roomcreated', {
            message:`Success Fully created ${data.room}`,
            room: data.room,
            gamecode: data.gamecode
        })
        hostSocketIdPorps[socket.id] = {room: data.room}
    })
    socket.on('joinHostRoom', (data)=>{
        console.log(data.room)
        socket.join(data.room)
        console.log(socket.rooms)
    })

    socket.on('time', (data)=>{
        io.to(data.room).emit('timeBoard', {
            time: data.time,
            user: data.user
        })
    })


    socket.on('joinPlayerRoom', (data)=>{
        console.log(data.room)
        socket.join(data.room)
        console.log(socket.rooms)

        io.to(data.room).emit('joinedWaitingRoom', 'Joined The Waiting Room')
    })
    socket.on('joinGame', (data)=>{
        console.log(data.room)
        socket.join(data.room)
        console.log(socket.rooms)

        io.to(data.room).emit('joinedGameRoom', 'JOined the game')
    })

    socket.on('adduser', (data)=>{
        if(data.name + data.room in Players){
            io.to(socket.id).emit('changeName', {
                name: data.name,
                message: `The Name ${data.name} is Already taken choose another one`
            });
        }
        else{
            if(data.name !== undefined){
                userInRoom.push(data.name)
                userRooms.push(data.room)
                Players[`${data.name}${data.room}`] = {name:data.name, room:data.room}
                playerSocketIdPorps[socket.id] = {name:data.name, room:data.room}

                
                var keys = Object.keys(Players)
                for(var i = 0; i < Object.keys(Players).length; i++){
                    if(Players[keys[i]].room == data.room){
                        playerArr.push(Players[keys[i]].name)
                    }
                }
                UsersInRoom[data.room] = playerArr
                console.log(UsersInRoom[data.room], 'this is the array you are looking for')
                playerArr = []
        
        
        
                console.log(data.room)


                if(Players[data.name + data.room])
        
                io.to(data.room).emit('addeduser', {
                    currentRoom: data.room,
                    names: userInRoom,
                    UserRooms: userRooms,
                    UsersInRoom: UsersInRoom[data.room],
                    name: data.name
                })
                io.sockets.emit('roomAdd', 'aleert')
            }
        }
        /*if(userInRoom.includes(data.name) == false){
        if(data.name !== undefined){
        userInRoom.push(data.name)
        userRooms.push(data.room)
        Players[`${data.name}${data.room}`] = {name:data.name, room:data.room}




        console.log(userInRoom)
        console.log(data.room)

        io.to(data.room).emit('addeduser', {
            currentRoom: data.room,
            names: userInRoom,
            UserRooms: userRooms,
            name: data.name
        })
        io.sockets.emit('roomAdd', 'aleert')
    }
    }
    else{
        io.to(socket.id).emit('changeName', {
            name: data.name,
            message: `The Name ${data.name} is Already taken choose another one`
        });
    }*/

    })

    socket.on('startGame', (data)=>{
        console.log(data.room)
        io.to(data.room).emit('gameStarted', {
            message: `Game has Started in ${data.room}`,
            room: data.room,
            gamecode: data.gamecode
        })
    })

    socket.on('PlayerFinsihed', (data)=>{
        io.to(data.room).emit('UpdatePodium', {
            user: data.user,
            room: data.room,
        })
    })

    socket.on('leaveRoom', (data)=>{
        socket.leave(data.room)
        console.log(socket.rooms, 'see the room you left')
        delete Players[`${data.user}${data.room}`]
        UsersInRoom[data.room].splice(UsersInRoom[data.room].indexOf(data.user), 1)
        console.log(UsersInRoom[data.room])

        console.log(Players)
        io.to(data.room).emit('playerLeftRoom', {
            UsersInRoom: UsersInRoom[data.room]
        })
    })

    socket.on('EndGame', (data)=>{
        socket.leave(data.room)
        io.to(data.room).emit('EndedGame', 'end')

        console.log(rooms, 'this is your rooms')
        rooms.splice(rooms.indexOf(data.room), 1)
        console.log(rooms, 'this is your rooms')
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
