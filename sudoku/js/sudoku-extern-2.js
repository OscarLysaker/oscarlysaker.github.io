//      +-------------------------+
//      |      Dev Variables      |
//      +-------------------------+

let isDebugging = true;

//      +--------------------------+
//      |      Preset Puzzles      |
//      +--------------------------+

let puzzles = JSON.parse(puzzleData);
let samplePuzzles = {
"easy" : [
        [0,6,0,0,8,0,4,2,0,
        0,1,5,0,6,0,3,7,8,
        0,0,0,4,0,0,0,6,0,
        1,0,0,6,0,4,8,3,0,
        3,0,6,0,1,0,7,0,5,
        0,8,0,3,5,0,0,0,0,
        8,3,0,9,4,0,0,0,0,
        0,7,2,1,3,0,9,0,0,
        0,0,9,0,2,0,6,1,0]
    ]
}

//      +---------------------------+
//      |      Basic Variables      |
//      +---------------------------+

// Element Access
let root = null;
let container = null;
let table = null;

// Cell handlers
var cells = [];
var arrowCell = null;
var cellsSelected = [];

const GRID_TYPE = {
    SMALL   : {emptyCellValue: 0, cellsTotal:  36, width:  6, height:  6, groupsTotal:  6, groupsX: 2, groupsY: 3, groupWidth: 3, groupHeight: 2, groupNum:  6, possibleValues: [1,2,3,4,5,6]},
    NORMAL  : {emptyCellValue: 0, cellsTotal:  81, width:  9, height:  9, groupsTotal:  9, groupsX: 3, groupsY: 3, groupWidth: 3, groupHeight: 3, groupNum:  9, possibleValues: [1,2,3,4,5,6,7,8,9]},
    HUGE    : {emptyCellValue: 0, cellsTotal: 256, width: 16, height: 16, groupsTotal: 16, groupsX: 4, groupsY: 4, groupWidth: 4, groupHeight: 4, groupNum: 16, possibleValues: [1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F","G"]}
}

var grid = GRID_TYPE.NORMAL;

// Togglers
var pencil = {
    active: false,
    button: null,
    buttonImage: null,
    iconSource: {
        on: './svg/pen-on.svg',
        off: './svg/pen-off.svg'
    }
}

// Drag
let dragging = false;
let dragFirstCell = null;

var drag = {
    active: false,
    firstCell: null
}

// Cells
let mouseOverRoot = false;

// Inputs
let isTouch = false;

// Buttons
let numberButtons = [];

// Cell anim
let cellTimeouts = [];

// Clock
let isPaused = false;
let clock = {
    start : () => {
        if (isPaused) clock.pause();
        else clockStart();
    },
    pause : () => {
        if (isPaused) {
            isPaused = false;
            table.removeAttribute("data-puzzle-paused");
            document.getElementById("sudoku-button-pause-img").setAttribute("src", "./svg/pause_pause.svg");
        } else {
            isPaused = true;
            table.setAttribute("data-puzzle-paused", "");
            document.getElementById("sudoku-button-pause-img").setAttribute("src", "./svg/pause_continue.svg");
        }
        clockPause();
    },
    reset : () => {
        clockReset();
        isPaused = false;
        table.removeAttribute("data-puzzle-paused");
        document.getElementById("sudoku-button-pause-img").setAttribute("src", "./svg/pause_pause.svg");
    },
    stop : () => {
        clockPause();
        isPaused = true;
        table.removeAttribute("data-puzzle-paused");
        document.getElementById("sudoku-button-pause-img").setAttribute("src", "./svg/pause_continue.svg");
    }
}

//      +--------------------------+
//      |      Enum Abstracts      |
//      +--------------------------+

var CELL_ATTR = {
    TYPE : 'data-sudoku-cell-type',
    SELECTED : 'data-sudoku-cell-selected',
    ERROR : 'data-sudoku-cell-error',

    VALUE : 'data-value',
    POS_X : 'data-pos-x',
    POS_Y : 'data-pos-y',
    GROUP_INDEX : 'data-group-index',

    HIGHLIGHT : 'data-sudoku-cell-highlight',
    DIGIT_HIGHLIGHT : 'data-sudoku-digit-highlight',
    ARROW_HIGHLIGHT : 'data-sudoku-cell-arrow-highlight',
    PENCIL_HIGHLIGHT : 'data-sudoku-cell-pencil-highlight',
    PENCIL_HIGHLIGHT_DIGIT : 'data-sudoku-cell-pencil-highlight-digit'
};

var STYLE_ATTR = {
    CELL_BORDER_RIGHT : 'data-sudoku-cell-border-right',
    CELL_BORDER_BOTTOM : 'data-sudoku-cell-border-bottom'
}

let CELL_SELECTED = {
    SINGLE : 'single',
    MULTI : 'multi'
};

let CELL_HIGHLIGHT = {
    NONE : 'none'
};

let CELL_ERROR = {
    CELL : 'cell',
    DIGIT : 'digit'
};

let CELL_TYPE = {
    EMPTY : 'empty',
    NORMAL : 'normal',
    PENCIL : 'pencil',
    CLUE : 'clue'
};

let KEY_DOWN = {
    SHIFT : false,
    TAB : false,
    CTRL : false
};

let BUTTON_ATTR = {
    STATE : 'data-sudoku-button-state',

    TYPE_UNDO : 'data-sudoku-button-type-undo',
    TYPE_REDO : 'data-sudoku-button-type-redo',
    TYPE_DELETE : 'data-sudoku-button-type-delete',
    TYPE_PENCIL : 'data-sudoku-button-type-pencil',
    TYPE_HINT : 'data-sudoku-button-type-hint'
};

let BUTTON_STATE = {
    DISABLED : 'disabled',
    ACTIVE : 'active',
    INACTIVE : 'inactive'
};





//      +---------------------------------+
//      |      Sudoku Initialization      |
//      +---------------------------------+

function detectMob() {
    const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
    return toMatch.some((toMatchItem) => { return navigator.userAgent.match(toMatchItem); });
}

function initSudokuInside (element=null) {
    if (element == null) return;

    root = element;

    isTouch = detectMob();

    if (!isDebugging) document.oncontextmenu = function () { return false; }

    // Style
    if (detectMob()) document.head.querySelector('[href="./css/sudoku-fixed.css"]').setAttribute("href", "./css/sudoku-mobile.css");
    //document.head.querySelector('[href="./css/sudoku-fixed.css"]').setAttribute("href", "./css/sudoku-mobile.css");

    // Container
    container = document.createElement("div");
    container.setAttribute("id", "sudoku-root-container");
    root.append(container);

    // Top Container
    let topContainer = document.createElement("div");
    topContainer.setAttribute("id", "sudoku-root-top-container");
    container.append(topContainer);

    // Create logo
    let logo = document.createElement("span");
    logo.setAttribute("id", "sudoku-logo");
    logo.setAttribute("class", "unselectable");
    logo.innerText = "Sudoku";
    topContainer.append(logo);

    // Create pause button
    let pauseButton = document.createElement("span");
    pauseButton.setAttribute("id", "sudoku-pause-button");
    pauseButton.onclick = (e) => { clock.pause(); }
    let pauseIcon = document.createElement("img");
    pauseIcon.setAttribute("id", "sudoku-button-pause-img");
    pauseIcon.setAttribute("src", "./svg/pause_pause.svg");
    pauseButton.append(pauseIcon);
    topContainer.append(pauseButton);

    // Button container grid
    let buttonContainerGrid = document.createElement("span");
    buttonContainerGrid.setAttribute("id", "sudoku-root-container-buttons-grid");

    // Timer root
    let clockRoot = document.createElement("span");
    clockRoot.setAttribute("id", "sudoku-clock-root");
    buttonContainerGrid.append(clockRoot);

    // Add buttons
    buttonContainerGrid.append(createTempButton("New Sample", "sudoku-button-temp-sample-set", null, () => { initPuzzle(samplePuzzles.easy[0]); }));
    buttonContainerGrid.append(createTempButton("Reset", "sudoku-button-reset", null, () => { reset(); }));
    //buttonContainerGrid.append(createTempButton("Fill Unique", "sudoku-button-fill-unique", null, () => { fillUnique(); }));
    buttonContainerGrid.append(createTempButton("Solve", "sudoku-button-redo", null, () => { solve(); }));
    buttonContainerGrid.append(createTempButton("Create Puzzle", "sudoku-button-create-puzzle", null, () => { createPuzzle(); }));

    container.append(buttonContainerGrid);

    // Create Sudoku Table
    table = document.createElement("table");
    table.setAttribute("class", "unselectable");
    table.setAttribute("id", "sudoku-root-table");

    for(let y = 0, yl = grid.height; y < yl; y++) {
        var tableRow = document.createElement("tr");
        tableRow.setAttribute("id", "sudoku-root-row");
        for(let x = 0, xl = grid.width; x < xl; x++) {
            var tableHeader = document.createElement("th");
            tableHeader.setAttribute("id", "sudoku-root-cell");
            tableHeader.setAttribute(CELL_ATTR.POS_X, x);
            tableHeader.setAttribute(CELL_ATTR.POS_Y, y);
            tableHeader.setAttribute(CELL_ATTR.GROUP_INDEX, Math.floor(y/grid.groupsY)*grid.groupsX + Math.floor(x / grid.groupsX));
            tableHeader.setAttribute(CELL_ATTR.TYPE, CELL_TYPE.EMPTY);

            if (x % grid.groupWidth == grid.groupWidth - 1 && x != grid.width - 1) tableHeader.setAttribute(STYLE_ATTR.CELL_BORDER_RIGHT, "");
            if (y % grid.groupHeight == grid.groupHeight - 1 && y != grid.height - 1) tableHeader.setAttribute(STYLE_ATTR.CELL_BORDER_BOTTOM, "");

            (function(cell, arrowRemove, selectCell, dragPrepare){
                cell.addEventListener(isTouch ? 'touchstart' : 'mousedown', (e) => {
                    e.preventDefault();
                    arrowRemove();
                    selectCell(cell);
                    dragPrepare(cell);
                });
            })(tableHeader, arrowRemove, selectCell, dragPrepare);

            if (!isTouch) {
                (function(cell, selectionAdd){
                    cell.addEventListener("mouseover", (ev) => {
                        ev.preventDefault();
                        if (ev.buttons == 1 || ev.button == 1) {
                            selectionAdd(cell);
                        }
                    });
                })(tableHeader, selectionAdd);
            }

            setCellValue(tableHeader, 0, false, false);
            cells.push(tableHeader);
            tableRow.append(tableHeader);
        }
        table.append(tableRow);
    }
    container.append(table);

    // Button container settings
    let buttonContainerInput = document.createElement("div");
    buttonContainerInput.setAttribute("id", "sudoku-root-container-buttons-input");

    buttonContainerInput.append(createButtonInput("Undo", "./svg/undo.svg", BUTTON_ATTR.TYPE_UNDO, (button, e) => { logUndoAction(); }));
    buttonContainerInput.append(createButtonInput("Redo", "./svg/redo.svg", BUTTON_ATTR.TYPE_REDO, (button, e) => { logRedoAction(); }));
    buttonContainerInput.append(createButtonInput("Delete", "./svg/eraser.svg", BUTTON_ATTR.TYPE_DELETE, (button, e) => { deleteDigit(true, true); }));
    buttonContainerInput.append(createButtonInput("Pencil", "./svg/pen-off.svg", BUTTON_ATTR.TYPE_PENCIL, (button, e) => { pencilToggle(); }));
    buttonContainerInput.append(createButtonInput("Hint", "./svg/hint.svg", BUTTON_ATTR.TYPE_HINT, (button, e) => {}));

    container.append(buttonContainerInput);

    // Button container input
    let buttonContainerInputNumbers = document.createElement("div");
    buttonContainerInputNumbers.setAttribute("id", "sudoku-root-container-buttons-input-numbers");

    // Buttons
    for (let i = 0, j = grid.possibleValues.length; i < j; i++) {
        let buttonNum = document.createElement("button");
        buttonNum.setAttribute("class", "sudoku-button-number-input");
        buttonNum.setAttribute("data-button-value", grid.possibleValues[i])
        buttonNum.innerText = String(grid.possibleValues[i]);
        buttonNum.addEventListener("click", (button, e) => {
            selectionSetValue(grid.possibleValues[i]);
        });
        buttonContainerInputNumbers.append(buttonNum);
        numberButtons.push(buttonNum);
    }

    container.append(buttonContainerInputNumbers);

    // Store pencil button
    pencil.button = document.querySelector('[' + BUTTON_ATTR.TYPE_PENCIL + ']');
    pencil.buttonImage = document.querySelector('[src="' + pencil.iconSource.off + '"]');

    if (!isTouch) {
        document.addEventListener("mousedown", () => { if (!mouseOverRoot) selectionRemove(); });
        document.addEventListener("mouseup", () => { onMouseReleased(); });
    } else {
        table.addEventListener("touchmove", (e) => {
            e.preventDefault();
            let elements = document.elementsFromPoint(e.touches.item(0).clientX, e.touches.item(0).clientY);
            for (let i = 0, j = elements.length; i < j; i++) {
                if (elements[i].hasAttribute("id") && elements[i].getAttribute("id") == "sudoku-root-cell") {
                    onCellOver(elements[i]);
                    return;
                }
            }
        });

        document.addEventListener("touchend", () => { onMouseReleased(); });
        document.addEventListener("touchcancel", () => { onMouseReleased(); });
    }

    container.addEventListener("mouseover", () => { mouseOverRoot = true; });
    container.addEventListener("mouseout", () => { mouseOverRoot = false; });
}






//      +---------------------------+
//      |      Puzzle Handlers      |
//      +---------------------------+

function reset () {
    console.log("Resetting sudoku puzzle...");
    selectionRemove();

    pencilToggle(false);

    document.querySelector('[' + BUTTON_ATTR.TYPE_HINT + ']').setAttribute(BUTTON_ATTR.STATE, BUTTON_STATE.DISABLED);
    document.querySelectorAll('[class="sudoku-button-number-input"]').forEach((value, key, parent) => {
        value.removeAttribute("data-sudoku-button-state", "disabled");
    });
    clock.reset();
    for (let x = 0, xl = cells.length; x < xl; x++) {
        setCellValue(cells[x], 0, false, false, CELL_TYPE.EMPTY);
    }
    removeAllAttributesFromAll();
    logReset();
    arrowRemove();
    console.log("Sudoku successfully reset!");
}

function initPuzzle (puzzle) {
    reset();
    document.querySelector('[' + BUTTON_ATTR.TYPE_HINT + ']').removeAttribute(BUTTON_ATTR.STATE);
    while (cellTimeouts.length > 0) clearTimeout(cellTimeouts.splice(0,1)[0]);

    cells.forEach((value, key, parent) => { value.removeAttribute("data-sudoku-cell-start-anim"); });

    let animOffset = 4;
    let animTotal = 4 * 81 + 400;
    cellTimeouts.push(
        setTimeout(function () {
            cells.forEach((value, key, parent) => { value.removeAttribute("data-sudoku-cell-start-anim"); });
            clock.start();
            console.log("Started clock...");
        }, animTotal)
    );
    for (let i = 0, j = cells.length; i < j; i++) {
        cellTimeouts.push(
            setTimeout(function () {
                cells[i].setAttribute("data-sudoku-cell-start-anim", "");
                setCellValue(cells[i], puzzle[i], false, false, CELL_TYPE.CLUE);
            }, i * animOffset)
        );
    }

    logPuzzleArrayAsTable(puzzle);
}






//      +--------------------------------+
//      |      Interaction Handlers      |
//      +--------------------------------+

function onMouseReleased () {
    dragging = false;
    dragFirstCell = null;
}

function onCellOver (cell) {
    if (!dragging && dragFirstCell != cell && dragFirstCell != null) {
        dragging = true;
        dragFirstCell = null;
        selectionAdd(cell);
    } else if (dragging) {
        selectionAdd(cell);
    }
}






//      +---------------------------+
//      |      Button Handlers      |
//      +---------------------------+

function createTempButton (label="Sample Button", id="", cl="", callback=null) {
    let newButton = document.createElement("button");
    if (id != "") newButton.setAttribute("id", id);
    if (cl != "") newButton.setAttribute("class", cl);
    newButton.innerText = label;
    if (callback != null) {
        newButton.onclick = () => {
            logButtonPress(label);
            callback();
        }
    }
    return newButton;
}

function createButtonInput (label, imgSource, type, onClick) {
    let inputButton = document.createElement("button");
    inputButton.setAttribute("class", "sudoku-button-input");
    inputButton.setAttribute(type, "");

    let inputButtonIcon = document.createElement("img");
    inputButtonIcon.setAttribute("src", imgSource);
    inputButton.append(inputButtonIcon);

    let inputButtonLabel = document.createElement("div");
    inputButtonLabel.setAttribute("id", "sudoku-button-input-label");
    inputButtonLabel.innerText = label;
    inputButton.append(inputButtonLabel);

    inputButton.addEventListener("click", (button, e) => {
        onClick(button, e);
    });

    return inputButton;
}

//      +------------------------------+
//      |      Selection Handlers      |
//      +------------------------------+

function selectionRemove () {
    cellsSelected.forEach((cell) => { cell.removeAttribute(CELL_ATTR.SELECTED); });
    cellsSelected = [];
    removeHighlights();
}

function selectionSetValue (value) {
    setCellValue(cellsSelected.slice(0), value, true, true);
}

function selectCell (cell) {
    selectionRemove();
    cell.setAttribute(CELL_ATTR.SELECTED, CELL_SELECTED.SINGLE);
    cellsSelected[0] = cell; 
    highlightCellsFor(cell);
    pencilUpdateHighlights();
}

function selectionAdd (cell) {
    if (cellsSelected.length == 1) {
        removeHighlights();
        cellsSelected[0].setAttribute(CELL_ATTR.SELECTED, CELL_SELECTED.MULTI);
    }

    if (cellsSelected.indexOf(cell) >= 0) return;
    cell.setAttribute(CELL_ATTR.SELECTED, CELL_SELECTED.MULTI);
    cellsSelected.push(cell);

    return;
}





//      +--------------------------+
//      |       Drag Handlers      |
//      +--------------------------+

function dragPrepare (cell) {
    drag.firstCell = cell;
    dragFirstCell = cell;
}






//      +--------------------------+
//      |      Arrow Handlers      |
//      +--------------------------+

function arrowMove (cellsX=0, cellsY=0) {
    let newX = 0;
    let newY = 0;
    if (cellsSelected.length == 0) {
        newX = Math.floor(grid.width / 2);
        newY = Math.floor(grid.height / 2);
    } else {
        if (arrowCell == null) arrowCell = cellsSelected[cellsSelected.length-1];
        newX = parseInt(arrowCell.getAttribute(CELL_ATTR.POS_X));
        newY = parseInt(arrowCell.getAttribute(CELL_ATTR.POS_Y));
        if (cellsX != 0) newX = cellsX > 0 ? newX+1 : newX-1;
        if (cellsY != 0) newY = cellsY > 0 ? newY+1 : newY-1;
    }

    if (newX > grid.width-1) newX = 0;
    if (newX < 0) newX = grid.width-1;
    if (newY > grid.height-1) newY = 0;
    if (newY < 0) newY = grid.height-1;
    
    arrowRemove();
    arrowCell = getCellAt(newX, newY);
    arrowCell.setAttribute(CELL_ATTR.ARROW_HIGHLIGHT, "");

    if (cellsSelected.length > 0 && KEY_DOWN.SHIFT) selectionAdd(arrowCell);
    else selectCell(arrowCell);
}

function arrowRemove () {
    if (arrowCell == null) return;
    arrowCell.removeAttribute(CELL_ATTR.ARROW_HIGHLIGHT);
    arrowCell = null;
}







//      +---------------------------+
//      |      Pencil Handlers      |
//      +---------------------------+

function pencilToggle (force=null) {
    pencil.button.setAttribute(BUTTON_ATTR.STATE, force == null ? pencil.active ? BUTTON_STATE.INACTIVE : BUTTON_STATE.ACTIVE : force == true ? BUTTON_STATE.ACTIVE : BUTTON_STATE.INACTIVE);
    pencil.buttonImage.setAttribute('src', force == null ? pencil.active ? pencil.iconSource.off : pencil.iconSource.on : force == true ? pencil.iconSource.on : pencil.iconSource.off);
    pencil.active = force == null ? !pencil.active : force;
}

function pencilUpdateHighlights () {

    document.querySelectorAll(`[${CELL_ATTR.TYPE}=${CELL_TYPE.PENCIL}]`).forEach((cell) => {
        cell.innerText = cell.getAttribute(CELL_ATTR.VALUE);
    });

    // Update highlights
    if (cellsSelected.length == 1 && (cellsSelected[0].getAttribute(CELL_ATTR.TYPE) != CELL_TYPE.NORMAL && cellsSelected[0].getAttribute(CELL_ATTR.TYPE) != CELL_TYPE.CLUE)) return;
    document.querySelectorAll('[' + CELL_ATTR.TYPE + ']').forEach((value, ket, parent) => {
        console.log("Checking pencil cell...");
        if (value.getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) {
            let cellValue = "" + String(value.getAttribute(CELL_ATTR.VALUE));
            let selectedValue = "" + String(cellsSelected[0].getAttribute(CELL_ATTR.VALUE));
            if (cellValue.indexOf(selectedValue) >= 0) {
                console.log("Cell has selected value!!");
                console.log("Found value " + selectedValue + " inside " + cellValue);

                value.innerHTML = "";

                let tempSpanLow = document.createElement("span");
                tempSpanLow.setAttribute(CELL_ATTR.PENCIL_HIGHLIGHT, "");

                let tempSpanHigh = document.createElement("span");
                tempSpanHigh.setAttribute(CELL_ATTR.PENCIL_HIGHLIGHT_DIGIT, "");
                tempSpanHigh.innerText = selectedValue;

                let splitValue = cellValue.split("");
                for (let x = 0, xl = splitValue.length; x < xl; x++) {
                    if (splitValue[x] == selectedValue) {
                        if (tempSpanLow.innerText != "") value.append(tempSpanLow);
                        tempSpanLow = document.createElement("span");
                        tempSpanLow.setAttribute(CELL_ATTR.PENCIL_HIGHLIGHT, "");
                        value.append(tempSpanHigh);
                    } else {
                        tempSpanLow.append(splitValue[x]);
                    }
                }

                if (tempSpanLow.innerText != "") value.append(tempSpanLow);
            }
        }
    });
}






//      +------------------------------+
//      |      Attribute Handlers      |
//      +------------------------------+

function removeAllAttributesFromAll () {
    for (let i = 0, j = cells.length; i < j; i++) {
        cells[i].removeAttribute(CELL_ATTR.HIGHLIGHT);
        cells[i].removeAttribute(CELL_ATTR.DIGIT_HIGHLIGHT);
        cells[i].setAttribute(CELL_ATTR.TYPE, CELL_TYPE.EMPTY);
        cells[i].removeAttribute(CELL_ATTR.ERROR);
    }
}






//      +-----------------------------+
//      |      Cell Manipulation      |
//      +-----------------------------+

function setCellValue (cells, value, playerInput=false, log=false, forcedType=CELL_TYPE.EMPTY) {
    if (!Array.isArray(cells)) cells = [cells];

    let affectedCells = [];
    let previousValues = [];
    let previousTypes = [];

    let newValues = [];
    let newTypes = [];

    // New values
    let newType = forcedType;
    if (pencil.active && playerInput) newType = CELL_TYPE.PENCIL;
    else if (value != 0 && !playerInput && forcedType != CELL_TYPE.PENCIL && forcedType != CELL_TYPE.CLUE) newType = CELL_TYPE.NORMAL;
    else if (value != 0 && playerInput && !pencil.active) newType = CELL_TYPE.NORMAL;
    let newValue = value;
    let newInnerText = value.toString();
    if (newValue == 0) newInnerText = "";

    for (let i = 0, j = cells.length; i < j; i++) {
        let cell = cells[i];

        // Clue cells can't be manipulated by player, skip
        if (cell.getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.CLUE && playerInput) continue;

        // Temp values prone for manipulation
        let tempNewType = newType;
        let tempNewValue = newValue;
        let tempNewInnerText = newInnerText;

        // Current values
        let currentType = cell.getAttribute(CELL_ATTR.TYPE);
        let currentValue = cell.getAttribute(CELL_ATTR.VALUE);

        // If value is 0 or previous value, delete value
        if (tempNewValue == 0 || (tempNewValue == currentValue && currentType == tempNewType)) {
            tempNewType = CELL_TYPE.EMPTY;
            tempNewInnerText = "";
            tempNewValue = 0;
        } else {
            // Check pencil
            if (tempNewType == CELL_TYPE.PENCIL && String(tempNewValue).length > 1) {
                console.log("Changing to multivalue of PENCIL cell: " + currentValue + " -> " + tempNewValue);
            } else if (tempNewType == CELL_TYPE.PENCIL && currentType == CELL_TYPE.PENCIL) {
                let valueArray = String(currentValue).split("");
                let canPlaceValue = true;
                tempNewInnerText = "";
                for (let x = 0, xl = valueArray.length; x < xl; x++) {
                    let checkValue = valueArray[x];
                    if (checkValue == tempNewValue) {
                        canPlaceValue = false;
                        continue;
                    }
                    if (checkValue > tempNewValue && canPlaceValue) {
                        tempNewInnerText += String(tempNewValue);
                        canPlaceValue = false;
                    }
                    tempNewInnerText += checkValue;
                    if (x == valueArray.length - 1 && canPlaceValue) {
                        tempNewInnerText += String(tempNewValue);
                    }
                }
                tempNewValue = parseInt(tempNewInnerText);
            }
        }

        // Store values
        affectedCells.push(cell);
        previousValues.push(currentValue);
        previousTypes.push(currentType);
        newValues.push(tempNewValue);
        newTypes.push(tempNewType);

        // Apply values
        cell.innerText = tempNewInnerText;
        cell.setAttribute(CELL_ATTR.VALUE, tempNewValue);
        //console.log("Setting cell to [" + tempNewType + "] inside manipulation func...");
        cell.setAttribute(CELL_ATTR.TYPE, tempNewType);

        // If applied number, check if pencils should be removed
        if (tempNewType == CELL_TYPE.NORMAL && playerInput) {
            let checkCells = [];
            
            let cellsRow = getCellRow(parseInt(cell.getAttribute(CELL_ATTR.POS_Y)));
            let cellsColumn = getCellColumn(parseInt(cell.getAttribute(CELL_ATTR.POS_X)));
            let cellsGroup = getCellGroup(parseInt(cell.getAttribute(CELL_ATTR.GROUP_INDEX)));

            console.log("Captured " + (cellsRow.length + cellsColumn.length + cellsGroup.length) + " cells...");

            for (let x = 0, xl = cellsRow.length; x < xl; x++) {
                if (checkCells.indexOf(cellsRow[x]) < 0 && cellsRow[x] != cell && cellsRow[x].getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) checkCells.push(cellsRow[x]);
                if (checkCells.indexOf(cellsColumn[x]) < 0 && cellsColumn[x] != cell && cellsColumn[x].getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) checkCells.push(cellsColumn[x]);
                if (checkCells.indexOf(cellsGroup[x]) < 0 && cellsGroup[x] != cell && cellsGroup[x].getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) checkCells.push(cellsGroup[x]);
            }

            console.log("Checking " + checkCells.length + " cells...");

            for (let x = 0, xl = checkCells.length; x < xl; x++) {
                if (String(checkCells[x].getAttribute(CELL_ATTR.VALUE)).indexOf(String(tempNewValue)) < 0) continue;
                let checkCellValue = checkCells[x].getAttribute(CELL_ATTR.VALUE);
                
                affectedCells.push(checkCells[x]);
                previousValues.push(checkCellValue);
                previousTypes.push(checkCells[x].getAttribute(CELL_ATTR.TYPE));

                let checkCellNewInnerText = String(checkCellValue).replace(String(tempNewValue), "");

                if (checkCellNewInnerText == "") {
                    newValues.push(0);
                    newTypes.push(CELL_TYPE.EMPTY);

                    checkCells[x].setAttribute(CELL_ATTR.VALUE, 0);
                    checkCells[x].setAttribute(CELL_ATTR.TYPE, CELL_TYPE.EMPTY);
                } else {
                    newValues.push(parseInt(checkCellNewInnerText));
                    newTypes.push(CELL_TYPE.PENCIL);

                    checkCells[x].setAttribute(CELL_ATTR.VALUE, parseInt(checkCellNewInnerText));
                    checkCells[x].setAttribute(CELL_ATTR.TYPE, CELL_TYPE.PENCIL);
                }

                checkCells[x].innerText = checkCellNewInnerText;
            }
        }
    }

    if (cellsSelected.length == 1) {
        highlightCellsFor(cellsSelected[0]);
        if (cellsSelected[0].getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.NORMAL) pencilUpdateHighlights();
    }

    updateErrorHighlights();

    if (log) logAction(affectedCells, previousValues, newValues, previousTypes, newTypes);

    if (playerInput) checkIfSolvedPuzzle();
}

function deleteDigit (playerInput=false, log=false) {
    if (cellsSelected.length == 0) return;
    setCellValue(cellsSelected.slice(0), 0, playerInput, log, CELL_TYPE.EMPTY);
}




//      +-------------------------------+
//      |      Puzzle Solved Check      |
//      +-------------------------------+

function checkIfSolvedPuzzle () {
    for (let i = 0, j = cells.length; i < j; i++) {
        let cellType = cells[i].getAttribute(CELL_ATTR.TYPE);
        if (cellType == CELL_TYPE.PENCIL || cellType == CELL_TYPE.EMPTY) return;
    }

    if (document.querySelectorAll(`[${CELL_ATTR.ERROR}]`).length > 0) return;

    clock.stop();

    alert("You won!");
}



//      +-----------------------+
//      |      Grid Access      |
//      +-----------------------+

function getCellAt (x, y) {
    return cells[y * grid.width + x];
}

function getCellGroup (gIndex) {
    let groupX = (gIndex % grid.groupsX) * grid.groupWidth;
    let groupY = Math.floor(gIndex / grid.groupsX) * grid.groupHeight;
    let result = [];

    for (let x = 0, xl = grid.groupWidth; x < xl; x++) for (y = 0, yl = grid.groupHeight; y < yl; y++) {
        result.push(cells[(groupY + y) * grid.width + groupX + x]);
    }

    return result;
}

function getCellRow (yIndex) {
    let result = [];
    for (let x = 0, xl = grid.width; x < xl; x++) result.push(cells[yIndex * grid.width + x]);
    return result;
}

function getCellColumn (xIndex) {
    let result = [];
    for (let y = 0, yl = grid.height; y < yl; y++) result.push(cells[y * grid.width + xIndex]);
    return result;
}







//      +------------------------------+
//      |      Highlight Handlers      |
//      +------------------------------+

function removeHighlights () {
    for (let i = 0, j = cells.length; i < j; i++) {
        cells[i].removeAttribute(CELL_ATTR.HIGHLIGHT);
        cells[i].removeAttribute(CELL_ATTR.DIGIT_HIGHLIGHT);
    }
}

function highlightCellsFor (cell) {
    removeHighlights();

    let cellType = cell.getAttribute(CELL_ATTR.TYPE);
    if (cellType == CELL_TYPE.EMPTY || cellType == CELL_TYPE.PENCIL) return;
    
    var cellX = parseInt(cell.getAttribute(CELL_ATTR.POS_X));
    var cellY = parseInt(cell.getAttribute(CELL_ATTR.POS_Y));

    for (let x = 0, xl = grid.width; x < xl; x++) {
        if (x == cellX) continue;
        cells[cellY * grid.width + x].setAttribute(CELL_ATTR.HIGHLIGHT, "");
    }

    for (let y = 0, yl = grid.height; y < yl; y++) {
        if (y == cellY) continue;
        cells[y * grid.width + cellX].setAttribute(CELL_ATTR.HIGHLIGHT, "");
    }

    var groupX = Math.floor(cellX/grid.groupWidth) * grid.groupWidth;
    var groupY = Math.floor(cellY/grid.groupHeight) * grid.groupHeight;

    for (let x = 0, xl = grid.groupWidth; x < xl; x++) {
        for (let y = 0, yl = grid.groupHeight; y < yl; y++) {
            if (cellX == groupX + x && cellY == groupY + y) continue;
            cells[(groupY + y) * grid.width + groupX + x].setAttribute(CELL_ATTR.HIGHLIGHT, "");
        }
    }

    // Highlight digits
    if (cell.getAttribute(CELL_ATTR.VALUE) != 0 && cell.getAttribute(CELL_ATTR.TYPE) != CELL_TYPE.PENCIL) {
        let value = cell.getAttribute(CELL_ATTR.VALUE);
        for (let i = 0, j = cells.length; i < j; i++) {
            let tempCell = cells[i];
            if (tempCell == cell) continue;
            if (tempCell.getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) continue;
            if (tempCell.getAttribute(CELL_ATTR.VALUE) == value) {
                tempCell.setAttribute(CELL_ATTR.DIGIT_HIGHLIGHT, "");
            }
        }
    }
}






//      +------------------+
//      |      Events      |
//      +------------------+

addEvent(document, "keypress", function (e) {
    e = e || window.event;
    if (e.keyCode >= 48 && e.keyCode <= 57) { // Nums [0-9]
        let after = e.keyCode - 48;
        if (after > 0 && numberButtons[after - 1].hasAttribute("data-sudoku-button-state")) return;
        
        selectionSetValue(after);
    }
});

addEvent(document, "keydown", function (e) {
    e = e || window.event;
    switch (e.key) {
        case "Delete": 
        case "Backspace": deleteDigit(true, true); break;
        case "p": pencilToggle(); break;
        case "r": reset(); break;
        case "z": if (KEY_DOWN.CTRL) logUndoAction(); break;
        case "y": if (KEY_DOWN.CTRL) logRedoAction(); break;
        case "Tab": KEY_DOWN.TAB = true; break;
        case "Control": KEY_DOWN.CTRL = true; break;
        case "Shift": KEY_DOWN.SHIFT = true; break;
        default:
    }
    switch (e.keyCode) {
        case 37: arrowMove(-1, 0); break;
        case 38: arrowMove(0, -1); break;
        case 39: arrowMove(1, 0); break;
        case 40: arrowMove(0, 1); break;
        default:
    }
});

addEvent(document, "keyup", function (e) {
    e = e || window.event;
    switch (e.key) {
        case "Tab": KEY_DOWN.TAB = false; break;
        case "Control": KEY_DOWN.CTRL = false; break;
        case "Shift": KEY_DOWN.SHIFT = false; break;
        default:
    }
});

function addEvent(element, eventName, callback) {
    if (element.addEventListener) element.addEventListener(eventName, callback, false);
    else if (element.attachEvent) element.attachEvent("on" + eventName, callback);
    else element["on" + eventName] = callback;
}






//      +--------------------------+
//      |      Error Handlers      |
//      +--------------------------+

function updateErrorHighlights () {

    document.querySelectorAll('[' + CELL_ATTR.ERROR + ']').forEach((value, key, parent) => { 
        value.removeAttribute(CELL_ATTR.ERROR);
    });

    let groups = []; // rows = [], columns = [];
    let rows = [];
    let columns = [];

    // Check conflicting cells
    for (let i = 0, j = grid.possibleValues.length; i < j; i++) {
        let checkCells = document.querySelectorAll('[' + CELL_ATTR.VALUE + '="' + grid.possibleValues[i] + '"]');
        for (let i0 = 0, j0 = checkCells.length; i0 < j0; i0++) {
            if (checkCells[i0].getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) continue;
            for (let i1 = 0, j1 = checkCells.length; i1 < j1; i1++) {
                if (checkCells[i1].getAttribute(CELL_ATTR.TYPE) == CELL_TYPE.PENCIL) continue;
                if (i0 == i1) continue;
                let cell0 = checkCells.item(i0);
                let cell1 = checkCells.item(i1);

                if ((cell0.getAttribute(CELL_ATTR.POS_X) == cell1.getAttribute(CELL_ATTR.POS_X))) {
                    if (columns.indexOf(cell0.getAttribute(CELL_ATTR.POS_X)) < 0) columns.push(cell0.getAttribute(CELL_ATTR.POS_X));
                    cell0.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.DIGIT);
                    cell1.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.DIGIT);
                }
                if ((cell0.getAttribute(CELL_ATTR.POS_Y) == cell1.getAttribute(CELL_ATTR.POS_Y))) {
                    if (rows.indexOf(cell0.getAttribute(CELL_ATTR.POS_Y)) < 0) rows.push(cell0.getAttribute(CELL_ATTR.POS_Y));
                    cell0.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.DIGIT);
                    cell1.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.DIGIT);
                }
                if ((cell0.getAttribute(CELL_ATTR.GROUP_INDEX) == cell1.getAttribute(CELL_ATTR.GROUP_INDEX))) {
                    if (groups.indexOf(cell0.getAttribute(CELL_ATTR.GROUP_INDEX)) < 0) groups.push(cell0.getAttribute(CELL_ATTR.GROUP_INDEX));
                    cell0.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.DIGIT);
                    cell1.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.DIGIT);
                }
            }
        }
    }

    // Highlight groups
    for (let i = 0, j = groups.length; i < j; i++) {
        let groupIndex = parseInt(groups[i]);

        let groupX = (groupIndex % grid.groupsX) * grid.groupWidth;
        let groupY = Math.floor(groupIndex / grid.groupsX) * grid.groupHeight;

        for (let x = 0, xl = grid.groupWidth; x < xl; x++) {
            for (let y = 0, yl = grid.groupHeight; y < yl; y++) {
                //let checkCell = getCellAt(groupX + x, groupY + y);
                let checkCell = cells[(groupY + y) * grid.width + groupX + x];
                if (!checkCell.hasAttribute(CELL_ATTR.ERROR)) checkCell.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.CELL);
            }
        }
    }

    // Highlight rows
    for (let i = 0, j = rows.length; i < j; i++) {
        let rowIndex = parseInt(rows[i]);
        for (let x = 0, xl = grid.width; x < xl; x++) {
            //let checkCell = getCellAt(x, rowIndex);
            let checkCell = cells[rowIndex * grid.width + x];
            if (!checkCell.hasAttribute(CELL_ATTR.ERROR)) checkCell.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.CELL);
        }
    }

    // Highlight rows
    for (let i = 0, j = columns.length; i < j; i++) {
        let columnIndex = parseInt(columns[i]);
        for (let y = 0, yl = grid.height; y < yl; y++) {
            //let checkCell = getCellAt(columnIndex, y);
            let checkCell = cells[y * grid.width + columnIndex];
            if (!checkCell.hasAttribute(CELL_ATTR.ERROR)) checkCell.setAttribute(CELL_ATTR.ERROR, CELL_ERROR.CELL);
        }
    }

    //console.log("NUMBER OF CONFLICTING CELLS: " + cellsConflicting.length);

    for (let i = 0, j = grid.possibleValues.length; i < j; i++) {
        let checkValue = grid.possibleValues[i];
        let gridIndexes = [];
        let errorNums = [];
        document.querySelectorAll('[' + CELL_ATTR.VALUE + '="' + String(checkValue) + '"]').forEach((value, key, parent) => {
            let tempGridIndex = value.getAttribute(CELL_ATTR.GROUP_INDEX);
            if (value.getAttribute(CELL_ATTR.TYPE) != CELL_TYPE.PENCIL) {
                if (gridIndexes.indexOf(tempGridIndex) < 0) gridIndexes.push(tempGridIndex);
                if (value.hasAttribute("data-sudoku-cell-error") && value.getAttribute("data-sudoku-cell-error") == "digit") errorNums.push(value);
            }
        });
        if (gridIndexes.length > grid.groupsTotal-1 && errorNums.length == 0) {
            document.querySelector('[data-button-value="' + String(checkValue) + '"]').setAttribute("data-sudoku-button-state", "disabled");
        } else {
            let checkButton = document.querySelector('[data-button-value="' + String(checkValue) + '"]');
            if (checkButton != null) checkButton.removeAttribute("data-sudoku-button-state");
        }
    }
}






