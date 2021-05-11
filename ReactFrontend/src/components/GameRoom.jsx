import React,{ useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import { socket } from './EnterCodeForm'
import ReactDOM from 'react-dom'

import firebase from "firebase"
import "firebase/database";

import '../style/style.css'

export default function GameRoom({match}) {
    var [time, updateTime] = useState(0)
    var [selected, setSelected] = useState([])
    const cards = []

    var CurrentRoom = match.params.room
    var GameOver = false

    var quiz2

    const getQuiz = async () => {
        const eventref = firebase.database().ref(`quizes/${match.params.gameid}`);
        const snapshot = await eventref.once('value');
        quiz2 = snapshot.val();
        setCardsFunction()
    }


    const UpdateTimeFunction = () => {
        if(GameOver == false){
        updateTime(time++)
        socket.emit('time', {
            time: time,
            room: CurrentRoom,
            user: match.params.user
        })
    }
    }

    const setCardsFunction = () => {
        console.log(quiz2)
        for(var i = 0; i < 6; i++){
            cards.push({
                question: quiz2[`q${i}`].question,
                ans: quiz2[`q${i}`].answer
            })
        }
        console.log(randomArrayShuffle(cards))
        GetCards()

    }
    function randomArrayShuffle(array) {
        var currentIndex = array.length, temporaryValue, randomIndex;
        while (0 !== currentIndex) {
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex -= 1;
          temporaryValue = array[currentIndex];
          array[currentIndex] = array[randomIndex];
          array[randomIndex] = temporaryValue;
        }
        return array;
      }
    

    var elements = 0
    const GetCards = () => {
        console.log(cards)
        for(var i = 0; i < cards.length; i++){
            let newCard = document.createElement('div')
            let newCard2 = document.createElement('div')
            const item = cards[i].question
            const ans = cards[i].ans
            newCard.id = 'cardDiv'
            newCard2.id = 'cardDiv2'
            document.getElementById('cardContainer').appendChild(newCard)
            document.getElementById('cardContainer').appendChild(newCard2)

            ReactDOM.render(
                <>
                <div className='card' id={item} onClick={()=>{CardClick(item, ans)}}>{item}</div>
                </>,
                newCard
            )
            ReactDOM.render(
                <>
                <div className='card' id={ans} onClick={()=>{CardClick(item, ans)}}>{ans}</div>
                </>,
                newCard2
            )
            elements += 2
 

        }
    }
    var memory = []
    function CardClick(ques, ans){
        setSelected(selected =>[...selected, {
            question: ques,
            ans: ans
        }])

        memory.push({
            question: ques,
            ans: ans
        })
        console.log(memory)

        if(memory.length == 2){

            if(memory[0].question == memory[1].question){
                console.log(memory[0].question, memory[1].ans)
                document.getElementById(memory[0].question).remove()
                document.getElementById(memory[1].ans).remove()

                elements -= 2

                console.log(elements, 'umber of elements')

                if(elements == 0){
                    socket.emit('PlayerFinsihed', {
                        room: match.params.room,
                        user: match.params.user
                    })
                }
            }
            else{
                updateTime(time += 5)
            }






            memory = []
            setSelected(selected = [])
        }

        const cardsRando = ()=>{
            const children = document.getElementById('cardContainer').childNodes

            children.forEach((child)=>{
                console.log(child)
            })
        }
        cardsRando()


        
    }

    useEffect(() => {
        getQuiz()
        setInterval(()=>{ 
            UpdateTimeFunction()    
        }, 1000);

        socket.on('joinedGameRoom', (data)=>{
            alert(data)
        })
        socket.emit('joinGame', {
            room: match.params.room,
            user: match.params.user
        })

        socket.on('timeBoard', (data)=>{
            //console.log(data.time, data.user)
        })

        socket.on('EndedGame', (data)=>{
            socket.emit('leaveRoom', {
                room: match.params.room,
                user: match.params.user
            })
            window.location = '/roomleave'
            sessionStorage.setItem('roomJoined', 'false')
        })
        return () => {
            GameOver = true
            socket.emit('leaveRoom', {
                room: match.params.room,
                user: match.params.user
            })
            sessionStorage.setItem('roomJoined', 'false')
        }
    }, [])


    return (
        <div>
            <h1>Time</h1>
            <h1>{time}</h1>
            <div id='cardContainer'></div>
            <h1>{JSON.stringify(selected)}</h1>
            <button onClick={()=>{getQuiz()}}>test firebase</button>
        </div>
    )
}
