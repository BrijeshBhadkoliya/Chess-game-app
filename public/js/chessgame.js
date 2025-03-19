const socket = io();
const chess = new Chess();
const chessboard = document.querySelector('.chessboard');
let dragPice = null;
let sourceSquare = null;
let playerRole = null;

const RenderBoard = () => {
    const board = chess.board();
    chessboard.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((column, colIndex) => {
            const square = document.createElement('div');
            square.classList.add("suq", (rowIndex + colIndex) % 2 == 0 ? "light" : "dark");
            square.dataset.row = rowIndex;
            square.dataset.col = colIndex;

            if (column) {
                const pieceElement = document.createElement('div');
                pieceElement.classList.add('piece', column.color === 'w' ? "White" : "Black");
                pieceElement.innerText = GetPieceUnicode(column);

                // pieceElement.draggable = (playerRole === column.color && playerRole === chess.turn());
                pieceElement.draggable = true;
                pieceElement.addEventListener("dragstart", (e) => {
                    if (pieceElement.draggable) {
                        dragPice = pieceElement;
                        sourceSquare = { row: rowIndex, col: colIndex };
                    }
                    e.dataTransfer.setData("text/plain", "");
                });

                pieceElement.addEventListener("dragend", () => {
                    dragPice = null;
                    sourceSquare = null;
                });

                square.appendChild(pieceElement);
            }

            square.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            square.addEventListener("drop", (e) => {
                e.preventDefault();
                if (dragPice) {
                    const targetSquare = {
                        row: Number(square.dataset.row),
                        col: Number(square.dataset.col)
                    };
                    HandleMove(sourceSquare, targetSquare);
                }
            });

            chessboard.appendChild(square);
        });
    });
};

const HandleMove = (source, target) => {
    const move = {
        from: `${String.fromCharCode(97 + source.col)}${8 - source.row}`,
        to: `${String.fromCharCode(97 + target.col)}${8 - target.row}`,
        promotion: 'q'
    };
    socket.emit("move", move);
};

const GetPieceUnicode = (piece) => {
    const unicodePieces = {
        p: "♙", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚",
        P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔"
    };
    return unicodePieces[piece.type] || "";
};

socket.on("playerRole", function (role) {
    playerRole = role;
    RenderBoard();
});

socket.on("SpectatorRole", function () {
    playerRole = null;
    RenderBoard();
});

socket.on("boardState", function (fen) {
    chess.load(fen);
    RenderBoard();
});

socket.on("move", function (move) {
    chess.move(move);
    RenderBoard();
});

socket.on("invalidMove", function (move) {
    alert("Invalid Move");
});

socket.on("wrongMove", function (move) {
    alert("Wrong Move");
});

RenderBoard();