//      +-------------------+
//      |      History      |
//      +-------------------+

let historyCurrentIndex = -1;
let history = [];

function logReset () {
    history = [];
    historyCurrentIndex = -1;
}

function logGetCurrent () {
    return (historyCurrentIndex != -1) ? history[historyCurrentIndex + 1] : null;
}

function logAction (cells, valuesBefore, valuesAfter, typesBefore, typesAfter) {
    let historyArray = [];

    for (let i = 0, j = cells.length; i < j; i++) {
        if (valuesBefore[i] == valuesAfter[i] && typesBefore[i] == typesAfter[i]) continue;
        historyArray.push({cell: cells[i], valueBefore: valuesBefore[i], valueAfter: valuesAfter[i], typeBefore: typesBefore[i], typeAfter: typesAfter[i]});
    }

    if (history.length != 0 && historyCurrentIndex < history.length - 1) {
        history.splice(historyCurrentIndex + 1, history.length - historyCurrentIndex - 1);
    }

    history.push(historyArray);
    historyCurrentIndex = history.length - 1;
}

function logUndoAction () {
    if (historyCurrentIndex == -1) return;
    
    let action = history[historyCurrentIndex];
    for(let i = 0, j = action.length; i < j; i++) {
        setCellValue(action[i].cell, action[i].valueBefore, false, false, action[i].typeBefore);
    }
    historyCurrentIndex--;
}

