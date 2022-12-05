const board = document.querySelector('.board');

const table = [];
let scores = {
    yellow: 0,
    red: 0,
    max: 3
}
let playerTurn = "yellow";
let columns = Number(getCookie('columns'));
let rows = Number(getCookie('rows'));
let light = document.querySelector('.who-is-playing');
document.querySelector("#y").textContent = columns;
document.querySelector("#x").textContent = rows;
document.querySelector(".board").style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
document.querySelector(".board").style.gridTemplateRows = `repeat(${rows}, 1fr)`;
let startTime = Date.now();
updateTime();
setInterval(updateTime, 1000);


// The time must be minutes:seconds
function updateTime() {
    let time = Date.now() - startTime;
    let seconds = Math.floor((time / 1000) % 60);
    let minutes = Math.floor((time / (1000 * 60)) % 60);
    document.querySelector("#time").textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

for (let i = 0; i < rows; i++) {
    const row = [];
    for (let j = 0; j < columns; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'empty');
        cell.dataset.row = i;
        cell.dataset.column = j;
        row.push(cell);
        cell.appendChild(document.createElement('div'));
        board.appendChild(cell);
        cell.addEventListener("click", () => {
            const oldPlayerTurn = playerTurn;
            playerTurn = play(cell.dataset.column, playerTurn);
            if (playerTurn !== oldPlayerTurn) {
                light.classList.toggle('yellow-bg');
                light.classList.toggle('red-bg');
            }
            // Timeout to wait that the animation is finished
            setTimeout(checkVictory, 100);
        })
    }
    table.push(row);
}

function set(x, y, color) {
    table[y][x].classList.remove('empty');
    table[y][x].classList.add(color);
}

function setError(error) {
    const element = document.querySelector("#line-2");
    element.textContent = error;
    element.classList.toggle("error");
}

function setAnnounce(message) {
    const element = document.querySelector("#line-2");
    element.innerHTML = message;
    element.classList.toggle("announce");
}

function clearErrorOrAnnounce() {
    const element = document.querySelector("#line-2");
    element.textContent = "";
    element.classList.remove("error");
    element.classList.remove("announce");
}

function play(x, color) {
    clearErrorOrAnnounce();
    for (let y = (rows - 1); y >= 0; y--) {
        if (table[y][x].classList.contains('empty')) {
            set(x, y, color + "-bg");
            color = color === "yellow" ? "red" : "yellow";
            return color;
        }
    }

    setError("La colonne est pleine");
    return color;
}

// This function check if there is a winner (4 same color in a row)
function checkVictory() {
    const resetTable = () => table.forEach(row => row.forEach(cell => {
        cell.classList.remove('red-bg');
        cell.classList.remove('yellow-bg');
        cell.classList.add('empty');
    }));

    const win = async color => {
        scores[color]++;
        document.querySelector(`#${color}-score`).textContent = scores[color];
        resetTable();
        if (scores[color] >= scores.max) {
            setAnnounce(`Le joueur <span class="${color}">${color}</span> a gagné la partie !`);
            document.getElementById("points").innerText = "Tu as " + (await sendScore()) + " points";
            document.querySelector(`#yellow-score`).textContent = 0;
            document.querySelector(`#red-score`).textContent = 0;
            scores = {
                yellow: 0,
                red: 0,
                max: scores.max
            }
        } else {
            setAnnounce(`Le joueur <span class="${color}">${color}</span> a gagné la manche !`);
        }
    }

    // Check horizontal
    for (let y = 0; y < columns - 1; y++) {
        for (let x = 0; x < 4; x++) {
            if (table[y][x].classList.contains('yellow-bg') && table[y][x + 1].classList.contains('yellow-bg') && table[y][x + 2].classList.contains('yellow-bg') && table[y][x + 3].classList.contains('yellow-bg')) {
                win('yellow');
            }
            if (table[y][x].classList.contains('red-bg') && table[y][x + 1].classList.contains('red-bg') && table[y][x + 2].classList.contains('red-bg') && table[y][x + 3].classList.contains('red-bg')) {
                win('red');
            }
        }
    }
    // Check vertical
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < columns; x++) {
            if (table[y][x].classList.contains('yellow-bg') && table[y + 1][x].classList.contains('yellow-bg') && table[y + 2][x].classList.contains('yellow-bg') && table[y + 3][x].classList.contains('yellow-bg')) {
                win('yellow');
            }
            if (table[y][x].classList.contains('red-bg') && table[y + 1][x].classList.contains('red-bg') && table[y + 2][x].classList.contains('red-bg') && table[y + 3][x].classList.contains('red-bg')) {
                win('red');
            }
        }
    }
    // Check diagonal
    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 4; x++) {
            if (table[y][x].classList.contains('yellow-bg') && table[y + 1][x + 1].classList.contains('yellow-bg') && table[y + 2][x + 2].classList.contains('yellow-bg') && table[y + 3][x + 3].classList.contains('yellow-bg')) {
                win('yellow');
            }
            if (table[y][x].classList.contains('red-bg') && table[y + 1][x + 1].classList.contains('red-bg') && table[y + 2][x + 2].classList.contains('red-bg') && table[y + 3][x + 3].classList.contains('red-bg')) {
                win('red');
            }
        }
    }

    // Check diagonal
    for (let y = 0; y < 3; y++) {
        for (let x = 3; x < columns; x++) {
            if (table[y][x].classList.contains('yellow-bg') && table[y + 1][x - 1].classList.contains('yellow-bg') && table[y + 2][x - 2].classList.contains('yellow-bg') && table[y + 3][x - 3].classList.contains('yellow-bg')) {
                win('yellow');
            }
            if (table[y][x].classList.contains('red-bg') && table[y + 1][x - 1].classList.contains('red-bg') && table[y + 2][x - 2].classList.contains('red-bg') && table[y + 3][x - 3].classList.contains('red-bg')) {
                win('red');
            }
        }
    }
}

const sendScore = async () => {
    return await fetch(BASE_URL + '/score', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            playerRed: scores.red,
            playerYellow: scores.yellow,
            boardSizeX: columns,
            boardSizeY: rows,
            hostId: getCookie("hostId")
        }),
    }).then(async resp => {
        if (resp.status !== 200) {
            console.error("Error while sending score", await resp.text());
        }
        return resp.text();
    })
}
