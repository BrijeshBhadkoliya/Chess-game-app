const  socket = io();
const chess = new Chess();
const chessboard = document.querySelector('.chessboard')
const dragPice =null
const  sourceSquare = null 
const playerRola = null

const RenderBoard = () => {
 const  board = chess.board()
 chessboard.innerHTML =""
 board.forEach((row,rowin)=> {
    row.forEach((colum,colindex)=>{
       const pice = document.createElement('div')
       pice.classList.add("suq",(rowin + colindex)%2==0 ? "light" : "dark")
         pice.dataset.row = rowin
         pice.dataset.col = colindex

         if(colum){
            console.log(colum);
            
            const pieceElent = document.createElement('div');
            pieceElent.classList.add('piece', colum.color === 'w' ? "White" : "Black")
            pieceElent.innerText = GetPieceUnicode(colum);
            pieceElent.draggable =  playerRola == colum.color
            pieceElent.addEventListener("dragstart", (e)=>{
                if(pieceElent.draggable){
                    dragPice =  pieceElent
                    sourceSquare = { row:rowindex, col:colindex}
                }
                e.dataTransfer.setData("text/plain" , "")
            })
            pieceElent.addEventListener("dragend", (e) => {
                dragPice = null
                sourceSquare = null
            })
            pice.appendChild(pieceElent)
         }
         pice.addEventListener("dragover", function(e){
            e.preventDefault();
         })
         pice.addEventListener("drop", function(e){
            e.preventDefault();
            if(dragPice){
                const targetSource = {
                    row: Number(upice.dataset.row),
                    col: Number(pice.dataset.col)
                }
                HandleMove(sourceSquare,targetSource)
            }
         })
 chessboard.appendChild(pice)

    })
 });
}
const HandleMove = (source,target) => {
    const move = {
        from:`${String.fromCharCode(97+source.col)}${8-source.row}`,
        to:`${String.fromCharCode(97+target.col)}${8-target.row}`,
        promotion:'q'
    }
    socket.emit("move",move)
}

const GetPieceUnicode = (piece) => {
    const unicodePieces = {
        p:"♟",
        r:"♜",
        n:"♞",
        b:"♝",
        q:"♛",
        k:"♚",											
        P:"♙",
        R:"♖",
        N:"♘",
        B:"♗",
        Q:"♕",
        K:"♔"
       
    }
    return unicodePieces[piece.type] || ""
}

socket.on("playerRole", function(role){
    playerRola = role;
    RenderBoard();
})
socket.on("SpectatorRole", function(){
    playerRola = null;
    RenderBoard();
})
socket.on("boardState", function(fen){
    chess.load(fen)
    RenderBoard();
})
socket.on("boardState", function(move){
    chess.move(move)
    RenderBoard();
})
RenderBoard()