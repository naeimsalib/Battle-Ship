/*----- Constants -----*/
const mainMenu = document.querySelector(".main-menu");
const startBtn = document.querySelector(".start-btn");
const gameArea = document.querySelector(".game-area");
const shipsCarrier = document.querySelector(".ships-carrier");
const turnIndicator = document.querySelector(".turn-indicator");
const flipButton = document.querySelector(".flip-btn");
const playButton = document.querySelector(".play-btn");

/*----- State Variables -----*/
let pBoard, aiBoard, pShips, aiShips, lastPlacedShip, turn, direction, selectedShip, shipsOnBoard;
let aiCount, pCount; // Tracks the count of cells of ships there is to determine win and loss
let isComputerTurn; // Tracks who's turn it is so player cannot hit until the computer has played.
let gameStarted; // Tracks if the game started or not
let lastComputerHit = null; // Track the last hit made by the computer
let computerHitDirection = null; // Track the direction of the hits (Horizontal or Vertical)
let computerHits = []; // Track all hits made by the computer on the same ship
let reverseDirection = false; // Track if the computer should reverse direction

/*----- Event Listeners -----*/
startBtn.addEventListener("click", startGame);
flipButton.addEventListener("click", flip);
playButton.addEventListener("click", playButtonHandler);
/*----- Functions -----*/

/**
 * Initializes the game state
 */
function init() {
    gameStarted = false;
    isComputerTurn = false;
    lastComputerHit = null;
    computerHitDirection = null;
    computerHits = [];
    aiCount = 17;
    pCount = 17;
    direction = null;
    selectedShip = null
    turn = 0;
    shipsOnBoard = 0;
    lastPlacedShip = {
        type: null,
        size: null,
        startCol: null,
        startRow: null,
        direction: null,
    };
    selectedShip = null;

    pBoard = createGrid();
    aiBoard = createGrid();

    pShips = createShips();
    aiShips = [];

    render();
    renderAiAShips();
    addBoardEventListeners();
};

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
};

/*
    * Handles the play button click event
*/
function playButtonHandler() {
    if (shipsOnBoard !== pShips.length) {
        alert("Place all ships on the board before playing!");
        return;
    }

    // Hide the ships carrier
    shipsCarrier.classList.add("hidden");

    // Hide the flip button
    flipButton.classList.add("hidden");

    // Hide the play button
    playButton.classList.add("hidden");

    // Start the game with player's turn
    turn = 1;
    gameStarted = true; // Set the gameStarted flag to true
    // Update the turn indicator
    updateTurnIndicator();
};

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
};

