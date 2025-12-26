const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const scoreElement = document.getElementById('score');

context.scale(20, 20);

// Кольори для фігурок (пастельна палітра)
const colors = [
    null,
    '#ffb6c1', // Рожевий
    '#add8e6', // Блакитний
    '#98fb98', // М'ятний
    '#fdfd96', // Жовтий
    '#ffdab9', // Персиковий
    '#e6e6fa', // Лавандовий
    '#ffc0cb'  // Світло-рожевий
];

// Створення матриці гри
function createMatrix(w, h) {
    const matrix = [];
    while (h--) matrix.push(new Array(w).fill(0));
    return matrix;
}

// Малюємо фігурку або поле
function draw() {
    context.fillStyle = '#fafafa';
    context.fillRect(0, 0, canvas.width, canvas.height);

    drawMatrix(arena, {x: 0, y: 0});
    drawMatrix(player.matrix, player.pos);
}

function drawMatrix(matrix, offset) {
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x, y + offset.y, 1, 1);
                // Додаємо маленьку білу крапку для "милості"
                context.fillStyle = 'rgba(255, 255, 255, 0.5)';
                context.fillRect(x + offset.x + 0.1, y + offset.y + 0.1, 0.2, 0.2);
            }
        });
    });
}

// Логіка зіткнень
function collide(arena, player) {
    const [m, o] = [player.matrix, player.pos];
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 && (arena[y + o.y] && arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}

// Очищення ліній
function arenaSweep() {
    let rowCount = 1;
    outer: for (let y = arena.length - 1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) continue outer;
        }
        const row = arena.splice(y, 1)[0].fill(0);
        arena.unshift(row);
        ++y;
        player.score += rowCount * 10;
        rowCount *= 2;
    }
    scoreElement.innerText = player.score;
}

// Створення фігур
function createPiece(type) {
    if (type === 'T') return [[0, 1, 0], [1, 1, 1], [0, 0, 0]];
    if (type === 'O') return [[2, 2], [2, 2]];
    if (type === 'L') return [[0, 3, 0], [0, 3, 0], [0, 3, 3]];
    if (type === 'J') return [[0, 4, 0], [0, 4, 0], [4, 4, 0]];
    if (type === 'I') return [[0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0], [0, 5, 0, 0]];
    if (type === 'S') return [[0, 6, 6], [6, 6, 0], [0, 0, 0]];
    if (type === 'Z') return [[7, 7, 0], [0, 7, 7], [0, 0, 0]];
}

function playerDrop() {
    player.pos.y++;
    if (collide(arena, player)) {
        player.pos.y--;
        merge(arena, player);
        playerReset();
        arenaSweep();
    }
    dropCounter = 0;
}

function merge(arena, player) {
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) arena[y + player.pos.y][x + player.pos.x] = value;
        });
    });
}

function playerReset() {
    const pieces = 'ILJOTSZ';
    player.matrix = createPiece(pieces[pieces.length * Math.random() | 0]);
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) - (player.matrix[0].length / 2 | 0);
    if (collide(arena, player)) {
        arena.forEach(row => row.fill(0));
        player.score = 0;
        scoreElement.innerText = player.score;
    }
}

function rotate(matrix, dir) {
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
        }
    }
    if (dir > 0) matrix.forEach(row => row.reverse());
    else matrix.reverse();
}

const arena = createMatrix(12, 20);
const player = { pos: {x: 0, y: 0}, matrix: null, score: 0 };

document.addEventListener('keydown', event => {
    if (event.keyCode === 37) player.pos.x--; // Вліво
    else if (event.keyCode === 39) player.pos.x++; // Вправо
    else if (event.keyCode === 40) playerDrop(); // Вниз
    else if (event.keyCode === 38) { // Вгору (поворот)
        rotate(player.matrix, 1);
        if (collide(arena, player)) rotate(player.matrix, -1);
    }
    if (collide(arena, player)) {
        if (event.keyCode === 37) player.pos.x++;
        else if (event.keyCode === 39) player.pos.x--;
    }
});

let dropCounter = 0;
let dropInterval = 1000;
let lastTime = 0;

function update(time = 0) {
    const deltaTime = time - lastTime;
    lastTime = time;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) playerDrop();
    draw();
    requestAnimationFrame(update);
}

playerReset();
update();