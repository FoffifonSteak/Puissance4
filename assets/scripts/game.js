const board = document.querySelector('.board');
const table = [];
let columns = getCookie('columns');
let rows = getCookie('rows');
let player = true;
let light = document.querySelector('.who-is-playing');
document.querySelector("#y").textContent = columns;
document.querySelector("#x").textContent = rows;
document.querySelector(".board").style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
document.querySelector(".board").style.gridTemplateRows = `repeat(${rows}, 1fr)`;

for (let i = 0; i < columns; i++) {
    const row = [];
    for (let j = 0; j < rows; j++) {
        const cell = document.createElement('div');
        cell.classList.add('cell', 'empty');
        cell.dataset.row = i;
        cell.dataset.column = j;
        row.push(cell);
        cell.appendChild(document.createElement('div'));
        board.appendChild(cell);
        cell.addEventListener('click', () => {
            if (!cell.classList.contains('empty')) {
                return;
            }
            if (player) {
                set(j, i, 'yellow');
                light.classList.toggle('red');
                light.classList.toggle('yellow');
                console.log(check());
                player = false;
            } else {
                set(j, i, 'red');
                light.classList.toggle('red');
                light.classList.toggle('yellow');
                console.log(check());
                player = true;
            }
        })
    }
    table.push(row);
}

function check() {
    for (let i = 0; i < columns; i++) {
        for (let j = 0; j < rows; j++) {
            if (table[i][j].classList.contains('empty')) {
                continue;
            }
            const color = table[i][j].classList[1];
            // check horizontal
            if (j + 3 < rows && color === table[i][j + 1].classList[1] && color === table[i][j + 2].classList[1] && color === table[i][j + 3].classList[1]) {
                return true;
            }
            // check vertical
            if (i + 3 < columns && color === table[i + 1][j].classList[1] && color === table[i + 2][j].classList[1] && color === table[i + 3][j].classList[1]) {
                return true;
            }
        }

    }
}

function set(x, y, color) {
    table[y][x].classList.remove('empty');
    table[y][x].classList.add(color);
}


function getCookie(name) {
    let cookie = {};
    document.cookie.split(';').forEach(function (el) {
        let [k, v] = el.split('=');
        cookie[k.trim()] = v;
    })
    return cookie[name];
}


// set(0, 0, 'yellow');
// set(1, 0, 'yellow');
// set(2, 0, 'yellow');
// set(3, 0, 'yellow');
// set(4, 0, 'red');