// ============ SETUP ============

const NUM_COLS = 5; // columns A - E
let spreadsheet = document.querySelector(".spreadsheet");
let titleInput = document.getElementById("title");
const STORAGE_PREFIX = "myspreadsheet:";

// ============ BUILD THE GRID ============

// Draws the top row: blank corner box + A B C D E
function buildHeaders() {
    let corner = document.createElement("div");
    corner.classList.add("header");
    spreadsheet.appendChild(corner);

    for (let col = 0; col < NUM_COLS; col++) {
        let letter = document.createElement("div");
        letter.textContent = String.fromCharCode(65 + col); // 65 = "A"
        letter.classList.add("rows");
        spreadsheet.appendChild(letter);
    }
}

// Builds one row: the row-number box on the left + 5 editable cells
function createRow(rowIndex) {
    let rowLabel = document.createElement("div");
    rowLabel.classList.add("header");
    rowLabel.textContent = rowIndex + 1;
    spreadsheet.appendChild(rowLabel);

    for (let col = 0; col < NUM_COLS; col++) {
        let cell = document.createElement("div");
        cell.classList.add("cell");
        cell.contentEditable = true;

        // Remember this cell's position so we can find it again later
        cell.dataset.row = rowIndex;
        cell.dataset.col = col;

        let letter = String.fromCharCode(65 + col);
        cell.textContent = letter + (rowIndex + 1);

        cell.addEventListener("keydown", handleKeydown);

        spreadsheet.appendChild(cell);
    }
}

// ============ ENTER = MOVE DOWN (AND ADD A ROW IF NEEDED) ============

function handleKeydown(event) {
    if (event.key !== "Enter") return; // we only care about Enter here

    event.preventDefault(); // stop it from adding a line break in the cell

    let allCells = document.querySelectorAll(".cell");
    let currentIndex = Array.from(allCells).indexOf(event.target);

    // If we're in the last row, build a new one first
    let isLastRow = currentIndex + NUM_COLS >= allCells.length;
    if (isLastRow) {
        let newRowIndex = allCells.length / NUM_COLS;
        createRow(newRowIndex);
        allCells = document.querySelectorAll(".cell"); // refresh, new cells exist now
    }

    // Move focus down one row, same column
    allCells[currentIndex + NUM_COLS].focus();
}

// ============ FILE MENU: NEW / SAVE / OPEN ============

function toggleFileMenu(forceState) {
    let menu = document.getElementById("fileMenu");
    if (forceState === undefined) {
        menu.classList.toggle("show");
    } else {
        menu.classList.toggle("show", forceState);
    }
}

function clearGrid() {
    document.querySelectorAll(".cell, .header, .rows").forEach(el => el.remove());
}

function newSheet() {
    if (!confirm("Start a new spreadsheet? Unsaved changes will be lost.")) return;
    clearGrid();
    buildHeaders();
    for (let i = 0; i < 5; i++) createRow(i);
    titleInput.value = "Untitled Spreadsheet";
}

function saveSheet() {
    let name = titleInput.value.trim() || "Untitled Spreadsheet";
    titleInput.value = name;

    // Grab every cell's text, plus how many rows exist
    let cells = [];
    document.querySelectorAll(".cell").forEach(c => {
        cells.push({ row: c.dataset.row, col: c.dataset.col, value: c.textContent });
    });
    let rowCount = document.querySelectorAll(".cell").length / NUM_COLS;

    let sheet = { title: name, rowCount: rowCount, cells: cells };
    localStorage.setItem(STORAGE_PREFIX + name, JSON.stringify(sheet));
    alert('Saved "' + name + '".');
}

function openSheet() {
    let savedNames = Object.keys(localStorage)
        .filter(key => key.startsWith(STORAGE_PREFIX))
        .map(key => key.slice(STORAGE_PREFIX.length));

    if (savedNames.length === 0) {
        alert("No saved spreadsheets yet. Use Save first.");
        return;
    }

    let choice = prompt("Open which spreadsheet?\n\n" + savedNames.join("\n"));
    if (!choice) return;

    let raw = localStorage.getItem(STORAGE_PREFIX + choice.trim());
    if (!raw) {
        alert('No spreadsheet named "' + choice + '" found.');
        return;
    }

    let sheet = JSON.parse(raw);

    clearGrid();
    buildHeaders();
    for (let i = 0; i < sheet.rowCount; i++) createRow(i);

    sheet.cells.forEach(entry => {
        let cell = document.querySelector('.cell[data-row="' + entry.row + '"][data-col="' + entry.col + '"]');
        if (cell) cell.textContent = entry.value;
    });

    titleInput.value = sheet.title;
}

// ============ WIRE UP THE FILE MENU BUTTONS ============

document.getElementById("file-button").addEventListener("click", (event) => {
    event.stopPropagation(); // don't let this click close the menu we're opening
    toggleFileMenu();
});

document.addEventListener("click", () => toggleFileMenu(false)); // click elsewhere closes it

document.getElementById("fileMenu").addEventListener("click", (event) => {
    event.stopPropagation(); // clicks inside the menu shouldn't close it early
});

document.getElementById("newButton").addEventListener("click", () => { toggleFileMenu(false); newSheet(); });
document.getElementById("openButton").addEventListener("click", () => { toggleFileMenu(false); openSheet(); });
document.getElementById("saveButton").addEventListener("click", () => { toggleFileMenu(false); saveSheet(); });
document.getElementById("saveAsButton").addEventListener("click", () => { toggleFileMenu(false); saveSheet(); });

// ============ BUILD THE INITIAL SHEET ============

buildHeaders();
for (let i = 0; i < 5; i++) createRow(i);