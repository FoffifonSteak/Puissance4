class Cell {
    constructor(i, j) {
        this.i = i;
        this.j = j;
        this.element = document.createElement('div');
        this.element.classList.add('cell', 'empty');
        this.element.appendChild(document.createElement('div'));
    }

    registerClickHandler(game) {
        this.element.addEventListener("click", () => {
            if (!document.getElementById("new-button").classList.contains("hidden")) return;
            const oldPlayerTurn = game.playerTurn;
            game.playerTurn = game.play(this, game.playerTurn);
            if (game.playerTurn !== oldPlayerTurn) {
                game.light.classList.toggle('yellow-bg');
                game.light.classList.toggle('red-bg');
            }
            game.checkVictory();
        })
    }
}

class Game {
    constructor(rows, columns) {
        this.rows = rows;
        this.columns = columns;
        this.table = [];
        this.boards = [];
        this.scores = {
            yellow: 0,
            red: 0,
            max: 3
        }
        this.playerTurn = Math.random() < 0.5 ? "yellow" : "red";
        this.light = document.querySelector('.who-is-playing');
        this.board = document.querySelector('.board');
    }

    init() {
        this.light.classList.add(this.playerTurn + "-bg");
        document.querySelector("#y").textContent = columns;
        document.querySelector("#x").textContent = rows;
        document.querySelector(".board").style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
        document.querySelector(".board").style.gridTemplateRows = `repeat(${rows}, 1fr)`;
        this.startTime = Date.now();
        this.updateTime();
        this.runTimeLoop();

        for (let i = 0; i < rows; i++) {
            const row = [];
            for (let j = 0; j < columns; j++) {
                const cell = new Cell(i, j);
                row.push(cell);
                this.board.appendChild(cell.element);
                cell.registerClickHandler(this);
            }
            this.table.push(row);
        }
        this.registerResetButton();
        this.registerNewGameButton();
    }

    runTimeLoop() {
        this.intervalId = setInterval(this.updateTime, 1000);
    }

    // Arrow function to keep the context of the class and not the interval
    updateTime = () => {
        let time = Date.now() - this.startTime;
        let seconds = Math.floor((time / 1000) % 60);
        let minutes = Math.floor((time / (1000 * 60)) % 60);
        document.querySelector("#time").textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }

    registerNewGameButton() {
        document.getElementById("new-button").addEventListener("click", () => {
            this.clearErrorOrAnnounce();
            if (!(this.scores.yellow === this.scores.max || this.scores.red === this.scores.max)) {
                this.setError("La partie n'est pas terminée");
                return;
            }
            document.getElementById("new-button").classList.toggle("hidden"); // Hide the button
            document.getElementById("empty-button").classList.toggle("hidden"); // Show the empty button that create space between time and buttons
            document.querySelector(`#yellow-score`).textContent = 0;
            document.querySelector(`#red-score`).textContent = 0;
            this.scores = {
                yellow: 0,
                red: 0,
                max: this.scores.max
            }
            document.querySelector("#time").textContent = "00:00";
            this.startTime = Date.now();
            this.runTimeLoop();
            this.playerTurn = Math.random() < 0.5 ? "yellow" : "red";
            this.light.classList.toggle('yellow-bg');
            this.light.classList.toggle('red-bg');
            this.resetTable();
        })
    }

    registerResetButton() {
        document.getElementById("reset-button").addEventListener("click", () => {
            this.clearErrorOrAnnounce();
            document.querySelector(`#yellow-score`).textContent = 0;
            document.querySelector(`#red-score`).textContent = 0;
            this.scores = {
                yellow: 0,
                red: 0,
                max: this.scores.max
            }
            document.querySelector("#time").textContent = "00:00";
            this.startTime = Date.now();
            this.runTimeLoop();
            this.playerTurn = Math.random() < 0.5 ? "yellow" : "red";
            this.light.classList.toggle('yellow-bg');
            this.light.classList.toggle('red-bg');
            this.resetTable();
        })
    }

    resetTable() {
        this.table.forEach(row => row.forEach(cell => {
            cell.element.classList.remove('red-bg');
            cell.element.classList.remove('yellow-bg');
            cell.element.classList.add('empty');
        }));
    }

    set(x, y, color) {
        this.table[y][x].element.classList.remove('empty');
        this.table[y][x].element.classList.add(color);
    }

    setError(error) {
        const element = document.querySelector("#line-2");
        element.textContent = error;
        element.classList.toggle("error");
    }

    setAnnounce(message) {
        const element = document.querySelector("#line-2");
        element.innerHTML = message;
        element.classList.toggle("announce");
    }

    clearErrorOrAnnounce() {
        const element = document.querySelector("#line-2");
        element.textContent = "";
        element.classList.remove("error");
        element.classList.remove("announce");
    }

    play(cell, color) {
        this.clearErrorOrAnnounce();
        for (let y = (rows - 1); y >= 0; y--) {
            if (this.table[y][cell.j].element.classList.contains('empty')) {
                this.set(cell.j, y, color + "-bg");
                color = color === "yellow" ? "red" : "yellow";
                return color;
            }
        }

        this.setError("La colonne est pleine");
        return color;
    }

