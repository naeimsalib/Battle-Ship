/*----- Constants -----*/
// AUDIO: Background music or sound effect for the game
//const AUDIO = new Audio('https://cdn.pixabay.com/audio/2022/11/05/audio_997c8fe344.mp3');

// DOM elements for main menu, start button, and game area
const mainMenu = document.querySelector(".main-menu");
const startBtn = document.querySelector(".start-btn");
const gameArea = document.querySelector(".game-area");

/*----- App's State (Variables) -----*/
let aiBoard;
let pBoard;
let aiShips;
let pShips;
let gameState;
let turn;
let gameOver;

/*----- Event Listeners -----*/
// Start button listener: Moves the main menu off-screen and begins game setup
startBtn.addEventListener("click", moveStartMenu);

/*----- Functions -----*/

/**
 * Initializes the game state and sets up everything for a new game
 */
function init() {
    console.log("Initializing game...");

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
    gameState = "Setup"; // Game starts in the "Setup" phase
    turn = "Player"; // Player always starts first
    gameOver = false; // Game is not over initially
   
};


/**
 * Creates an empty 10x10 grid
 * return A 10x10 array filled with "Empty"
 */

function createEmptyGrid() {
    console.log("Creating empty grid...");
    return Array.from({ length: 10 }, () => Array(10).fill("Empty"));
};

/**
 * Moves the main menu off-screen and starts the setup phase
 */
function moveStartMenu() {
    console.log("Moving start menu...");
    mainMenu.classList.add("move-left"); // Moves the menu off-screen
    gameArea.classList.remove("hidden"); // Displays the game area

    // Generate the game boards for both the Player and AI
    generateBoard("computer-board", aiBoard);
    generateBoard("player-board", pBoard);
};

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
    console.log(`Generating board for ${boardId}...`);
    const boardElement = document.querySelector(`#${boardId} .game-board`);
    if (!boardElement) {
        console.warn(`Board element not found for ID: ${boardId}`);
        return;
    };

    boardElement.innerHTML = "";

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