function logRedoAction () {
    if (historyCurrentIndex == history.length - 1) return;

    let action = history[historyCurrentIndex + 1];

    historyCurrentIndex++;
    for (let i = 0, j = action.length; i < j; i++) {
        setCellValue(action[i].cell, action[i].valueAfter, false, false, action[i].typeAfter);
    }
}






//      +------------------+
//      |      Solver      |
//      +------------------+

function solve () {
    // Construct solve grid structure
    let gridArray = []
    for (let i = 0, j = cells.length; i < j; i++) {
        let cellStructure = {};
        cellStructure.cell = cells[i];
        cellStructure.value = cells[i].getAttribute(CELL_ATTR.VALUE);
        console.log(cellStructure.value);
        cellStructure.possible = [];
        cellStructure.x = parseInt(cells[i].getAttribute(CELL_ATTR.POS_X));
        cellStructure.y = parseInt(cells[i].getAttribute(CELL_ATTR.POS_Y));
        cellStructure.groupIndex = parseInt(cells[i].getAttribute(CELL_ATTR.GROUP_INDEX));
        cellStructure.type = cells[i].getAttribute(CELL_ATTR.TYPE);
        gridArray.push(cellStructure);
    }

    console.log("solving grid: " + gridArray)

    // Fill possible numbers
    for (let i = 0, j = gridArray.length; i < j; i++) {
        let checkCell = gridArray[i];
        if (checkCell.type == CELL_TYPE.CLUE || checkCell.value != 0) continue;
        checkCell.possible = solveGetAllowedValues(gridArray, i);
        console.log("Possible values for cell [" + checkCell.x + "x" + checkCell.y + "] is " + checkCell.possible);
    }

    // Recursive solve
    let allCellsSolved = false;
    while (!allCellsSolved) {
        console.log("Grid not filled yet...");

        let gotStuck = true;
        for (let i = 0, j = gridArray.length; i < j; i++) {
            if (!gotStuck) continue;

            let checkCell = gridArray[i];

            if (checkCell.value == 0 && checkCell.possible.length == 1) {
                console.log("Setting cell [" + checkCell.x + "x" + checkCell.y + "] value to " + checkCell.possible[0] + "...");
                checkCell.value = checkCell.possible[0];
                checkCell.possible = [];
                solveUpdateAllowedValues(gridArray, i);
                console.log("Found cell with only possible length of 1...");
                gotStuck = false;
            }

            if (gotStuck) {
                for (let checkValueIndex = 0, checkValueMax = checkCell.possible.length; checkValueIndex < checkValueMax; checkValueIndex++) {
                    if (gotStuck) continue;
                    let checkValue = checkCell.possible[checkValueIndex];
                    if (solveOnlyPossible(gridArray, i, checkValue)) {
                        checkCell.value = checkValue;
                        checkCell.possible = [];
                        solveUpdateAllowedValues(gridArray, i);
                        gotStuck = false;
                        console.log("Found cell with only 1 possible value...");
                    }
                }
            }
        }
        if (gotStuck) {
            alert("Got stuck in recursive loop for solver...");
            break;
        }

        allCellsSolved = allCellsFilled(gridArray);
        console.log("Solved status = " + allCellsSolved);
    }

    // Fill solved grid
    console.log("Solving grid, changing " + gridArray.length + " values..");
    for (let i = 0, j = gridArray.length; i < j; i++) {
        if (gridArray[i].type == CELL_TYPE.CLUE) continue;
        console.log("Setting cell [" + gridArray[i].x + "x" + gridArray[i].y + "] to " + gridArray[i].value + "...");
        setCellValue(gridArray[i].cell, gridArray[i].value, false, false, CELL_TYPE.NORMAL);
    }

    alert("Solved grid successfully!");
}

