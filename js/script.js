/*----- Constants -----*/
const mainMenu = document.querySelector(".main-menu");
const startBtn = document.querySelector(".start-btn");
const gameArea = document.querySelector(".game-area");
const shipsCarrier = document.querySelector(".ships-carrier");
const turnIndicator = document.querySelector(".turn-indicator");
const logButton = document.querySelector(".log-ship-btn");
const cellEl = document.querySelectorAll(".cell");
const flipButton = document.querySelector(".flip-btn");

/*----- State Variables -----*/
let pBoard, aiBoard, pShips, aiShips, angle, lastPlacedShip, lastMovedShip, direction, selectedShip = null, draggingFromBoard;

/*----- Event Listeners -----*/
startBtn.addEventListener("click", startGame);
logButton.addEventListener("click", logPlayerShipCells);
cellEl.forEach(cell => {
    cell.addEventListener("click", function () {
        handleCellClick(cell, cell.closest(".board").id);
    });
});
flipButton.addEventListener("click", flip);

/*----- Functions -----*/

/**
 * Initializes the game state
 */
function init() {
    angle = 0;
    direction = null;
    lastMovedShip = null;
    lastPlacedShip = {
        type: null,
        size: null,
        startCol: null,
        startRow: null,
        direction: null,
    };
    selectedShip = null;
    draggingFromBoard = false;

    pBoard = createGrid();
    aiBoard = createGrid();

    pShips = createShips();
    aiShips = []; // Initialize the AI ships array

    render();
    renderAiAShips(); // Place AI ships without affecting player's board
    addBoardEventListeners();
}

/**
 * Renders the game elements
 */
function render() {
    renderBoard("player-board", pBoard);
    renderBoard("computer-board", aiBoard);
    renderShips();
    updateTurnIndicator();
}

/**
 * Creates an empty 10x10 grid
 */
function createGrid() {
    return Array.from({ length: 10 }, () => Array(10).fill("Empty"));
}

/**
 * Validates if the ship can flip
 */
function canFlip(startCol, startRow, size, newDirection) {
    if (newDirection === "horizontal" && startCol + size > 10) return false;
    if (newDirection === "vertical" && startRow + size > 10) return false;

    for (let i = 0; i < size; i++) {
        const col = newDirection === "horizontal" ? startCol + i : startCol;
        const row = newDirection === "horizontal" ? startRow : startRow + i;
        if (pBoard[row][col] !== "Empty" && pBoard[row][col] !== lastPlacedShip.type) {
            return false; // Overlaps with another ship
        }
    }

    return true;
}

/**
 * Renders a board on the DOM for the given board ID
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
            }

            cellEl.addEventListener("dragover", handleDragOver);
            cellEl.addEventListener("drop", handleDrop);

            boardEl.appendChild(cellEl);
        });
    });
}

/**
 * Creates ship data
 */
function createShips() {
    return [
        { type: "Carrier", size: 5, cells: [], color: "Blue" },
        { type: "Battleship", size: 4, cells: [], color: "Green" },
        { type: "Destroyer", size: 3, cells: [], color: "Red" },
        { type: "Submarine", size: 3, cells: [], color: "Black" },
        { type: "Patrol Boat", size: 2, cells: [], color: "White" }
    ];
}

/**
 * Starts the game by hiding the main menu and showing the game area
 */
function startGame() {
    mainMenu.classList.add("move-left");
    gameArea.classList.remove("hidden");
}

/**
 * Renders AI Ships
 */
function renderAiAShips() {
    aiShips = []; // Reset AI ships array
    pShips.forEach((ship) => {
        let placed = false;
        while (!placed) {
            const col = Math.floor(Math.random() * 10);
            const row = Math.floor(Math.random() * 10);
            const direction = "horizontal"; // AI ships are horizontal; can be randomized
            if (isValidPlacement(aiBoard, ship.size, col, row, direction)) {
                placeShipOnBoard(aiBoard, ship.type, ship.size, col, row, null); // Do not update DOM
                aiShips.push({ type: ship.type, size: ship.size, col, row, direction });
                placed = true;
            }
        }
    });
}

/**
 * Logs all cells on the player's board that contain ships
 */
function logPlayerShipCells() {
    // Logs player ships cells
    console.log("Player Ship Cells:");
    pBoard.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            if (cell !== "Empty") {
                console.log(`Ship: ${cell}, Row: ${rowIndex}, Col: ${colIndex}`);
            }
        });
    });

    // Logs AI ships cells
    console.log("AI Ship Cells:");
    if (aiShips.length === 0) {
        console.log("No AI ships placed.");
        return;
    }
    aiShips.forEach((ship) => {
        console.log(`Ship: ${ship.type}, Size: ${ship.size}, Col: ${ship.col}, Row: ${ship.row}`);
    });
}

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

        shipEl.style.setProperty("--size", ship.size);

        shipEl.addEventListener("dragstart", handleDragStart);

        for (let i = 0; i < ship.size; i++) {
            const cellEl = document.createElement("div");
            cellEl.classList.add("ship-cell");
            cellEl.style.backgroundColor = ship.color;
            shipEl.appendChild(cellEl);
        }

        shipsCarrier.appendChild(shipEl);
    });
}

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
    const playerBoard = boardId === "player-board" ? pBoard : aiBoard;

    if (playerBoard[row][col] === "Empty") {
        cell.style.backgroundColor = "DeepSkyBlue";
        playerBoard[row][col] = "miss";
    } else if (playerBoard[row][col] !== "miss" && playerBoard[row][col] !== "hit") {
        cell.style.backgroundColor = "red";
        playerBoard[row][col] = "hit";
    }
}

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

    lastMovedShip = event.target;

    draggingFromBoard = false;
}

