const express = require('express');
const socket = require('socket.io');
const http = require('http');
const { Chess } = require('chess.js');
const PORT = 8000;
const app = express();
const path = require('path');
const sever = http.createServer(app);
const io = socket(sever);
const chess = new Chess();
const players = {};

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', require('./Routes/indexRoutes'));

io.on("connection", function (soc) {
    console.log("user is connect");
    if (!players.White) {
        players.White = soc.id;
        soc.emit("playerRole", "White");
    console.log("You are is White");

    } else if (!players.Black) {
        players.Black = soc.id;
        soc.emit("playerRole", "Black");
    console.log("You are is Balck");

    } else {
        soc.emit("SpectatorRole"); 
    console.log("You are only view game");

    }

    soc.on("disconnect", function () {
        if (soc.id === players.White) {
            delete players.White;
        } else if (soc.id === players.Black) {
            delete players.Black;
        }
    });

    soc.on("move", function (move) {
        try {
            if (chess.turn() === "w" && soc.id !== players.White) return;
            if (chess.turn() === "b" && soc.id !== players.Black) return;
            const result = chess.move(move);
            if (result) {
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            } else {
                console.log("Invalid Move:", move);
                soc.emit("invalidMove", move);
            }
        } catch (err) {
            console.log(err);
            soc.emit("wrongMove", move);
        }
    });
});

sever.listen(PORT, () => {
    console.log(`Server is runing in PORT http://localhost:${PORT}`);
});