/*
* Function to handle the computer's turn
* Checks if the cells on the player board is valid or not and if it is, then does the hit
*/
function computerTurn() {
    if (!gameStarted) return; // Prevent any moves before the game starts

    let col, row;
    let validMove = false;

    // If there is a previous hit, target around that hit
    if (lastComputerHit) {
        const { col: lastCol, row: lastRow } = lastComputerHit;

        // If there are multiple hits, determine the direction and target accordingly
        if (computerHits.length > 1) {
            const firstHit = computerHits[0];
            const secondHit = computerHits[1];

            // Determine the direction based on the first two hits
            computerHitDirection = firstHit.col === secondHit.col ? "Vertical" : "Horizontal";

            // Target the next cell in the determined direction
            if (computerHitDirection === "Horizontal") {
                if (!reverseDirection) {
                    // Target left or right
                    const leftCol = lastCol - 1;
                    const rightCol = lastCol + 1;

                    if (rightCol < 10 && pBoard[lastRow][rightCol] !== "miss" && pBoard[lastRow][rightCol] !== "hit") {
                        col = rightCol;
                        row = lastRow;
                        validMove = true;
                    } else if (leftCol >= 0 && pBoard[lastRow][leftCol] !== "miss" && pBoard[lastRow][leftCol] !== "hit") {
                        col = leftCol;
                        row = lastRow;
                        validMove = true;
                    } else {
                        reverseDirection = true;
                    }
                } else {
                    // Reverse direction
                    const leftCol = lastCol - 1;
                    const rightCol = lastCol + 1;

                    if (leftCol >= 0 && pBoard[lastRow][leftCol] !== "miss" && pBoard[lastRow][leftCol] !== "hit") {
                        col = leftCol;
                        row = lastRow;
                        validMove = true;
                    } else if (rightCol < 10 && pBoard[lastRow][rightCol] !== "miss" && pBoard[lastRow][rightCol] !== "hit") {
                        col = rightCol;
                        row = lastRow;
                        validMove = true;
                    }
                }
            } else {
                if (!reverseDirection) {
                    // Target up or down
                    const upRow = lastRow - 1;
                    const downRow = lastRow + 1;

                    if (downRow < 10 && pBoard[downRow][lastCol] !== "miss" && pBoard[downRow][lastCol] !== "hit") {
                        col = lastCol;
                        row = downRow;
                        validMove = true;
                    } else if (upRow >= 0 && pBoard[upRow][lastCol] !== "miss" && pBoard[upRow][lastCol] !== "hit") {
                        col = lastCol;
                        row = upRow;
                        validMove = true;
                    } else {
                        reverseDirection = true;
                    }
                } else {
                    // Reverse direction
                    const upRow = lastRow - 1;
                    const downRow = lastRow + 1;

                    if (upRow >= 0 && pBoard[upRow][lastCol] !== "miss" && pBoard[upRow][lastCol] !== "hit") {
                        col = lastCol;
                        row = upRow;
                        validMove = true;
                    } else if (downRow < 10 && pBoard[downRow][lastCol] !== "miss" && pBoard[downRow][lastCol] !== "hit") {
                        col = lastCol;
                        row = downRow;
                        validMove = true;
                    }
                }
            }
        } else {
            // Target all four sides around the last hit
            const potentialTargets = [
                { col: lastCol - 1, row: lastRow }, // Left
                { col: lastCol + 1, row: lastRow }, // Right
                { col: lastCol, row: lastRow - 1 }, // Up
                { col: lastCol, row: lastRow + 1 }  // Down
            ];

            // Shuffle the potential targets to randomize the selection
            potentialTargets.sort(() => Math.random() - 0.5);

            for (const target of potentialTargets) {
                if (target.col >= 0 && target.col < 10 && target.row >= 0 && target.row < 10 &&
                    pBoard[target.row][target.col] !== "miss" && pBoard[target.row][target.col] !== "hit") {
                    col = target.col;
                    row = target.row;
                    validMove = true;
                    break;
                }
            }
        }
    }

    // If no valid move found around the last hit, choose a random cell
    if (!validMove) {
        while (!validMove) {
            col = Math.floor(Math.random() * 10);
            row = Math.floor(Math.random() * 10);

            if (pBoard[row][col] !== "miss" && pBoard[row][col] !== "hit") {
                validMove = true;
            }
        }
    }

    const cell = document.querySelector(`#player-board-c${col}r${row}`);

    if (pBoard[row][col] === "Empty") {
        cell.style.backgroundColor = "DeepSkyBlue";
        pBoard[row][col] = "miss";
        reverseDirection = true; // Reverse direction on miss
    } else {
        cell.style.backgroundColor = "red";
        pBoard[row][col] = "hit";
        pCount--;

        // Track the hit
        lastComputerHit = { col, row };
        computerHits.push({ col, row });
        reverseDirection = false; // Continue in the same direction on hit
    }

    // Check for game over
    gameOverCheck();

    // Switch turns back to the player
    updateTurnIndicator();
};

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
}; 

/**
 * Creates ship data
 */