    checkVictory() {
        const win = async color => {
            this.scores[color]++;
            document.querySelector(`#${color}-score`).textContent = this.scores[color];

            let time = Date.now() - this.startTime;
            let seconds = Math.floor((time / 1000) % 60);
            let minutes = Math.floor((time / (1000 * 60)) % 60);

            this.boards.push({
                board: this.table.map(row => row.map(cell => cell.element.classList.contains("yellow-bg") ? 1 : (cell.element.classList.contains("red-bg") ? 2 : 0))),
                date: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
                playerYellow: this.scores.yellow,
                playerRed: this.scores.red
            })
            if (this.scores[color] >= this.scores.max) {
                document.getElementById("empty-button").classList.toggle("hidden"); // Hide the empty button that create space between time and buttons
                document.getElementById("new-button").classList.toggle("hidden"); // Show the new button
                this.sendScore();
                this.setAnnounce(`Le joueur <span class="${color}">${color === "red" ? "rouge" : "jaune"}</span> a gagné la partie !`);
                clearInterval(this.intervalId);
            } else {
                this.resetTable();
                this.setAnnounce(`Le joueur <span class="${color}">${color === "red" ? "rouge" : "jaune"}</span> a gagné la manche !`);
            }
        }

        const isGameEqual = () => {
            for (let y = 0; y < this.rows; y++) {
                for (let x = 0; x < this.columns; x++) {
                    if (this.table[y][x].element.classList.contains('empty')) {
                        return false;
                    }
                }
            }
            return true;
        }

        if (isGameEqual()) {
            this.setAnnounce("Match nul !");
            this.scores.yellow++;
            this.scores.red++;
            document.querySelector(`#yellow-score`).textContent = this.scores.yellow;
            document.querySelector(`#red-score`).textContent = this.scores.red;

            let time = Date.now() - this.startTime;
            let seconds = Math.floor((time / 1000) % 60);
            let minutes = Math.floor((time / (1000 * 60)) % 60);

            this.boards.push({
                board: this.table.map(row => row.map(cell => cell.element.classList.contains("yellow-bg") ? 1 : (cell.element.classList.contains("red-bg") ? 2 : 0))),
                date: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
                playerYellow: this.scores.yellow,
                playerRed: this.scores.red
            })
            this.resetTable();
            if (this.scores.yellow >= this.scores.max || this.scores.red >= this.scores.max) {
                document.getElementById("empty-button").classList.toggle("hidden"); // Hide the empty button that create space between time and buttons
                document.getElementById("new-button").classList.toggle("hidden"); // Show the new button
                clearInterval(this.intervalId);
                this.sendScore();
                this.clearErrorOrAnnounce();
                if (this.scores.yellow > this.scores.red) {
                    setAnnounce(`Le joueur <span class="yellow">jaune</span> a gagné la partie !`);
                } else if (this.scores.yellow < this.scores.red) {
                    setAnnounce(`Le joueur <span class="red">rouge</span> a gagné la partie !`);
                } else {
                    setAnnounce(`Match nul, la partie est finie !`);
                }
            }
        }

        // Check horizontal
        for (let y = 0; y < this.rows; y++) {
            let count = 0;
            let color = null;
            for (let x = 0; x < this.columns; x++) {
                if (this.table[y][x].element.classList.contains('empty')) {
                    count = 0;
                    color = null;
                } else if (this.table[y][x].element.classList.contains(color)) {
                    count++;
                    if (count >= 4) {
                        win(color.replace("-bg", ""));
                        return;
                    }
                } else {
                    count = 1;
                    color = this.table[y][x].element.classList[1];
                }
            }
        }

        // Check vertical
        for (let x = 0; x < this.columns; x++) {
            let count = 0;
            let color = null;
            for (let y = 0; y < this.rows; y++) {
                if (this.table[y][x].element.classList.contains('empty')) {
                    count = 0;
                    color = null;
                } else if (this.table[y][x].element.classList.contains(color)) {
                    count++;
                    if (count >= 4) {
                        win(color.replace("-bg", ""));
                        return;
                    }
                } else {
                    count = 1;
                    color = this.table[y][x].element.classList[1];
                }
            }
        }

        // Check diagonal
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                let count = 0;
                let color = null;
                for (let i = 0; i < 4; i++) {
                    if (y + i < this.rows && x + i < this.columns) {
                        if (this.table[y + i][x + i].element.classList.contains('empty')) {
                            count = 0;
                            color = null;
                        } else if (this.table[y + i][x + i].element.classList.contains(color)) {
                            count++;
                            if (count >= 4) {
                                win(color.replace("-bg", ""));
                                return;
                            }
                        } else {
                            count = 1;
                            color = this.table[y + i][x + i].element.classList[1];
                        }
                    }
                }
            }
        }

        // Check anti-diagonal
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.columns; x++) {
                let count = 0;
                let color = null;
                for (let i = 0; i < 4; i++) {
                    if (y + i < this.rows && x - i >= 0) {
                        if (this.table[y + i][x - i].element.classList.contains('empty')) {
                            count = 0;
                            color = null;
                        } else if (this.table[y + i][x - i].element.classList.contains(color)) {
                            count++;
                            if (count >= 4) {
                                win(color.replace("-bg", ""));
                                return;
                            }
                        } else {
                            count = 1;
                            color = this.table[y + i][x - i].element.classList[1];
                        }
                    }
                }
            }
        }
    }

    sendScore() {
        return fetch(BASE_URL + '/score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                playerRed: this.scores.red,
                playerYellow: this.scores.yellow,
                boardSizeX: this.columns,
                boardSizeY: this.rows,
                hostId: getCookie("hostId"),
                boards: this.boards
            }),
        }).then(async resp => {
            if (resp.status < 200 || resp.status >= 300) {
                console.error("Error while sending score", await resp.text());
            }
        })
    }


}

let rows = Number(getCookie('rows'));
let columns = Number(getCookie('columns'));
const game = new Game(rows, columns);
game.init();