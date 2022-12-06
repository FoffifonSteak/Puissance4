fetch(BASE_URL + '/score', {
    method: 'GET',
}).then(response => response.json())
    .then(matches => {
        let totalMatches = 0;
        for (const match of matches.sort((a, b) => new Date(b.date) - new Date(a.date))) {
            const mainBlock = document.querySelector('.main-block');
            const blockElement = document.createElement('div');
            blockElement.classList.add('block');
            const leftElement = document.createElement('div');
            const winnerColorElement = document.createElement('div');
            winnerColorElement.classList.add('winner-color');
            winnerColorElement.classList.add(match.playerYellow > match.playerRed ? 'yellow' : (match.playerYellow < match.playerRed ? 'red' : 'equality'));
            const spanElement = document.createElement('span');
            spanElement.textContent = match.playerYellow + ' vs ' + match.playerRed;
            leftElement.appendChild(winnerColorElement);
            leftElement.appendChild(spanElement);
            leftElement.classList.add('left');
            const middleElement = document.createElement('div');
            const buttonElement = document.createElement('a');
            buttonElement.href = 'preview.html?gameId=' + match.gameId;
            buttonElement.textContent = 'Voir la partie';
            middleElement.appendChild(buttonElement);
            middleElement.classList.add('middle');
            const rightElement = document.createElement('div');
            rightElement.textContent = dayjs(match.date).format('DD/MM/YYYY');
            rightElement.classList.add('right');
            blockElement.appendChild(leftElement);
            blockElement.appendChild(middleElement);
            blockElement.appendChild(rightElement);
            mainBlock.appendChild(blockElement);
            if (getCookie("hostId") === match.hostId) {
                totalMatches++;
            }
        }
        document.querySelector('.nbgames').textContent = "Vous avez fait " + totalMatches + (totalMatches > 1 ? " parties" : " partie");
    });