function allCellsFilled (grid) {
    for (let x = 0, xl = grid.length; x < xl; x++) {
        if (grid[x].type == CELL_TYPE.CLUE) continue;
        if (grid[x].possible.length > 0) return false;
    }
    return true;
}

function solveGetAllowedValues (someGrid, index) {
    let cellData = someGrid[index];
    let allowedValues = [1,2,3,4,5,6,7,8,9];

    // Check Vertical
    for (let y = 0, yl = grid.height; y < yl; y++) {
        let checkCell = someGrid[y * grid.width + cellData.x];
        if (checkCell.value == 0) continue;
        if (allowedValues.indexOf(Number(checkCell.value)) >= 0) {
            allowedValues.splice(allowedValues.indexOf(Number(checkCell.value)), 1);
        }
    }

    // Check Horizontal
    for (let x = 0, xl = grid.width; x < xl; x++) {
        let checkCell = someGrid[cellData.y * grid.width + x];
        if (checkCell.value == 0) continue;
        if (allowedValues.indexOf(Number(checkCell.value)) >= 0) {
            allowedValues.splice(allowedValues.indexOf(Number(checkCell.value)), 1);
        }
    }

    // Check Group
    let groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
    let groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

    for (let x = 0, xl = grid.groupWidth; x < xl; x++) {
        for (let y = 0, yl = grid.groupHeight; y < yl; y++) {
            let checkCell = someGrid[(groupY + y) * grid.width + groupX + x];
            if (checkCell.value == 0) continue;
            if (allowedValues.indexOf(Number(checkCell.value)) >= 0) {
                allowedValues.splice(allowedValues.indexOf(Number(checkCell.value)), 1);
            }
        }
    }

    return allowedValues;
}