function createShips() {
    return [
        { type: "Carrier", size: 5, cells: [], color: "Blue", onBoard: false},
        { type: "Battleship", size: 4, cells: [], color: "Green", onBoard: false},
        { type: "Destroyer", size: 3, cells: [], color: "Purple", onBoard: false},
        { type: "Submarine", size: 3, cells: [], color: "DarkGray", onBoard: false},
        { type: "Patrol Boat", size: 2, cells: [], color: "White", onBoard: false}
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
};

/**
 * Updates the turn indicator
 */
function updateTurnIndicator() {
    if (turn === 1) {
        turnIndicator.textContent = "Player's Turn";
        isComputerTurn = false; // It's the player's turn
    } else if (turn === -1) {
        turnIndicator.textContent = "Computer's Turn";
        isComputerTurn = true; // It's the computer's turn
        setTimeout(computerTurn, 1000); // Give a slight delay before the computer makes a move
    } else {
        turnIndicator.textContent = "Battleship Blitz";
    }
    turn = turn === 1 ? -1 : 1; // Switch turns
}

function gameOverCheck() {
    if (aiCount === 0) {
        setTimeout(() => {
            alert("Player Wins!");
            location.reload();
        }, 2000); // 2-second delay
    } else if (pCount === 0) {
        setTimeout(() => {
            alert("Computer Wins!");
            location.reload();
        }, 2000); // 2-second delay
    }
};

/**
 * Handles cell clicks
 */
function handleCellClick(cell, boardId) {
    if (!gameStarted) return; // Prevent any moves before the game starts
    if (isComputerTurn) return; // Prevent the player from making a move during the computer's turn
    if (boardId === "player-board") return; // Prevent the player from hitting their own cells

    const col = parseInt(cell.dataset.col, 10);
    const row = parseInt(cell.dataset.row, 10);
    const playerBoard = boardId === "player-board" ? pBoard : aiBoard;

    // Prevent hitting cells that are already marked as "miss" or "hit"
    if (playerBoard[row][col] === "miss" || playerBoard[row][col] === "hit") return;

    if (playerBoard[row][col] === "Empty") {
        cell.style.backgroundColor = "DeepSkyBlue";
        playerBoard[row][col] = "miss";
    } else {
        cell.style.backgroundColor = "red";
        playerBoard[row][col] = "hit";
        boardId === "player-board" ? pCount-- : aiCount--;
        gameOverCheck();
    }

    // Switch turns
    updateTurnIndicator();
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

    // Find the ship's color
    const ship = pShips.find(s => s.type === shipType);
    const shipColor = ship ? ship.color : "rgba(0, 0, 0, 0.5)"; // Default to semi-transparent black if color not found

    // Create a custom drag image
    const dragImage = document.createElement("div");
    dragImage.style.width = `${shipSize * 40}px`; // Adjust the width based on the ship size
    dragImage.style.height = "40px"; // Fixed height for the ship cell
    dragImage.style.backgroundColor = shipColor; // Use the ship's color
    dragImage.style.borderRadius = "5px"; // Match the border radius of the ship cell
    document.body.appendChild(dragImage);

    // Set the custom drag image
    event.dataTransfer.setDragImage(dragImage, 0, 0);

    // Remove the custom drag image after a short delay
    setTimeout(() => {
        document.body.removeChild(dragImage);
    }, 0);
};

/**
 * Handles drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
};

/**
 * Handles drop event
 */
function handleDrop(e) {
    e.preventDefault();
    const cell = e.target;
    const col = parseInt(cell.dataset.col, 10);
    const row = parseInt(cell.dataset.row, 10);

    if (selectedShip) {
        const direction = "horizontal"; // Default to horizontal on drop
        if (isValidPlacement(pBoard, selectedShip.size, col, row, direction)) {
            placeShipOnBoard(pBoard, selectedShip.type, selectedShip.size, col, row, "player-board", direction);
            updateBoardVisuals(selectedShip.type, selectedShip.size, col, row, "player-board");
            const shipElement = document.querySelector(`.ship-container[data-ship="${selectedShip.type}"]`);
            if (!shipElement.onBoard) {
                shipsOnBoard += 1; // Increment shipsOnBoard count only for the first placement
                shipElement.onBoard = true;
            };
        } else {
            alert("Invalid placement!");
        }
    }

    // Reset selectedShip after drop
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
function placeShipOnBoard(board, shipType, size, col, row, boardId, direction = "horizontal") {
    const ship = pShips.find(s => s.type === shipType);
    ship.cells = []; // Reset cells array

    for (let i = 0; i < size; i++) {
        const currentCol = col + (direction === "horizontal" ? i : 0);
        const currentRow = row + (direction === "horizontal" ? 0 : i);

        board[currentRow][currentCol] = shipType;
        ship.cells.push({ col: currentCol, row: currentRow }); // Update cells array

        // Only update DOM for player board
        if (boardId === "player-board") {
            const cell = document.querySelector(`#${boardId}-c${currentCol}r${currentRow}`);
            if (cell) {
                cell.classList.remove("ship-cell");
                cell.classList.add("ship-cell-On-Board");
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

        // Hide the ship element from the ship carrier container
        const shipElement = document.querySelector(`.ship-container[data-ship="${shipType}"]`);
        if (shipElement) {
            shipElement.classList.add("ship-Hide");
        }
    }
};

function handleDragStartFromBoard(event) {
    const shipType = event.target.dataset.shipType;

    const ship = pShips.find((s) => s.type === shipType);

    if (ship && lastPlacedShip?.type === shipType) {
        const { startCol, startRow, size, direction } = lastPlacedShip;

        clearShipFromBoard(startCol, startRow, size, direction);

        selectedShip = { ...ship, direction };
    }
};

function addBoardEventListeners() {
    const playerBoard = document.querySelector("#player-board .game-board");

    playerBoard.addEventListener("dragover", (e) => {
        e.preventDefault();
    });

    playerBoard.addEventListener("drop", handleDrop);
};

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
};

// Initialize the game
init();
