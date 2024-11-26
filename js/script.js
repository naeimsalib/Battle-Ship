/*----- Constants -----*/
const AUDIO = new Audio('https://cdn.pixabay.com/audio/2022/11/05/audio_997c8fe344.mp3');
const mainMenu = document.querySelector(".main-menu");
const startBtn = document.querySelector(".start-btn");
const gameArea = document.querySelector(".game-area");

/*----- App's State (Variables) -----*/
let aiBoard, pBoard, aiShips, pShips, gameState, turn, gameOver, aiLastHit;

/*----- Event Listeners -----*/
startBtn.addEventListener("click", moveStartMenu);

/*----- Functions -----*/

// Moves the Menu off screen and calls generate board twice on both boards
function moveStartMenu () {
    mainMenu.classList.add("move-left");
    gameArea.classList.remove("hidden");
    generateBoard("computer-board");
    generateBoard("player-board");
};

// Function to generate both boards (computers and Players Boards)
// Also Checks if the boardElement exists. 
// If not (e.g., invalid boardId), the function exits early without doing anything.
function generateBoard(boardId) {
    const boardElement = document.querySelector(`#${boardId} .game-board`);
    if (!boardElement) {
        return;
    }

    // Clear any existing content to avoid duplication
    boardElement.innerHTML = "";
        
    // Creates a 10X10 cells for each boards
    // Outer for loop iterates 10 times, representing the rows (i) of the game board.
    // Inner for loop iterates 10 times for each row, representing the columns (j) of the game board.
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            // Dynamically create a new <div> element for each cell in the grid.
            const cell = document.createElement("div");
            cell.id = `${boardId}-c${j}r${i}`; // Assigns a unique id to each cell (ex: "computer-board-c0r0");
            cell.classList.add("cell"); // Add the Cell class to the div
            boardElement.appendChild(cell); // Appends the newly created div with it's class
        }
    }
};