function solveOnlyPossible (someGrid, index, value) {
    let cellData = someGrid[index];

    let onlyPossible = true;

    // Check rows
    for (let x = 0, xl = grid.width; x < xl; x++) {
        let checkCell = someGrid[cellData.y * grid.width + x];
        if (checkCell.type == CELL_TYPE.CLUE || checkCell == cellData || checkCell.value != 0) continue;
        if (checkCell.possible.indexOf(value) >= 0) onlyPossible = false;
    }

    if (onlyPossible) return true;
    onlyPossible = true;

    // Check columns
    for (let y = 0, yl = grid.height; y < yl; y++) {
        let checkCell = someGrid[y * grid.width + cellData.x];
        if (checkCell.type == CELL_TYPE.CLUE || checkCell == cellData || checkCell.value != 0) continue;
        if (checkCell.possible.indexOf(value) >= 0) onlyPossible = false;
    }

    if (onlyPossible) return true;
    onlyPossible = true;

    // Check group
    let groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
    let groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

    for (let x = 0, xl = grid.groupWidth; x < xl; x++) {
        for (let y = 0, yl = grid.groupHeight; y < yl; y++) {
            let checkCell = someGrid[(groupY + y) * grid.width + groupX + x];
            if (checkCell.type == CELL_TYPE.CLUE || checkCell == cellData || checkCell.value != 0) continue;
            if (checkCell.possible.indexOf(value) >= 0) onlyPossible = false;
        }
    }

    return onlyPossible;
}

