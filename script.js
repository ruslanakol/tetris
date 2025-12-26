// --------- CONFIG ---------
const COLS = 10, ROWS = 20, SIZE = 32;
let board = Array.from({length:ROWS},()=>Array(COLS).fill(null));

const colors = {
    I: "#00e5ff",
    O: "#ffe64c",
    T: "#d26cff",
    S: "#7dff6c",
    Z: "#ff4b4b",
    J: "#4b7bff",
    L: "#ffa447",
};

const shapes = {
    I:[[1,1,1,1]],
    O:[[1,1],[1,1]],
    T:[[0,1,0],[1,1,1]],
    S:[[0,1,1],[1,1,0]],
    Z:[[1,1,0],[0,1,1]],
    J:[[1,0,0],[1,1,1]],
    L:[[0,0,1],[1,1,1]],
};

// --------- CANVAS ---------
const canvas = document.getElementById("board");
const ctx = canvas.getContext("2d");

const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

let score = 0;
let paused = false;
let ended = false;

// --------- PIECE ---------
function newPiece(){
    const keys = Object.keys(shapes);
    const type = keys[Math.floor(Math.random()*keys.length)];
    return {
        type,
        shape: shapes[type].map(r=>[...r]),
        x: 3,
        y: -1,
        color: colors[type]
    };
}

let current = newPiece(), next = newPiece();

// --------- GAME ---------
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // board
    for(let r=0;r<ROWS;r++){
        for(let c=0;c<COLS;c++){
            if(board[r][c]) drawCell(c,r,board[r][c]);
        }
    }

    // piece
    for(let r=0;r<current.shape.length;r++){
        for(let c=0;c<current.shape[r].length;c++){
            if(current.shape[r][c])
                drawCell(current.x+c, current.y+r, current.color);
        }
    }
}

function drawCell(x,y,color){
    if(y<0) return;
    ctx.fillStyle=color;
    ctx.fillRect(x*SIZE,y*SIZE,SIZE,SIZE);
    ctx.strokeStyle="#000";
    ctx.strokeRect(x*SIZE,y*SIZE,SIZE,SIZE);
}

function drawNext(){
    nextCtx.clearRect(0,0,128,128);
    nextCtx.fillStyle="#111";
    nextCtx.fillRect(0,0,128,128);

    for(let r=0;r<next.shape.length;r++){
        for(let c=0;c<next.shape[r].length;c++){
            if(next.shape[r][c]){
                nextCtx.fillStyle=next.color;
                nextCtx.fillRect(c*32+16,r*32+16,32,32);
                nextCtx.strokeStyle="#000";
                nextCtx.strokeRect(c*32+16,r*32+16,32,32);
            }
        }
    }
}

function rotate(){
    if(ended) return;
    const rotated = current.shape[0].map((_,i)=>current.shape.map(r=>r[i]).reverse());
    const prev = current.shape;
    current.shape = rotated;
    if(collides()) current.shape = prev;
}

function collides(){
    return current.shape.some((row,r)=>
        row.some((v,c)=>v && (
            current.x+c<0 || current.x+c>=COLS ||
            current.y+r>=ROWS ||
            board[current.y+r]?.[current.x+c]
        ))
    );
}

function merge(){
    current.shape.forEach((row,r)=>{
        row.forEach((v,c)=>{
            if(v && current.y+r>=0){
                board[current.y+r][current.x+c] = current.color;
            }
        });
    });
}

function clearLines(){
    for(let r=ROWS-1;r>=0;r--){
        if(board[r].every(v=>v)){
            board.splice(r,1);
            board.unshift(Array(COLS).fill(null));
            score+=100;
            document.getElementById("score").innerText="Score: "+score;
            r++;
        }
    }
}

function drop(){
    if(paused || ended) return;
    current.y++;

    if(collides()){
        current.y--;
        if(current.y===-1){
            gameOver();
            return;
        }
        merge();
        clearLines();
        current = next;
        next = newPiece();
        drawNext();
    }
    draw();
}

function gameOver(){
    ended = true;
    alert("GAME OVER");
}

draw();
drawNext();
let loop = setInterval(drop,700);

// --------- CONTROLS ---------
document.addEventListener("keydown", e=>{
    if(ended) return;
    if(e.key==="ArrowLeft"){ current.x--; if(collides()) current.x++; }
    if(e.key==="ArrowRight"){ current.x++; if(collides()) current.x--; }
    if(e.key==="ArrowDown"){ drop(); }
    if(e.key==="ArrowUp"){ rotate(); }
    draw();
});

document.getElementById("pauseBtn").onclick=()=>{
    paused = !paused;
    document.getElementById("pauseBtn").innerText = paused ? "▶ RESUME" : "⏸ PAUSE";
};

document.getElementById("restartBtn").onclick=()=>{
    location.reload();
};
