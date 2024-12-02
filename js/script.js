/*----- Constants -----*/
const mainMenu = document.querySelector(".main-menu");
const startBtn = document.querySelector(".start-btn");
const gameArea = document.querySelector(".game-area");
const shipsCarrier = document.querySelector(".ships-carrier");
const turnIndicator = document.querySelector(".turn-indicator");
const logButton = document.querySelector(".log-ship-btn");

/*----- State Variables -----*/
let pBoard, aiBoard, pShips, selectedShip = null, draggingFromBoard = false;

/*----- Event Listeners -----*/
startBtn.addEventListener("click", startGame);
logButton.addEventListener("click", logPlayerShipCells);
/*----- Functions -----*/

/**
 * Initializes the game state
 */
function init() {
    // Create two empty grids for the player and computer
    pBoard = createGrid();
    aiBoard = createGrid();
    // Create the players ships
    pShips = createShips();
    // Call the render function 
    render();
};

/**
 * Render Computer Ships
 */
function renderAiAShips(){
    pShips.forEach((ship) => {
        let shipPlaced = false;
        while(!shipPlaced){
            const col = Math.floor(Math.random() * 10);
            const row = Math.floor(Math.random() * 10);
            if(isValidPlacement(aiBoard, ship.size, col, row)){
                placeShipOnBoard(aiBoard, ship.type, ship.size, col, row);
                shipPlaced = true;
            }
        }
    });
};

/**
 * Renders the game elements
 */
function render() {
    // Render the Board on the DOM for ach player (player and computer)
    renderBoard("player-board", pBoard);
    renderBoard("computer-board", aiBoard, true); // Computer board is initially inactive
    renderShips();
    //enableDragAndDrop(); // Enable drag-and-drop functionality
    updateTurnIndicator();
};

/**
 * Creates an empty 10x10 grid
 */
function createGrid() {
    return Array.from({ length: 10 }, () => Array(10).fill("Empty"));
};

/**
 * Renders a board on the DOM for whatever boardID is passed (e.g., "player-board" or "computer-board")
 */
function renderBoard(boardId, board, disableClicks = false) {
    const boardEl = document.querySelector(`#${boardId} .game-board`);
    boardEl.innerHTML = "";

    board.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellEl = document.createElement("div");
            cellEl.classList.add("cell");
            cellEl.id = `${boardId}-c${colIndex}r${rowIndex}`;
            cellEl.dataset.col = colIndex;
            cellEl.dataset.row = rowIndex;

            if (!disableClicks) {
                cellEl.addEventListener("click", () => handleCellClick(cellEl, boardId));
            };

            cellEl.addEventListener("dragover", handleDragOver);
            cellEl.addEventListener("drop", handleDrop);

            boardEl.appendChild(cellEl);
        });
    });
};

/**
 * Creates ship data
 */
function createShips() {
    return [
        { type: "Carrier", size: 5, cells: [], color: "Blue"},
        { type: "Battleship", size: 4, cells: [], color: "Green" },
        { type: "Destroyer", size: 3, cells: [], color: "Red" },
        { type: "Submarine", size: 3, cells: [], color: "Black" },
        { type: "Patrol Boat", size: 2, cells: [], color: "White" }
    ];
};

/**
 * Starts the game by hiding the main menu and showing the game area
 */
function startGame() {
    mainMenu.classList.add("move-left");
    gameArea.classList.remove("hidden");
};

/**
 * Logs all cells on the player's board that contain ships
 */
function logPlayerShipCells() {
    console.log("Player Ship Cells:");
    pBoard.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell !== "Empty") {
                console.log(`Ship: ${cell}, Row: ${rowIndex}, Col: ${colIndex}`);
            };
        });
    });
};

/**
 * Renders ships in the ships-carrier
 */
