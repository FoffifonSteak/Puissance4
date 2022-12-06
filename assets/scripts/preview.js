const board = document.querySelector('.board');

let table = [];
let scores = {
    yellow: 0,
    red: 0,
    max: 3
}
let columns = 0;
let rows = 0;

const updateBoard = () => {
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < columns; j++) {
            const cell = document.createElement('div');
            cell.classList.add('cell', table[i][j] === 1 ? 'yellow-bg' : table[i][j] === 2 ? 'red-bg' : 'empty');
            cell.dataset.row = i;
            cell.dataset.column = j;
            row.push(cell);
            cell.appendChild(document.createElement('div'));
            board.appendChild(cell);
        }
        table.push(row);
    }
}

const updateStats = (json, i) => {
    const boardRecord = json.boards[i];
    table = boardRecord.board;
    scores.yellow = boardRecord.playerYellow;
    scores.red = boardRecord.playerRed;

    document.querySelector("#y").textContent = json.boardSizeX;
    document.querySelector("#x").textContent = json.boardSizeY;
    document.querySelector(".board").style.gridTemplateColumns = `repeat(${json.boardSizeX}, 1fr)`;
    document.querySelector(".board").style.gridTemplateRows = `repeat(${json.boardSizeY}, 1fr)`;
    document.querySelector("#time").textContent = boardRecord.date;
    document.querySelector(`#yellow-score`).textContent = scores.yellow;
    document.querySelector(`#red-score`).textContent = scores.red;
    columns = json.boardSizeX;
    rows = json.boardSizeY;
    let light = document.querySelector('.who-is-playing');
    light.classList.add(boardRecord.playerYellow > boardRecord.playerRed ? 'yellow-bg' : 'red-bg');
    light.classList.remove(boardRecord.playerYellow < boardRecord.playerRed ? 'yellow-bg' : 'red-bg');
}

fetch(BASE_URL + '/score?gameId=' + new URLSearchParams(location.search).get("gameId")).then(async resp => {
    if (resp.status < 200 || resp.status >= 300) {
        console.error("Error while fetching score", await resp.text());
        return;
    }
    const body = await resp.json();
    if (!body.length) {
        console.error("No boards found");
        return;
    }
    const game = body[0];
    game.boards.forEach((b, i) => {
        let divElement = document.createElement("div");
        divElement.textContent = `${b.playerYellow} vs ${b.playerRed}`;
        divElement.addEventListener("click", () => {
            board.innerHTML = "";
            table = b.board;
            scores = {
                yellow: b.playerYellow,
                red: b.playerRed,
                max: scores.max
            }

            updateBoard();
            updateStats(game, i);
        })
        document.querySelector(".date-picker").appendChild(divElement)
    })

    updateStats(game, 0);
    updateBoard();
}).catch(err => {
    console.error("Error while fetching scores", err);
})