function solveUpdateAllowedValues (someGrid, index) {
    let cellData = someGrid[index];

    // Check Vertical
    for(let y = 0, yl = grid.height; y < yl; y++) {
        let checkCell = someGrid[y * grid.width + cellData.x];
        if (checkCell.value != 0) continue;
        if (checkCell.possible.indexOf(cellData.value) >= 0) {
            checkCell.possible.splice(checkCell.possible.indexOf(cellData.value), 1);
        }
    }

    // Check Horizontal
    for(let x = 0, xl = grid.width; x < xl; x++) {
        let checkCell = someGrid[cellData.y * grid.width + x];
        if (checkCell.value != 0) continue;
        if (checkCell.possible.indexOf(cellData.value) >= 0) {
            checkCell.possible.splice(checkCell.possible.indexOf(cellData.value), 1);
        }
    }

    // Check Group
    let groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
    let groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

    for(let x = 0, xl = grid.groupWidth; x < xl; x++) {
        for(let y = 0, yl = grid.groupHeight; y < yl; y++) {
            let checkCell = someGrid[(groupY + y) * grid.width + groupX + x];
            if (checkCell.value != 0) continue;
            if (checkCell.possible.indexOf(cellData.value) >= 0) {
                checkCell.possible.splice(checkCell.possible.indexOf(cellData.value), 1);
            }
        }
    }
}