function renderShips() {
    shipsCarrier.innerHTML = "";
    pShips.forEach((ship) => {
        const shipEl = document.createElement("div");
        shipEl.classList.add("ship-container");
        shipEl.setAttribute("draggable", "true");
        shipEl.setAttribute("data-ship", ship.type);
        shipEl.setAttribute("data-size", ship.size);

        // Dynamically set the CSS variable for grid size
        shipEl.style.setProperty("--size", ship.size);

        shipEl.addEventListener("dragstart", handleDragStart);

        for (let i = 0; i < ship.size; i++) {
            const cellEl = document.createElement("div");
            cellEl.classList.add("ship-cell");
            cellEl.style.backgroundColor = ship.color;
            shipEl.appendChild(cellEl);
        };

        shipsCarrier.appendChild(shipEl);
    });
};

/**
 * Updates the turn indicator
 */
function updateTurnIndicator() {
    turnIndicator.textContent = "Place your ships";
}

/**
 * Handles cell clicks
 */
function handleCellClick(cell, boardId) {
    const col = parseInt(cell.dataset.col, 10);
    const row = parseInt(cell.dataset.row, 10);
    const board = boardId === "player-board" ? pBoard : aiBoard;

    if (board[row][col] === "Empty") {
        cell.style.backgroundColor = "DeepSkyBlue"; // Highlight empty cell
    } else {
        cell.style.backgroundColor = "red"; // Highlight ship part
    };
};

/**
 * Handles drag start event
 */
function handleDragStart(event) {
    const shipType = event.target.dataset.ship;
    const shipSize = parseInt(event.target.dataset.size, 10);

    selectedShip = {
        type: shipType,
        size: shipSize,
    };

    // Check if dragging from the board
    if (event.target.parentElement.classList.contains("game-board")) {
        draggingFromBoard = true;

        // Clear the ship's current position on the board
        const ship = pShips.find((s) => s.type === shipType);
        if (ship) {
            ship.cells.forEach(({ col, row }) => {
                pBoard[row][col] = "Empty";
                const cellEl = document.querySelector(`#player-board-c${col}r${row}`);
                if (cellEl) cellEl.style.backgroundColor = ""; // Reset cell color
            });
            ship.cells = []; // Reset ship's cells
        }
    } else {
        draggingFromBoard = false;
    };
};

/**
 * Handles drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles drop event
 */
function handleDrop(event) {
    event.preventDefault();

    if (!selectedShip) {
        console.error("No ship selected for drop!");
        return;
    }

    const dropCol = parseInt(event.target.dataset.col, 10);
    const dropRow = parseInt(event.target.dataset.row, 10);

    if (isValidPlacement(pBoard, selectedShip.size, dropCol, dropRow)) {
        placeShipOnBoard(pBoard, selectedShip.type, selectedShip.size, dropCol, dropRow);
        updateBoardVisuals(selectedShip.type, selectedShip.size, dropCol, dropRow, "player-board");

        // Save the ship's new position
        const ship = pShips.find((s) => s.type === selectedShip.type);
        if (ship) {
            ship.cells = Array.from({ length: selectedShip.size }, (_, i) => ({
                col: dropCol + i,
                row: dropRow,
            }));
        };

        selectedShip = null; // Reset the selected ship
    } else {
        alert("Invalid placement! Try again.");
    };
};

/**
 * Validates if the ship can be placed on the board
 */
function isValidPlacement(board, size, col, row) {
    if (col + size > 10) return false; // Check horizontal boundaries

    for (let i = 0; i < size; i++) {
        if (board[row][col + i] !== "Empty") return false; // Check for overlap
    };

    return true;
};

/**
 * Places a ship on the board array
 */
function placeShipOnBoard(board, type, size, col, row) {
    for (let i = 0; i < size; i++) {
        board[row][col + i] = type; // Mark the board cells as occupied by the ship
    }
};

/**
 * Updates the board visuals after placing a ship
 */
function updateBoardVisuals(type, size, col, row, boardId) {
    const board = document.querySelector(`#${boardId} .game-board`);
    for (let i = 0; i < size; i++) {
        const cell = board.querySelector(`#${boardId}-c${col + i}r${row}`);
        if (cell) {
            cell.style.backgroundColor = "gray"; // Indicate ship placement
        }
    }
};

// Initialize the game
init();
