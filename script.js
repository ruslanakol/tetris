const canvas = document.getElementById("board");
const nextCanvas = document.getElementById("next");
const ctx = canvas.getContext("2d");
const nextCtx = nextCanvas.getContext("2d");

canvas.width = 10*30;
canvas.height = 20*30;
nextCanvas.width = 4*30;
nextCanvas.height = 4*30;

const COLS = 10, ROWS = 20, BLOCK = 30;

let board = Array.from({length: ROWS}, () => Array(COLS).fill(0));
let score = 0;
let paused = false;

document.getElementById("pause").onclick = () => paused = !paused;

const shapes = {
    I: [[1,1,1,1]],
    O: [[1,1],[1,1]],
    T: [[1,1,1],[0,1,0]],
    S: [[0,1,1],[1,1,0]],
    Z: [[1,1,0],[0,1,1]],
    J: [[1,0,0],[1,1,1]],
    L: [[0,0,1],[1,1,1]]
};

const colors = {
    I:"#00FFFF", O:"#FFD700", T:"#9932CC",
    S:"#32CD32", Z:"#FF4500", J:"#4169E1", L:"#FFA500"
};

function randomPiece(){
    const keys = Object.keys(shapes);
    const key = keys[Math.floor(Math.random()*keys.length)];
    return {shape: shapes[key], x:3, y:0, color:colors[key]};
}

let current = randomPiece();
let next = randomPiece();

function draw(){
    ctx.fillStyle="#000";
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // поле
    for(let y=0;y<ROWS;y++){
        for(let x=0;x<COLS;x++){
            if(board[y][x]) drawBlock(x,y,board[y][x]);
        }
    }
    // фігура
    current.shape.forEach((row, i) =>
        row.forEach((v, j) => v && drawBlock(current.x+j, current.y+i, current.color))
    );
}

function drawBlock(x,y,color){
    ctx.fillStyle=color;
    ctx.fillRect(x*BLOCK,y*BLOCK,BLOCK,BLOCK);
    ctx.strokeStyle="#111";
    ctx.strokeRect(x*BLOCK,y*BLOCK,BLOCK,BLOCK);
}

function collides(){
    return current.shape.some((row,i) =>
        row.some((v,j)=> v && (
            y=current.y+i,
                x=current.x+j,
            y>=ROWS||x<0||x>=COLS||board[y][x]
        ))
    );
}

function merge(){
    current.shape.forEach((row,i)=>{
        row.forEach((v,j)=>{ if(v) board[current.y+i][current.x+j]=current.color; });
    });
}

function clearLines(){
    for(let y=ROWS-1;y>=0;y--){
        if(board[y].every(v=>v)){
            animateBreak(y);
            board.splice(y,1);
            board.unshift(Array(COLS).fill(0));
            score+=10;
            document.getElementById("score").textContent=score;
            y++;
        }
    }
}

function animateBreak(row){
    for(let x=0;x<COLS;x++){
        ctx.fillStyle = board[row][x];
        ctx.save();
        ctx.translate(x*BLOCK, row*BLOCK);
        ctx.beginPath();
        ctx.rect(0,0,BLOCK,BLOCK);
        ctx.fill();
        ctx.restore();
    }
    canvas.style.animation = "shake 0.2s";
    setTimeout(()=>canvas.style.animation="",200);
}

function drop(){
    if(paused) return;
    current.y++;
    if(collides()){
        current.y--;
        merge();
        clearLines();
        current = next;
        next = randomPiece();
        drawNext();
        if(collides()) return gameOver();
    }
}

function drawNext(){
    nextCtx.fillStyle="#000";
    nextCtx.fillRect(0,0,nextCanvas.width,nextCanvas.height);
    next.shape.forEach((r,i)=>
        r.forEach((v,j)=>v && (
            nextCtx.fillStyle=next.color,
                nextCtx.fillRect(j*30,i*30,30,30)
        ))
    );
}

function gameLoop(){
    if(!paused){ draw(); }
    requestAnimationFrame(gameLoop);
}
setInterval(drop,600);
drawNext();
gameLoop();

function gameOver(){
    document.getElementById("gameOver").classList.remove("hidden");
}

function resetGame(){
    board = Array.from({length:ROWS},()=>Array(COLS).fill(0));
    score=0;
    document.getElementById("score").textContent=0;
    current=randomPiece(); next=randomPiece();
    document.getElementById("gameOver").classList.add("hidden");
}

function rotate(){
    const rotated=current.shape[0].map((_,i)=>current.shape.map(r=>r[i]).reverse());
    const prev=current.shape;
    current.shape=rotated;
    if(collides()) current.shape=prev;
}

/* 📱 Свайпи */
let startX,startY;
canvas.addEventListener("touchstart", e=>{
    startX=e.touches[0].clientX;
    startY=e.touches[0].clientY;
});
canvas.addEventListener("touchend", e=>{
    let dx = e.changedTouches[0].clientX - startX;
    let dy = e.changedTouches[0].clientY - startY;
    if(Math.abs(dx)>Math.abs(dy)){
        if(dx>40){ current.x++; if(collides()) current.x--; }
        if(dx<-40){ current.x--; if(collides()) current.x++; }
    } else {
        if(dy>40) drop();
        if(dy<-40) rotate();
    }
});