//      +---------------------+
//      |      Generator      |
//      +---------------------+

function fillUnique () {

    // Create temp grid
    let tempGrid = [];
    for (let i = 0, j = grid.cellsTotal; i < j; i++) tempGrid.push(0);

    // Error variables for tracking failures...
    let numFailedAttempts = 0;
    let maxFailedAttempts = 5;
    let numResetAttempts = 0;
    let maxResetAttempts = 10;
    let numCompleteResetAttempts = 0;
    let maxCompleteResetAttempts = 20;

    let failedValueCounter = 0;
    let failedLineCounter = 0;
    let failedCompleteCounter = 0;

    // Loop to fill grid
    while (tempGrid.indexOf(0) >= 0) {

        // Find cell index with unset value
        let cellIndex = -1;
        for (let ci = 0, cil = tempGrid.length; ci < cil; ci++) {
            if (tempGrid[ci] != 0) continue;
            cellIndex = ci;
            break;
        }

        // Check if found cellIndex
        if (cellIndex == -1) {
            numFailedAttempts++;
            console.log("Added failed attempt due to not finding index...");
            continue;
        }

        // Check if any value is allowed, in random order
        let allowedValue = 0;
        let possibleValues = grid.possibleValues.slice(0);
        while (possibleValues.length > 0) {

            // Reset allowedValue
            allowedValue = 0;

            // Store individual check value from remaining list
            let checkValueIndex = possibleValues.length == 1 ? 0 : Math.round(Math.random()*(possibleValues.length-1));
            let checkValue = possibleValues.splice(checkValueIndex, 1)[0];

            console.log("Checking value: " + checkValue);

            // Check if value is permitted in all groupings (rows, columns, groups)
            let cellIndexX = cellIndex % grid.width;
            let cellIndexY = Math.floor(cellIndex / grid.width);
            let checkNearIndexes = [];

            // Row
            for (let colIndex = 0, cil = grid.width; colIndex < cil; colIndex++) {
                let checkIndex = (cellIndexY * grid.width) + colIndex;
                if (checkIndex != cellIndex && checkNearIndexes.indexOf(checkIndex) < 0) {
                    checkNearIndexes.push(checkIndex);
                }
            }

            // Column
            for (let rowIndex = 0, ril = grid.height; rowIndex < ril; rowIndex++) {
                let checkIndex = (rowIndex * grid.width) + cellIndexX;
                if (checkIndex != cellIndex && checkNearIndexes.indexOf(checkIndex) < 0) {
                    checkNearIndexes.push(checkIndex);
                }
            }

            // Group
            let groupIndexX = Math.floor(cellIndexX / grid.groupWidth) * grid.groupWidth;
            let groupIndexY = Math.floor(cellIndexY / grid.groupHeight) * grid.groupHeight;
            for (let gx = 0, gxl = grid.groupWidth; gx < gxl; gx++) { 
                for (let gy = 0, gyl = grid.groupHeight; gy < gyl; gy++) {
                    let checkIndex = (groupIndexY + gy) * grid.width + groupIndexX + gx;
                    if (checkIndex != cellIndex && checkNearIndexes.indexOf(checkIndex) < 0) {
                        checkNearIndexes.push(checkIndex);
                    }
                }
            }

            console.log("Checking conflicts for " + checkNearIndexes.length + " cells...");

            // Check if any conflicts appear
            for (let ci = 0, cil = checkNearIndexes.length; ci < cil; ci++) {
                if (tempGrid[checkNearIndexes[ci]] == checkValue) {
                    // Set allowedValue to -1 to indicate failure
                    allowedValue = -1;
                    break;
                }
            }

            // Check if value is allowed, if not; continue
            if (allowedValue == 0) {
                allowedValue = checkValue;
                break;
            } else if (allowedValue == -1) {
                continue;
            }
        }

        // If no allowed value were found, continue
        if (allowedValue <= 0) {
            if (numFailedAttempts >= maxFailedAttempts) {
                if (numResetAttempts >= maxResetAttempts) {
                    if (numCompleteResetAttempts >= maxCompleteResetAttempts) {
                        console.log("Last complete reset failed...");
                        break;
                    } else {
                        console.log("Added failed attempt due to not solving complete reset...");
                        failedCompleteCounter++;
                        numCompleteResetAttempts++;
                        numResetAttempts = 0;
                        numFailedAttempts = 0;
                        for (let ri = 0, ril = tempGrid.length; ri < ril; ri++) {
                            tempGrid[ri] = 0;
                        }
                        continue;
                    }
                } else {
                    failedLineCounter++;
                    numResetAttempts++;
                    numFailedAttempts = 0;
                    let resetPoint = Math.floor((tempGrid.indexOf(0) - 1) / grid.width) * grid.width;
                    for (let ri = resetPoint, ril = tempGrid.length; ri < ril; ri++) {
                        tempGrid[ri] = 0;
                    }
                    continue;
                }
            } else {
                failedValueCounter++;
                numFailedAttempts++;
                console.log("Added failed attempt due to not finding allowed value...");
                continue;
            }
        }

        // Set value and continue..
        if (allowedValue > 0) {
            tempGrid[cellIndex] = allowedValue;
            console.log("Reset failed counter, found allowed digit!");
            numFailedAttempts = 0;
            continue;
        }
    }

    if (numCompleteResetAttempts >= maxCompleteResetAttempts) {
        alert("Stopped generating grid, too many failed attempts...");
        return null;
    } else {
        console.log("------------------------------");
        console.log("FOUND WORKING SOLUTION!");
        console.log("------------------------------");
        console.log("Failed counter:");
        console.log("Values: " + failedValueCounter);
        console.log("Lines: " + failedLineCounter);
        console.log("Resets: " + failedCompleteCounter);
        console.log("------------------------------");
        console.log("Unique grid as string:");
        let gridString = tempGrid.toString();
        while (gridString.includes(",")) gridString = gridString.replace(",", "");
        console.log(gridString);
        console.log("------------------------------");
    }

    //initPuzzle(tempGrid);

    return tempGrid;
}