/**
 * Handles drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
}

/**
 * Handles drop event
 */
function handleDrop(e) {
    e.preventDefault();
    const cell = e.target;
    const col = parseInt(cell.dataset.col, 10);
    const row = parseInt(cell.dataset.row, 10);

    if (selectedShip) {
        const direction = selectedShip.direction || "horizontal";
        if (isValidPlacement(pBoard, selectedShip.size, col, row, direction)) {
            placeShipOnBoard(pBoard, selectedShip.type, selectedShip.size, col, row, "player-board");
            updateBoardVisuals(selectedShip.type, selectedShip.size, col, row, "player-board");
        } else {
            alert("Invalid placement!");
        }
    }

    selectedShip = null;
}

/**
 * Flips the ship's orientation
 */
function flip() {
    if (!lastPlacedShip || !lastPlacedShip.type) {
        alert("No ship to flip. Place a ship on the board first.");
        return;
    }

    const { startCol, startRow, size, direction } = lastPlacedShip;

    const newDirection = direction === "horizontal" ? "vertical" : "horizontal";

    if (!canFlip(startCol, startRow, size, newDirection)) {
        alert("Cannot flip ship in the current position.");
        return;
    }

    clearShipFromBoard(startCol, startRow, size, direction);
    applyNewOrientation(startCol, startRow, size, newDirection);

    lastPlacedShip.direction = newDirection;

    if (selectedShip && selectedShip.type === lastPlacedShip.type) {
        selectedShip.direction = newDirection;
    }
}

/**
 * Clears the ship's current cells from the board
 */
function clearShipFromBoard(startCol, startRow, size, direction) {
    for (let i = 0; i < size; i++) {
        const col = direction === "horizontal" ? startCol + i : startCol;
        const row = direction === "horizontal" ? startRow : startRow + i;

        pBoard[row][col] = "Empty";
        const cellId = `#player-board-c${col}r${row}`;
        const cell = document.querySelector(cellId);
        if (cell) cell.style.backgroundColor = "";
    }
}

/**
 * Applies the new orientation of the ship
 */
function applyNewOrientation(startCol, startRow, size, direction) {
    const ship = pShips.find((s) => s.type === lastPlacedShip.type);

    for (let i = 0; i < size; i++) {
        const col = direction === "horizontal" ? startCol + i : startCol;
        const row = direction === "horizontal" ? startRow : startRow + i;

        pBoard[row][col] = lastPlacedShip.type;

        const cellId = `#player-board-c${col}r${row}`;
        const cell = document.querySelector(cellId);
        if (cell) {
            cell.style.backgroundColor = ship?.color || "Gray";
        }
    }
}

/**
 * Validates if the ship can be placed
 */
function isValidPlacement(board, size, col, row, direction = "horizontal") {
    if (direction === "horizontal" && col + size > 10) return false;
    if (direction === "vertical" && row + size > 10) return false;

    for (let i = 0; i < size; i++) {
        const currentCol = direction === "horizontal" ? col + i : col;
        const currentRow = direction === "horizontal" ? row : row + i;
        if (board[currentRow][currentCol] !== "Empty") return false;
    }

    return true;
}

/**
 * Places a ship on the board
 */
function placeShipOnBoard(board, shipType, size, col, row, boardId) {
    const direction = selectedShip?.direction || lastPlacedShip?.direction || "horizontal";

    for (let i = 0; i < size; i++) {
        const currentCol = col + (direction === "horizontal" ? i : 0);
        const currentRow = row + (direction === "horizontal" ? 0 : i);

        board[currentRow][currentCol] = shipType;

        // Only update DOM for player board
        if (boardId === "player-board") {
            const cell = document.querySelector(`#${boardId}-c${currentCol}r${currentRow}`);
            if (cell) {
                const ship = pShips.find((s) => s.type === shipType);
                cell.classList.add("ship-cell");
                cell.style.backgroundColor = ship?.color || "Gray";
                cell.setAttribute("draggable", "true");
                cell.dataset.shipType = shipType;
                cell.addEventListener("dragstart", handleDragStartFromBoard);
            }
        }
    }

    if (boardId === "player-board") {
        lastPlacedShip = {
            type: shipType,
            size,
            startCol: col,
            startRow: row,
            direction,
        };
    }
}

function handleDragStartFromBoard(event) {
    const shipType = event.target.dataset.shipType;

    const ship = pShips.find((s) => s.type === shipType);

    if (ship && lastPlacedShip?.type === shipType) {
        const { startCol, startRow, size, direction } = lastPlacedShip;

        clearShipFromBoard(startCol, startRow, size, direction);

        selectedShip = { ...ship, direction };
    }
}

function addBoardEventListeners() {
    const playerBoard = document.querySelector("#player-board .game-board");

    playerBoard.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    playerBoard.addEventListener("drop", handleDrop);
}

function updateBoardVisuals(type, size, col, row, boardId) {
    const board = document.querySelector(`#${boardId} .game-board`);
    const ship = pShips.find((s) => s.type === type);
    const direction = selectedShip?.direction || lastPlacedShip?.direction || "horizontal";

    for (let i = 0; i < size; i++) {
        const currentCol = col + (direction === "horizontal" ? i : 0);
        const currentRow = row + (direction === "horizontal" ? 0 : i);
        const cell = board.querySelector(`#${boardId}-c${currentCol}r${currentRow}`);
        if (cell) {
            cell.style.backgroundColor = ship?.color || "Gray";
        }
    }
}

// Initialize the game
init();
