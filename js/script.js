/*----- constants -----*/
const AUDIO = new Audio('https://cdn.pixabay.com/audio/2022/11/05/audio_997c8fe344.mp3');
const startBtn = document.querySelector(".start-btn");
const mainMenu = document.querySelector(".main-menu");
/*----- app's state (variables) -----*/

let aiBoard; // (10 x 10 array) that Tracks the computer ship placements, hits and misses.
let pBoard; // (10 x 10 array) that Tracks the player ship placements, hits and misses.
let aiShips; //Computer's ship inventory: Stores the list of the computer's ships with their sizes and statuses (e.g., positions, hit status).
let pShips; // Player's ship inventory: Stores the list of Player's ships with their sizes and statuses (e.g., positions, hit status).
let gameState; // Tracks the current state of the game (EX: settingUp, GamePlay, GameOver)
let turn; // Tracks who's turn it is, computer or player (EX: '1', '-1', 'null');
let gameOver; // takes two values, true of false to indicate if the game is over or not
let aiLastHit; // is a String that tracks the last hit.

/*----- cached element references -----*/


/*----- event listeners -----*/
startBtn.addEventListener("click", () => {
    mainMenu.classList.add("move-left");
    generateBoard("computer-board");
    generateBoard("player-board");
});

/*----- functions -----*/
function generateBoard(boardId) {
    const boardElement = document.querySelector(`#${boardId} .game-board`);
    
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const cell = document.createElement("div");
            cell.id = `${boardId}-c${j}r${i}`;
            cell.classList.add("cell");
            boardElement.appendChild(cell);
        }
    }
}