//      +----------------------------+
//      |      Puzzle Generator      |
//      +----------------------------+

function createPuzzle (numsToRemove=50) {

    // Prepare grid
    let tempGrid = fillUnique();

    console.log(tempGrid);

    let numsRemaining = numsToRemove;
    let removeAttemptCount = 0;
    while (numsRemaining > 0) {

        console.log("Attempt numer: " + removeAttemptCount);
        
        // Find random index
        let workingIndex = -1;
        while (workingIndex == -1) {
            let checkIndex = Math.floor(Math.random() * tempGrid.length);
            if (tempGrid[checkIndex] != 0) workingIndex = checkIndex;
        }

        console.log("Found working index!");

        removeAttemptCount++;

        // Remove digit and check
        let lastDigit = tempGrid[workingIndex];
        tempGrid[workingIndex] = 0;
        if (!hasSingleUniqueSolution(tempGrid)) {
            tempGrid[workingIndex] = lastDigit;
            initPuzzle(tempGrid);
            continue;
        }

        numsRemaining--;
    }

    initPuzzle(tempGrid);
}







//      +----------------------------+
//      |      Backtrack Solver      |
//      +----------------------------+

function hasSingleUniqueSolution (_grid) {
    let testGrid = _grid.slice(0);

    console.log("Test grid length: " + testGrid.length);

    let getAllAffectedValues = function (sourceIndex, sourceGrid) {
        let returnArray = [];

        // Get column
        let xIndex = sourceIndex % grid.width;
        for (let i = 0, j = grid.height; i < j; i++) {
            var checkIndex = i * grid.width + xIndex;
            var checkValue = sourceGrid[checkIndex];
            if (checkIndex != sourceIndex && !Array.isArray(checkValue) && returnArray.indexOf(checkValue) < 0) returnArray.push(checkValue);
        }

        // Get row
        let yIndex = Math.floor(sourceIndex / grid.width);
        for (let i = 0, j = grid.width; i < j; i++) {
            var checkIndex = yIndex * grid.width + i;
            var checkValue = sourceGrid[checkIndex];
            if (checkIndex != sourceIndex && !Array.isArray(checkValue) && returnArray.indexOf(checkValue) < 0) returnArray.push(checkValue);
        }

        // Get group
        let xGroup = Math.floor(xIndex / grid.groupWidth) * grid.groupWidth;
        let yGroup = Math.floor(yIndex / grid.groupHeight) * grid.groupHeight;
        for (let gx = 0, gxl = grid.groupWidth; gx < gxl; gx++) {
            for (let gy = 0, gyl = grid.groupHeight; gy < gyl; gy++) {
                var checkIndex = (yGroup + gy) * grid.width + xGroup + gx;
                var checkValue = sourceGrid[checkIndex];
                if (checkIndex != sourceIndex && !Array.isArray(checkValue) && returnArray.indexOf(checkValue) < 0) returnArray.push(checkValue);
            }
        }

        console.log("Length of affected cells.... " + returnArray.length); 

        // Return all indexes
        return returnArray;
    }

    let getPossibleValuesOf = function (sourceIndex, sourceGrid) {
        let returnArray = grid.possibleValues.slice(0);
        let affectedValues = getAllAffectedValues(sourceIndex, sourceGrid);
        for (let i = 0, j = affectedValues.length; i < j; i++) {
            if (returnArray.indexOf(affectedValues[i]) >= 0) returnArray.splice(returnArray.indexOf(affectedValues[i]), 1);
        }
        return returnArray;
    }

    let getPencilAffectedOf = function (sourceIndex, sourceGrid) {
        let returnArray = [];

        // Get column
        let xIndex = sourceIndex % grid.width;
        for (let i = 0, j = grid.height; i < j; i++) {
            var checkIndex = i * grid.width + xIndex;
            if (checkIndex == sourceIndex) continue;
            if (Array.isArray(sourceGrid[checkIndex]) && returnArray.indexOf(checkIndex) < 0) returnArray.push(checkIndex);
        }

        // Get row
        let yIndex = Math.floor(sourceIndex / grid.width);
        for (let i = 0, j = grid.width; i < j; i++) {
            var checkIndex = yIndex * grid.width + i;
            if (checkIndex == sourceIndex) continue;
            if (Array.isArray(sourceGrid[checkIndex]) && returnArray.indexOf(checkIndex) < 0) returnArray.push(checkIndex);
        }

        // Get group
        let xGroup = Math.floor(xIndex / grid.groupWidth) * grid.groupWidth;
        let yGroup = Math.floor(yIndex / grid.groupHeight) * grid.groupHeight;
        for (let gx = 0, gxl = grid.groupWidth; gx < gxl; gx++) {
            for (let gy = 0, gyl = grid.groupHeight; gy < gyl; gy++) {
                var checkIndex = (yGroup + gy) * grid.width + xGroup + gx;
                if (checkIndex == sourceIndex) continue;
                if (Array.isArray(sourceGrid[checkIndex]) && returnArray.indexOf(checkIndex) < 0) returnArray.push(checkIndex);
            }
        }

        // Return all indexes
        return returnArray;
    }

    let isGridSolved = function (sourceGrid) {
        for (let i = 0, j = sourceGrid.length; i < j; i++) {
            if (Array.isArray(sourceGrid[i])) return false;
        }
        return true;
    }

    // Set 0s to arrays of possible values
    for (let i = 0, j = testGrid.length; i < j; i++) {
        if (testGrid[i] != 0) continue;
        testGrid[i] = getPossibleValuesOf(i, testGrid);
        console.log("Added possible values of length: " + testGrid[i].length);
    }

    // Loop until stuck or solved
    while (!isGridSolved(testGrid)) {
        
        // Find grid index with array of length == 1
        let indexFound = -1;
        for (let i = 0, j = testGrid.length; i < j; i++) {
            if (!Array.isArray(testGrid[i])) continue;
            if (testGrid[i].length != 1) continue;
            indexFound = i;
            break;
        }

        // Check if found no index, return false
        if (indexFound == -1) {
            console.log("Found no single solution, grid was unsolveable...");
            return false;
        }

        // Set value and remove pencils of affected cells
        testGrid[indexFound] = testGrid[indexFound][0];
        getPencilAffectedOf(indexFound, testGrid).forEach((value, key, parent) => {
            if (testGrid[value].indexOf(testGrid[indexFound]) >= 0) {
                testGrid[value].splice(testGrid[value].indexOf(testGrid[indexFound]), 1);
            }
        });
    }

    console.log("Solved grid with one solution...");
    return true;
}






//      +----------------------------+
//      |      Logger Functions      |
//      +----------------------------+

function logPuzzleArrayAsTable (numArray) {
    console.groupCollapsed('%cPuzzle grid table:', 'color: orange; font-weight: bold;');
    let columnArray = [[], [], [], [], [], [], [], [], []];
    for (let i = 0, j = numArray.length; i < j; i++) { columnArray[Math.floor(i / grid.width)].push(numArray[i]); }
    console.table(columnArray);
    console.groupEnd();
}

function logPuzzleStringAsTable (numString) {
    let numArray = numString.split("", grid.cellsTotal);
    numArray.forEach((value, key, parent) => numArray[key] = parseInt(value));
    logPuzzleArrayAsTable(numArray);
}

function logButtonPress (buttonLabel) { console.log(`%cPressed button: ${buttonLabel}`, 'color: lightgreen; font-weight: bold;'); }

function logTestTrace (msg) {
    console.trace(`%cTesting trace: %c${msg}`, 'color: rgb(255, 100, 250); font-weight: bold; font-size: 1.2em;', 'color: white; font-weight: normal; font-size: 1em;');
}

function logErrorTrace (msg) {
    console.trace(`%cError trace: %c${msg}`, 'color: red; font-weight: bold; font-size: 1.2em;', 'color: white; font-weight: normal; font-size: 1.0em;');
}