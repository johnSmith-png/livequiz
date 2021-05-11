import React,{ useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { socket } from './EnterCodeForm'
import ReactDOM from 'react-dom'

import '../style/style.css'

//globals

//const socket = io('http://localhost:3001')
const playersTime = []

export default function HostRoom(props) {

    const [podiumPlayers, setPodiumPLayers] = useState([])

    const [playerTimes, setPlayerTimes] = useState([])

    useEffect(() => {
        socket.emit('joinHostRoom', {
            room: props.room
        })
        socket.on('addeduser', (data)=>{
            console.log(data)
            var RoomUsers = []
        
            for(var i = 0; i < data.names.length; i++){
                if(data.UserRooms[i] == undefined) return
                if(data.currentRoom == data.UserRooms[i]){
                    RoomUsers.push(data.names[i])
                }
            }
            document.getElementById('userList').innerHTML = data.UsersInRoom
            
        })
        socket.on('roomAdd', (data)=>{
            console.log(data)
        })
        socket.on('yes', (data)=>{
            console.log(data)
        })

        socket.on('timeBoard', (data)=>{
            console.log(data.time, data.user)

            if(playersTime.includes(data.user) == true){
                console.log('yes')

                document.getElementById(data.user).innerHTML = `User: ${data.user} Time: ${data.time}`
            }
            else{
                playersTime.push(data.user)
                console.log(playersTime)
    
                let newTime = document.createElement('h1')
    
                newTime.innerHTML = `User: ${data.user} Time: ${data.time}`
                newTime.id = data.user
    
                document.getElementById('times').appendChild(newTime)
            }


        })

        socket.on('playerLeftRoom', (data)=>{
            document.getElementById('userList').innerHTML = data.UsersInRoom
        })

        socket.on('EndGame', (data)=>{
            window.location = '/roomleave'
        })

        socket.on('UpdatePodium', (data)=>{
            setPodiumPLayers(podiumPlayers =>[...podiumPlayers, data.user])
        })

        return () => {
            socket.emit('terminateRoom', props.room)
            socket.emit('EndGame', {
                room: props.room
            })
            window.location = '/roomleave'
        }


    }, [])

    const StartGame = (room)=>{
        socket.emit('startGame', {
            room: room,
            gamecode: props.gamecode

        })
    }
    const EndGame = () => {
        socket.emit('EndGame', {
            room: props.room
        })
        window.location = '/roomleave'
    }

    const playerTimesStyle = {backgroundColor:'white', borderRadius:'25px', height:'600px', width:'auto', maxWidth:'50vw'}
    const playerPodiumStyle = {backgroundColor:'white', borderRadius:'25px', height:'600px', width:'auto', maxWidth:'50vw'}

    return (
        <div>
            <h1>{props.room}</h1>
            <h2 id={'userList'}></h2>
            <div style={playerTimesStyle} id="times">
                <h1>Player Times</h1>
            </div>
            <div style={playerPodiumStyle}>
                <h1>Podium</h1>
                {podiumPlayers.map((player) =>(
                <h1 key={player}>{player}</h1>
            )
            )}</div>
            <button onClick={()=>{StartGame(props.room)}}>Start Game</button>
            <button onClick={()=>{EndGame()}}>End Game</button>
        </div>
    )
}

