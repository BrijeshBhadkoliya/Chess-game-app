const express = require('express');
const socket =require('socket.io')
const http = require('http')
const { Chess } = require('chess.js')
const PORT = 8000
const app = express()
const path = require('path');
const { log } = require('console');
const sever = http.createServer(app)
const io = socket(sever);
const chess = new Chess();
const players = {};
const firstplay = "White"



app.set('view engine', 'ejs')
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./Routes/indexRoutes'))
io.on("connection", function (socket)   {
    console.log("user is connect");
  
    if(!players.White){
        players.White = socket.id;
        socket.emit("PlayerRole", "White")
    }else   if(!players.Black){
        players.Black = socket.id;
        socket.emit("PlayerRole", "Black")
    }else{
        socket.emit("Spectetor")
    }
 socket.on("disconnect",function(){
    if(socket.id === players.White){
        delete players.White
    }else   if(socket.id === players.Black){
        delete players.Black

    }
 })

 socket.on("move",function(move){
    
  try{
    if(Chess.turn()=== "White" && socket.id != players.white) return ;
    if(Chess.turn()=== "Black" && socket.id != players.Black) return ;
   
    const result = Chess.move(move)

    if(result){
        currentPlayer = Chess.turn();
        io.emit("move", move)
        io.emit("boarState", chess.fen())

    }else{
        console.log("Invalid Move:", move);
        socket.emit("invalidMove",move)
    }
  } catch(err){
    console.log(err)
    socket.emit("wrog move", move)

  }
})
 
})
sever.listen(PORT, ()=>{
    console.log(`Server is runing in PORT http://localhost:${PORT}`);
    
})