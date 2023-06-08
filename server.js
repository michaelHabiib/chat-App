const { Socket } = require('dgram')
const express = require('express')
const app = express()
const http = require('http').createServer(app)

const io = require('socket.io')(http,{
    cors : {
        origin : '*'
    }
})
app.get('/', (req,res) =>{
    res.send("hello world")
})

let userList  = new Map()

io.on('connection', (Socket) =>{
    let userName = Socket.handshake.query.userName
    addUser(userName, Socket.id)

    Socket.broadcast.emit('user-list',[userList.keys()])
    Socket.emit('user-list',[userList.keys()])

    Socket.on('message', (msg) =>{
        Socket.broadcast.emit('message-broadcast',{message : msg, userName : userName})
    })

    Socket.on('disconnected', (reason) => {
        DeleteUser(userName, Socket.id)
    })
})

function addUser(userName, id){
    if(!userList.has(userName)){
        userList.set(userName, new Set(id))
    }else{
        userList.get(userName).add(id)
    }
}

function DeleteUser(userName, id){
    if(userList.has(userName)){
        let userIds =userList.get(userName);
            if(userIds == 0){
                userList.delete(userName)
            }
    }
}


http.listen(3000, ()=>{
    console.log('server runing on port 3000');
})