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

io.on("connection", function (socket) {
    console.log("user is connect");

    if (!players.White) {
        players.White = socket.id;
        socket.emit("playerRole", "White");
    } else if (!players.Black) {
        players.Black = socket.id;
        socket.emit("playerRole", "Black");
    } else {
        socket.emit("SpectatorRole"); 0
    }

    socket.on("disconnect", function () {
        if (socket.id === players.White) {
            delete players.White;
        } else if (socket.id === players.Black) {
            delete players.Black;
        }
    });

    socket.on("move", function (move) {
        try {
            if (chess.turn() === "w" && socket.id !== players.White) return;
            if (chess.turn() === "b" && socket.id !== players.Black) return;

            const result = chess.move(move);

            if (result) {
                io.emit("move", move);
                io.emit("boardState", chess.fen());
            } else {
                console.log("Invalid Move:", move);
                socket.emit("invalidMove", move);
            }
        } catch (err) {
            console.log(err);
            socket.emit("wrongMove", move);
        }
    });
});

sever.listen(PORT, () => {
    console.log(`Server is runing in PORT http://localhost:${PORT}`);
});