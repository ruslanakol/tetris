const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const gameOverScreen = document.getElementById('game-over');
const pauseScreen = document.getElementById('pause-screen');

context.scale(20, 20);

let paused = false;
let gameOver = false;

// ... (функції createMatrix, drawMatrix, collide, arenaSweep, createPiece, rotate залишаються з минулого разу) ...

function playerDrop() {
    if (paused || gameOver) return;
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);

    if (collide(arena, player)) {
        gameOver = true;
        gameOverScreen.classList.remove('hidden');
    }
}

function resetGame() {
    arena.forEach(row => row.fill(0));
    player.score = 0;
    scoreElement.innerText = 0;
    gameOver = false;
    gameOverScreen.classList.add('hidden');
    playerReset();
    update();
}

function togglePause() {
    paused = !paused;
    pauseScreen.classList.toggle('hidden', !paused);
}

// Керування (Клавіатура)
document.addEventListener('keydown', event => {
    if (gameOver) return;
    if (event.keyCode === 37) player.pos.x--;
    else if (event.keyCode === 39) player.pos.x++;
    else if (event.keyCode === 40) playerDrop();
    else if (event.keyCode === 38) {
        rotate(player.matrix, 1);
        if (collide(arena, player)) rotate(player.matrix, -1);
    }
});

// Керування (Телефон)
document.getElementById('left').onclick = () => { if(!paused && !gameOver) player.pos.x--; };
document.getElementById('right').onclick = () => { if(!paused && !gameOver) player.pos.x++; };
document.getElementById('down').onclick = () => { playerDrop(); };
document.getElementById('rotate').onclick = () => {
    if(!paused && !gameOver) {
        rotate(player.matrix, 1);
        if (collide(arena, player)) rotate(player.matrix, -1);
    }
};
document.getElementById('pause').onclick = togglePause;

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    if (paused || gameOver) return;
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    requestAnimationFrame(update);
}

// Запуск
playerReset();
update();