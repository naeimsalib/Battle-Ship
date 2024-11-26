/*----- Constants -----*/
// AUDIO: Background music or sound effect for the game
//const AUDIO = new Audio('https://cdn.pixabay.com/audio/2022/11/05/audio_997c8fe344.mp3');

// DOM elements for main menu, start button, and game area
const mainMenu = document.querySelector(".main-menu");
const startBtn = document.querySelector(".start-btn");
const gameArea = document.querySelector(".game-area");
const turnIndicator = document.querySelector(".turn-indicator");

/*----- App's State (Variables) -----*/
let aiBoard;
let pBoard;
let aiShips;
let pShips;
let turn; // Sets player or computer turn , Player -> 1 , Computer -> -1
let gameOver;
let aiMemory;
/*----- Event Listeners -----*/
// Start button listener: Moves the main menu off-screen and begins game setup
startBtn.addEventListener("click", moveStartMenu);

/*----- Functions -----*/

/**
 * Initializes the game state and sets up everything for a new game
 */
function init() {
    // Create empty 10x10 grids for both Player and AI
    pBoard = createEmptyGrid();
    aiBoard = createEmptyGrid();

    // Define Player's ship inventory
    pShips = [
        { type: "Carrier", size: 5, cells: [] },
        { type: "Battleship", size: 4, cells: [] },
        { type: "Destroyer", size: 3, cells: [] },
        { type: "Submarine", size: 3, cells: [] },
        { type: "Patrol Boat", size: 2, cells: [] }
    ];

    // Define AI's ship inventory
    aiShips = [
        { type: "Carrier", size: 5, cells: [] },
        { type: "Battleship", size: 4, cells: [] },
        { type: "Destroyer", size: 3, cells: [] },
        { type: "Submarine", size: 3, cells: [] },
        { type: "Patrol Boat", size: 2, cells: [] }
    ];

    // Set initial game state
    turn = 1; // Player always starts first
    gameOver = false; // Game is not over initially
    render();
};


function render() {
    generateBoard("computer-board", aiBoard);
    generateBoard("player-board", pBoard);
    renderShips(); // Render ships in the ships-carrier section
    renderTurnIndicator();
    checkGameStatus();
}



/**
 * Creates an empty 10x10 grid
 * return A 10x10 array filled with "Empty"
 */
function createEmptyGrid() {
    return Array.from({ length: 10 }, () => Array(10).fill("Empty"));
};

/**
 * Moves the main menu off-screen and starts the setup phase
 */
function moveStartMenu() {
    mainMenu.classList.add("move-left"); // Moves the menu off-screen
    gameArea.classList.remove("hidden"); // Displays the game area
};

//  loop through each cell of "playerBoard" and "computerBoard" to display and update it with it's value
function renderBoards () {
    
};


/**
 * Renders ships dynamically in the ships-carrier section
 */
function renderShips() {
    const shipsCarrier = document.querySelector(".ships-carrier");

    // Define ship types and sizes
    const ships = [
        { id: "carrier", name: "Carrier", size: 5 },
        { id: "battleship", name: "Battleship", size: 4 },
        { id: "destroyer", name: "Destroyer", size: 3 },
        { id: "submarine", name: "Submarine", size: 3 },
        { id: "patrol-boat", name: "Patrol Boat", size: 2 }
    ];

    // Create and append ship previews
    ships.forEach((ship) => {
        const shipContainer = document.createElement("div");
        shipContainer.classList.add("ship-container");
        shipContainer.setAttribute("data-ship", ship.name);
        shipContainer.title = ship.name; // Tooltip

        // Create individual cells for the ship
        for (let i = 0; i < ship.size; i++) {
            const cell = document.createElement("div");
            cell.classList.add("ship-cell");
            cell.style.width = "4vmin"; // Match the board cell size
            cell.style.height = "4vmin";
            shipContainer.appendChild(cell);
        }

        shipsCarrier.appendChild(shipContainer);
    });
}

// Helper function to update the Turn indicator 
// By multiplying the current turn by -1 and assigning it to the turn variable 
function renderTurnIndicator(){
    turn *= -1;
};

function checkGameStatus(){
    if(!gameOver){

    }
};

function handlePlayerTurn (evt){

}
// Handles clicks on cells and console.log the cells information
function handleCellClick(cell, boardId) {
    if (boardId === "player-board") {
        cell.style.backgroundColor = "DarkBlue";
        cell.innerHTML = "Hit";
        console.log(cell.innerHTML);
    } else if (boardId === "computer-board") {
        cell.style.backgroundColor = "DarkBlue";
        cell.innerHTML = "Hit";
        console.log(cell.innerHTML);
    };
};

//  Generates a 10x10 game board for either the Player or AI
function generateBoard(boardId, board) {
    const boardElement = document.querySelector(`#${boardId} .game-board`);

    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const cell = document.createElement("div");
            cell.id = `${boardId}-c${j}r${i}`;
            cell.classList.add("cell");

            if (board[i][j] !== "Empty") {
                cell.style.backgroundColor = "blue"; // Highlight cells with ships
            };

            cell.addEventListener("click", () => handleCellClick(cell, boardId));
            boardElement.appendChild(cell);
        };
    };
};


// Initialize the game
init();
