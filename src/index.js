const express = require('express')
const http = require('http')
const path = require('path')
const socketio = require('socket.io')
const Filter= require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages')
const {addUser,getUser,getUsersInRoom,removeUser}= require('./utils/users')

const { text } = require('express')



const app = express()
const server= http.createServer(app) //express library does this behind the scenes anyway
const io= socketio(server)

const port= process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname,'../public')

app.use(express.static(publicDirectoryPath))

let message='Message Send Successfully'

io.on('connection',(socket)=>{
    
    socket.on('join',(options,callback)=>{
        
        const{error,user}=addUser({id:socket.id,
        ...options})

    if(error){
        return callback(error)
    }
     
     socket.join(user.room)
     
     socket.emit('Message',generateMessage('Admin','Welcome!'))   //Socket.emit sends the message to only one client (The one that sent message) 
     socket.broadcast.to(user.room).emit('Message',generateMessage(` ${user.username} has joined the chat!`))
     io.to(user.room).emit('roomData',{
        room:user.room, 
        users:getUsersInRoom(user.room)
     })
     callback()
        

    })

    socket.on('sendMessage',(textMsg,callback)=>{
    const filter=new Filter()
    const user = getUser(socket.id)

        if(filter.isProfane(textMsg))
        {
            return callback('Profanity is not allowed!!')
        }
        
        io.to(user.room).emit('Message',generateMessage(user.username,textMsg))  //Io.emit sends message to all the client connected to the connection
        callback('Delivered')    
        })

        socket.on('sendLocation',(o,callback)=>{
            const user = getUser(socket.id)
            io.to(user.room).emit('locationMessage',generateLocationMessage(user.username,`https://google.com/maps?q=${o.latitude},${o.longitude}`))
            callback()
        })

        socket.on('disconnect',()=>{
            const user  = removeUser(socket.id)
            if(user)
            {
                io.to(user.room).emit('Message',generateMessage(`${user.username} has left!`))
                io.to(user.room).emit('roomData',{
                    room:user.room,
                    users:getUsersInRoom(user.room)
                })
            }

        })
})

server.listen(port,()=>{
    console.log(`Server is up on port ${port}`)
})