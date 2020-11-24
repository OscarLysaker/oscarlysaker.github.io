var sudoku = function () {

    var samplePuzzles = {
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

    var CELL_STATE = {
        NORMAL : 'normal',
        CLUE : 'clue',
        PENCIL : 'pencil'
    };

    var CELL_ERROR = {
        DIGIT : 'digit',
        CELL : 'cell'
    };

    var KEY_DOWN = {
        SHIFT : false,
        TAB : false,
        CTRL : false
    };

    var STYLE_ATTR = {
        CELL_BORDER_RIGHT : 'data-sudoku-cell-border-right',
        CELL_BORDER_BOTTOM : 'data-sudoku-cell-border-bottom'
    };

    var ATTR = {
        ID : {
            // ROOTS
            DOC_ROOT : 'sudoku-doc-root',
            ROOT : 'sudoku-root',

            // CONTAINERS
            CONTAINER_TOP : 'sudoku-container-top',
            CONTAINER_GRID : 'sudoku-container-grid',
            CONTAINER_BOTTOM : 'sudoku-container-bottom',

            // Grid
            TABLE : 'sudoku-table',
            
            // Logo
            LOGO : 'sudoku-logo-root',

            // CLOCK
            CLOCK_ROOT : 'sudoku-clock-root',

            // BUTTONS
            BTN_PAUSE : 'sudoku-button-pause',
            BTN_PAUSE_ICON : 'sudoku-button-pause-icon',
            // Button containers
            BTN_CONTAINER_CORE : 'sudoku-button-container-core',
            BTN_CONTAINER_ACTIONS : 'sudoku-button-container-actions',
            BTN_CONTAINER_VALUES : 'sudoku-button-container-values',
            // Top buttons
            BTN_NEW_SAMPLE : 'sudoku-button-new-sample',
            BTN_RESET : 'sudoku-button-reset',
            BTN_SOLVE : 'sudoku-button-solve',
            BTN_CREATE_PUZZLE : 'sudoku-button-create-puzzle',
            // Bottom input buttons
            BTN_UNDO : 'sudoku-button-undo',
            BTN_REDO : 'sudoku-button-redo',
            BTN_ERASER : 'sudoku-button-eraser',
            BTN_PEN : 'sudoku-button-pen',
            BTN_HINT : 'sudoku-button-hint'
        },
        CLASS : {
            // Buttons
            BTNS_CORE : 'sudoku-buttons-core',
            BTNS_ACTIONS : 'sudoku-buttons-actions',
            BTNS_VALUES : 'sudoku-buttons-values',
            // Cells
            ROW : 'sudoku-row',
            CELL : 'sudoku-cell'
        },
        SRC : {
            SVG : {
                PAUSED : './svg/pause_continue.svg',
                UNPAUSED : './svg/pause_pause.svg',
                ERASER : './svg/eraser.svg',
                HINT : './svg/hint.svg',
                PEN_ON : './svg/pen-on.svg',
                PEN_OFF : './svg/pen-off.svg',
                UNDO : './svg/undo.svg',
                REDO : './svg/redo.svg'
            }
        },
        DATA : {
            BUTTON_VALUE : 'data-button-value',
            CELL_X : 'data-cell-x',
            CELL_Y : 'data-cell-y',
            CELL_GROUP_INDEX : 'data-cell-group-index',
            CELL_STATE : 'data-cell-state',
            CELL_VALUE : 'data-cell-value',

            HIGHLIGHT : 'data-sudoku-cell-highlight',
            DIGIT_HIGHLIGHT : 'data-sudoku-digit-highlight',
            ARROW_HIGHLIGHT : 'data-sudoku-cell-arrow-highlight',
            PENCIL_HIGHLIGHT : 'data-sudoku-cell-pencil-highlight',
            PENCIL_HIGHLIGHT_DIGIT : 'data-sudoku-cell-pencil-highlight-digit',

            BUTTON_STATE : 'data-button-state',

            ERROR : 'data-sudoku-error',
            SELECTED : 'data-sudoku-cell-selected'
        }
    }

    var SELECTION = {
        MULTI : 'multi',
        SINGLE : 'single'
    }

    var GRID_SIZE = {
        SMALL  : 'small',
        NORMAL : 'normal',
        HUGE   : 'huge'
    };

    var BUTTON_STATE = {
        ACTIVE : 'active',
        INACTIVE : 'inactive',
        DISABLED : 'disabled'
    }

    var isTouch = false;
    var allPossibleValues = ["1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G"];

    function detectMob() {
        const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i, /iPod/i, /BlackBerry/i, /Windows Phone/i];
        return toMatch.some((toMatchItem) => { return navigator.userAgent.match(toMatchItem); });
    }

    function GridData (gridSize=GRID_SIZE.NORMAL) {
        this.emptyValue = "0";
        this.possibleValues = allPossibleValues.slice(0);
        this.setSize = (gridSize) => {
            switch (gridSize) {
                case GRID_SIZE.SMALL:
                    this.width = 6;
                    this.height = 6;
                    this.groupsX = 2;
                    this.groupsY = 3;
                    this.possibleValues = this.possibleValues.slice(0, 6);
                    break;
                case GRID_SIZE.HUGE:
                    this.width = 16;
                    this.height = 16;
                    this.groupsX = 4;
                    this.groupsY = 4;
                    this.possibleValues = this.possibleValues.slice(0, 16);
                    break;
                case GRID_SIZE.NORMAL:
                default:
                    this.width = 9;
                    this.height = 9;
                    this.groupsX = 3;
                    this.groupsY = 3;
                    this.possibleValues = this.possibleValues.slice(0, 9);
            }
            this.cellsTotal = this.width * this.height;
            this.groupsTotal = this.groupsX * this.groupsY;
            this.groupWidth = (this.width / this.groupsX)|0;
            this.groupHeight = (this.height / this.groupsY)|0;
            this.cellsPerGroup = this.groupWidth * this.groupHeight;
        }
        this.setSize(gridSize);
    }

    //var grid = new GridData(GRID_SIZE.NORMAL);
    //var elems = new sudokuBuilder.SudokuElems(null, grid);

    var grid = new GridData(GRID_SIZE.NORMAL);
    var elems = null;
    var debugging = false;

    function init () {
        isTouch = detectMob();
        if (isTouch) document.head.querySelector('[href="./css/sudoku.css"]').setAttribute("href", "./css/sudoku-mobile.css");
        elems = new builder.SudokuElems(null);
    }

    function reset () {
        console.log("Resetting sudoku puzzle...");
        selection.remove();

        pencil.toggle(false);

        elems.containerBottomElems.top.buttons.hint.root.setAttribute(ATTR.DATA.BUTTON_STATE, BUTTON_STATE.DISABLED);
        for (var i=0, j=elems.containerBottomElems.bottom.buttons.length; i<j; i++) {
            elems.containerBottomElems.bottom.buttons[i].removeAttribute("data-sudoku-button-state", "disabled");
        }
        clock.reset();
        actions.setCellValue(elems.cells, grid.emptyValue, false, false, CELL_STATE.NORMAL);
        removeAllAttributesFromAll();
        log.reset();
        arrow.remove();
        console.log("Sudoku successfully reset!");
    }

    var cellTimeouts = [];

    function initPuzzle (puzzle) {
        reset();
        elems.containerBottomElems.top.buttons.hint.root.removeAttribute(ATTR.DATA.BUTTON_STATE);
        while (cellTimeouts.length > 0) clearTimeout(cellTimeouts.splice(0,1)[0]);

        elems.cells.forEach((value, key, parent) => { value.removeAttribute("data-sudoku-cell-start-anim"); });

        var animOffset = 4;
        var animTotal = 4 * 81 + 400;
        cellTimeouts.push(
            setTimeout(function () {
                elems.cells.forEach((value, key, parent) => { value.removeAttribute("data-sudoku-cell-start-anim"); });
                clock.start();
                console.log("Started clock...");
            }, animTotal)
        );
        for (var i=0, j=elems.cells.length; i<j; i++) {
            (function (cell, value, state, timeout) {
                cellTimeouts.push(
                    setTimeout(function () {
                        cell.setAttribute("data-sudoku-cell-start-anim", "");
                        actions.setCellValue(cell, value, false, false, state);
                    }, timeout)
                );
            })(elems.cells[i], puzzle[i], puzzle[i] == grid.emptyValue ? CELL_STATE.NORMAL : CELL_STATE.CLUE, i * animOffset);
        }

        //logPuzzleArrayAsTable(puzzle);
    }

    //  +------------------+
    //  |      Pencil      |
    //  +------------------+

    var pencil = function () {

        var active = false;

        function toggle (force=null) {
            elems.containerBottomElems.top.buttons.pen.root.setAttribute(ATTR.DATA.BUTTON_STATE, force == null ? pencil.active ? BUTTON_STATE.INACTIVE : BUTTON_STATE.ACTIVE : force == true ? BUTTON_STATE.ACTIVE : BUTTON_STATE.INACTIVE);
            elems.containerBottomElems.top.buttons.pen.icon.setAttribute('src', force == null ? pencil.active ? ATTR.SRC.SVG.PEN_OFF : ATTR.SRC.SVG.PEN_ON : force == true ? ATTR.SRC.SVG.PEN_ON : ATTR.SRC.SVG.PEN_OFF);
            pencil.active = force == null ? !pencil.active : force;

            console.log("PENCIL STATE: " + pencil.active);
        }

        return {
            active:active,
            toggle:toggle
        };
    }();

    //  +-------------------+
    //  |      Actions      |
    //  +-------------------+

    var actions = function () {

        function getCellAt (x, y) {
            return elems.cells[y * grid.width + x];
        }

        function getCellGroup (gIndex) {
            var groupX = (gIndex % grid.groupsX) * grid.groupWidth;
            var groupY = Math.floor(gIndex / grid.groupsX) * grid.groupHeight;
            var result = [];

            for (var x=0, xl=grid.groupWidth; x<xl; x++) for (y=0, yl=grid.groupHeight; y<yl; y++) {
                result.push(elems.cells[(groupY + y) * grid.width + groupX + x]);
            }

            return result;
        }

        function getCellRow (yIndex) {
            var result = [];
            for (var i=0, j=grid.width; i<j; i++) result.push(elems.cells[yIndex * grid.width + i]);
            return result;
        }

        function getCellColumn (xIndex) {
            var result = [];
            for (var i=0, j=grid.height; i<j; i++) result.push(elems.cells[i * grid.width + xIndex]);
            return result;
        }

        function deleteDigit (playerInput=false, logAction=false) {
            if (selection.cells.length == 0) return;
            actions.setCellValue(selection.cells.slice(0), grid.emptyValue, playerInput, logAction, CELL_STATE.NORMAL);
        }
        
        function setCellValue (cells, value, playerInput=false, logAction=false, forcedType=CELL_STATE.NORMAL) {
            if (!Array.isArray(cells)) cells = [cells];

            var affectedCells = [];
            var previousValues = [];
            var previousTypes = [];

            var newValues = [];
            var newTypes = [];

            // New values
            var newType = forcedType;

            if (pencil.active && playerInput && value == grid.emptyValue) newType = CELL_STATE.NORMAL;
            else if (pencil.active && playerInput) newType = CELL_STATE.PENCIL;
            else if (value != grid.emptyValue && !playerInput && forcedType != CELL_STATE.PENCIL && forcedType != CELL_STATE.CLUE) newType = CELL_STATE.NORMAL;
            else if (value != grid.emptyValue && playerInput && !pencil.active) newType = CELL_STATE.NORMAL;
            var newValue = value;
            var newInnerText = value;
            if (newValue == grid.emptyValue) newInnerText = "";

            for (var i=0, j=cells.length; i<j; i++) {
                var cell = cells[i];

                // Clue cells can't be manipulated by player, skip
                if (cell.getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.CLUE && playerInput) continue;

                // Temp values prone for manipulation
                var tempNewType = newType;
                var tempNewValue = newValue;
                var tempNewInnerText = newInnerText;

                // Current values
                var currentType = cell.getAttribute(ATTR.DATA.CELL_STATE);
                var currentValue = cell.getAttribute(ATTR.DATA.CELL_VALUE);

                // If value is 0 or previous value, delete value
                if (tempNewValue == grid.emptyValue || (tempNewValue == currentValue && currentType == tempNewType)) {
                    tempNewType = CELL_STATE.NORMAL;
                    tempNewInnerText = "";
                    tempNewValue = grid.emptyValue;
                } else {
                    // Check pencil
                    if (tempNewType == CELL_STATE.PENCIL && String(tempNewValue).length > 1) {
                        console.log("Changing to multivalue of PENCIL cell: " + currentValue + " -> " + tempNewValue);
                    } else if (tempNewType == CELL_STATE.PENCIL && currentType == CELL_STATE.PENCIL) {
                        var valueArray = String(currentValue).split("");
                        var canPlaceValue = true;
                        tempNewInnerText = "";
                        for (var ii=0, jj=valueArray.length; ii<jj; ii++) {
                            var checkValue = valueArray[ii];
                            if (checkValue == tempNewValue) {
                                canPlaceValue = false;
                                continue;
                            }
                            if (checkValue > tempNewValue && canPlaceValue) {
                                tempNewInnerText += String(tempNewValue);
                                canPlaceValue = false;
                            }
                            tempNewInnerText += checkValue;
                            if (ii == valueArray.length - 1 && canPlaceValue) {
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
                cell.setAttribute(ATTR.DATA.CELL_VALUE, tempNewValue);
                cell.setAttribute(ATTR.DATA.CELL_STATE, tempNewType);

                // If applied number, check if pencils should be removed
                if (tempNewType == CELL_STATE.NORMAL && playerInput) {
                    var checkCells = [];
                    
                    var cellsRow = getCellRow(parseInt(cell.getAttribute(ATTR.DATA.CELL_Y)));
                    var cellsColumn = getCellColumn(parseInt(cell.getAttribute(ATTR.DATA.CELL_X)));
                    var cellsGroup = getCellGroup(parseInt(cell.getAttribute(ATTR.DATA.CELL_GROUP_INDEX)));

                    console.log("Captured " + (cellsRow.length + cellsColumn.length + cellsGroup.length) + " cells...");

                    for (var ii=0, jj=cellsRow.length; ii<jj; ii++) {
                        if (checkCells.indexOf(cellsRow[ii]) < 0 && cellsRow[ii] != cell && cellsRow[ii].getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.PENCIL) checkCells.push(cellsRow[ii]);
                        if (checkCells.indexOf(cellsColumn[ii]) < 0 && cellsColumn[ii] != cell && cellsColumn[ii].getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.PENCIL) checkCells.push(cellsColumn[ii]);
                        if (checkCells.indexOf(cellsGroup[ii]) < 0 && cellsGroup[ii] != cell && cellsGroup[ii].getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.PENCIL) checkCells.push(cellsGroup[ii]);
                    }

                    console.log("Checking " + checkCells.length + " cells...");

                    for (var ii=0, jj=checkCells.length; ii<jj; ii++) {
                        if (String(checkCells[ii].getAttribute(ATTR.DATA.CELL_VALUE)).indexOf(String(tempNewValue)) < 0) continue;
                        var checkCellValue = checkCells[ii].getAttribute(ATTR.DATA.CELL_VALUE);
                        
                        affectedCells.push(checkCells[ii]);
                        previousValues.push(checkCellValue);
                        previousTypes.push(checkCells[ii].getAttribute(ATTR.DATA.CELL_STATE));

                        var checkCellNewInnerText = String(checkCellValue).replace(String(tempNewValue), "");

                        if (checkCellNewInnerText == "") {
                            newValues.push(grid.emptyValue);
                            newTypes.push(CELL_STATE.NORMAL);

                            checkCells[ii].setAttribute(ATTR.DATA.CELL_VALUE, grid.emptyValue);
                            checkCells[ii].setAttribute(ATTR.DATA.CELL_STATE, CELL_STATE.NORMAL);
                        } else {
                            newValues.push(parseInt(checkCellNewInnerText));
                            newTypes.push(CELL_STATE.PENCIL);

                            checkCells[ii].setAttribute(ATTR.DATA.CELL_VALUE, parseInt(checkCellNewInnerText));
                            checkCells[ii].setAttribute(ATTR.DATA.CELL_STATE, CELL_STATE.PENCIL);
                        }

                        checkCells[ii].innerText = checkCellNewInnerText;
                    }
                }
            }

            if (selection.cells.length == 1) {
                highlights.forSelected(selection.cells[0]);
                if (selection.cells[0].getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.NORMAL) highlights.updatePencil();
            }

            highlights.updateError();

            if (logAction) log.add(affectedCells, previousValues, newValues, previousTypes, newTypes);
            if (playerInput) checkIfSolvedPuzzle();
        }

        return {
            setCellValue:setCellValue,
            deleteDigit:deleteDigit
        };
    }();

    //  +---------------------+
    //  |      Selection      |
    //  +---------------------+

    var selection = function () {

        var cells = [];
        var dragging = false;
        var dragFirstCell = null;

        function remove () {
            cells.forEach((cell) => { cell.removeAttribute(ATTR.DATA.SELECTED); });
            cells.length = 0;
            highlights.remove();
        }

        function select (cell, add=false) {
            if (add) {
                if (cells.length == 1) {
                    highlights.remove();
                    cells[0].setAttribute(ATTR.DATA.SELECTED, SELECTION.MULTI);
                }
                if (cells.indexOf(cell) >= 0) return;
                cell.setAttribute(ATTR.DATA.SELECTED, SELECTION.MULTI);
                cells.push(cell);
            } else {
                remove();
                cell.setAttribute(ATTR.DATA.SELECTED, SELECTION.SINGLE);
                cells.push(cell);
                highlights.forSelected(cell);
                highlights.updatePencil();
            }
        }

        function setValue (value) {
            actions.setCellValue(cells.slice(0), value, true, true);
        }

        return {cells:cells, dragging:dragging, dragFirstCell:dragFirstCell, remove:remove, select:select, setValue:setValue};
    }();

    //  +-----------------+
    //  |      Arrow      |
    //  +-----------------+

    var arrow = function () {

        var cell = null;

        function remove () {
            if (cell == null) return;
            cell.removeAttribute(CELL_ATTR.ARROW_HIGHLIGHT);
            cell = null;
        }

        function move (x=0, y=0) {
            var nx = 0;
            var ny = 0;
            if (selection.cells.length == 0 && cell == null) {
                nx = Math.floor(grid.width / 2);
                ny = Math.floor(grid.height / 2);
            } else {
                if (cell == null) cell = selection.cells[selection.cells.length-1];
                nx = parseInt(cell.getAttribute(ATTR.DATA.CELL_X));
                ny = parseInt(cell.getAttribute(ATTR.DATA.CELL_Y));    
                if (x != 0) nx += x > 0 ? 1 : -1;
                if (y != 0) ny += y > 0 ? 1 : -1;
            }

            if (nx > grid.width-1) nx = 0;
            if (nx < 0) nx = grid.width-1;
            if (ny > grid.height-1) ny = 0;
            if (ny < 0) ny = grid.height-1;
            
            arrow.remove();
            cell = elems.cells[ny * grid.width + nx];
            cell.setAttribute(ATTR.DATA.ARROW_HIGHLIGHT, "");

            if (selection.cells.length >= 0 && KEY_DOWN.SHIFT) selection.set(cell, true);
            else selection.set(cell);
        }

        return {cell:cell, move:move, remove:remove};
    }();

    //  +-----------------+
    //  |      Input      |
    //  +-----------------+

    var input = function () {

        var mouseOverRoot = false;
        var pointerDown = false;

        //document.addEventListener('pointerdown', () => { if (!mouseOverRoot) selection.remove(); });
        if (!isTouch) document.addEventListener('pointerup', (e) => { if (input.mouseOverRoot) onPointerUp(); else selection.remove(); });
        else document.addEventListener('touchend', (e) => { if (input.mouseOverRoot) onPointerUp(); else selection.remove(); });

        function addEvent(element, eventName, callback) {
            if (element.addEventListener) element.addEventListener(eventName, callback, false);
            else if (element.attachEvent) element.attachEvent("on" + eventName, callback);
            else element["on" + eventName] = callback;
        }

        addEvent(document, "keypress", function (e) {
            e = e || window.event;
            if (e.keyCode >= 49 && e.keyCode <= 57) { // Nums [0-9]
                var after = e.keyCode - 49;
                if (elems.containerBottomElems.bottom.buttons[after].hasAttribute(ATTR.DATA.BUTTON_STATE)) return;
                selection.setValue(grid.possibleValues[after]);
            }
        });

        addEvent(document, "keydown", function (e) {
            e = e || window.event;
            switch (e.key) {
                case "Delete": 
                case "Backspace": actions.deleteDigit(true, true); break;
                case "p": pencil.toggle(); break;
                case "r": reset(); break;
                case "z": if (KEY_DOWN.CTRL) log.undo(); break;
                case "y": if (KEY_DOWN.CTRL) log.redo(); break;
                case "Tab": KEY_DOWN.TAB = true; break;
                case "Control": KEY_DOWN.CTRL = true; break;
                case "Shift": KEY_DOWN.SHIFT = true; break;
                default:
            }
            switch (e.keyCode) {
                case 37: arrow.move(-1, 0); break;
                case 38: arrow.move(0, -1); break;
                case 39: arrow.move(1, 0); break;
                case 40: arrow.move(0, 1); break;
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

        function onPointerUp () {
            pointerDown = false;
            selection.dragging = false;
            selection.dragFirstCell = null;
        }

        function onOverCell (cell) {
            if (!selection.dragging && selection.dragFirstCell != cell && pointerDown) {
                selection.dragging = true;
                selection.dragFirstCell = null;
                selection.select(cell, true);
            } else if (selection.dragging) {
                selection.select(cell, true);
            }
        }

        function onPointerDown (cell) {
            pointerDown = true;
            arrow.remove();
            selection.select(cell);
            selection.dragFirstCell = cell;
        }

        return {addEvent:addEvent, onOverCell:onOverCell, onPointerDown:onPointerDown, mouseOverRoot:mouseOverRoot};
    }();

    //  +----------------------+
    //  |      Highlights      |
    //  +----------------------+

    var highlights = function () {

        function remove () {
            for (var i=0, j=elems.cells.length; i<j; i++) {
                elems.cells[i].removeAttribute(ATTR.DATA.HIGHLIGHT);
                elems.cells[i].removeAttribute(ATTR.DATA.DIGIT_HIGHLIGHT);
            }
        }

        function updatePencil () {

            document.querySelectorAll(`[${ATTR.DATA.CELL_STATE}=${CELL_STATE.PENCIL}]`).forEach((cell) => {
                cell.innerText = cell.getAttribute(ATTR.DATA.CELL_VALUE);
            });

            // Update highlights
            if (selection.cells.length == 1 && (selection.cells[0].getAttribute(ATTR.DATA.CELL_STATE) != CELL_STATE.NORMAL && selection.cells[0].getAttribute(ATTR.DATA.CELL_STATE) != CELL_STATE.CLUE)) return;
            if (selection.cells[0] == undefined) return;
            for (var i=0, j=elems.cells.length; i<j; i++) {
                if (elems.cells[i].getAttribute(ATTR.DATA.CELL_STATE) != CELL_STATE.PENCIL) continue;
                var cell = elems.cells[i];
                console.log("Checking pencil cell...");
                var cellValue = "" + String(cell.getAttribute(ATTR.DATA.CELL_VALUE));
                var selectedValue = "" + String(selection.cells[0].getAttribute(ATTR.DATA.CELL_VALUE));
                if (cellValue.indexOf(selectedValue) >= 0) {
                    console.log("Cell has selected value!!");
                    console.log("Found value " + selectedValue + " inside " + cellValue);

                    cell.innerHTML = "";

                    var tempSpanLow = document.createElement("span");
                    tempSpanLow.setAttribute(ATTR.DATA.PENCIL_HIGHLIGHT, "");

                    var tempSpanHigh = document.createElement("span");
                    tempSpanHigh.setAttribute(ATTR.DATA.PENCIL_HIGHLIGHT_DIGIT, "");
                    tempSpanHigh.innerText = selectedValue;

                    var splitValue = cellValue.split("");
                    for (var ii=0, jj=splitValue.length; ii<jj; ii++) {
                        if (splitValue[ii] == selectedValue) {
                            if (tempSpanLow.innerText != "") cell.append(tempSpanLow);
                            tempSpanLow = document.createElement("span");
                            tempSpanLow.setAttribute(ATTR.DATA.PENCIL_HIGHLIGHT, "");
                            cell.append(tempSpanHigh);
                        } else {
                            tempSpanLow.append(splitValue[ii]);
                        }
                    }

                    if (tempSpanLow.innerText != "") cell.append(tempSpanLow);
                }
            }
        }

        function forSelected (cell) {
            remove();

            var cellType = cell.getAttribute(ATTR.DATA.CELL_STATE);
            if (cell.getAttribute(ATTR.DATA.CELL_VALUE) == grid.emptyValue || cellType == CELL_STATE.PENCIL) return;
            
            var cellX = parseInt(cell.getAttribute(ATTR.DATA.CELL_X));
            var cellY = parseInt(cell.getAttribute(ATTR.DATA.CELL_Y));

            for (var x=0, xl=grid.width; x<xl; x++) {
                if (x == cellX) continue;
                elems.cells[cellY * grid.width + x].setAttribute(ATTR.DATA.HIGHLIGHT, "");
            }

            for (var y=0, yl=grid.height; y<yl; y++) {
                if (y == cellY) continue;
                elems.cells[y * grid.width + cellX].setAttribute(ATTR.DATA.HIGHLIGHT, "");
            }

            var groupX = Math.floor(cellX/grid.groupWidth) * grid.groupWidth;
            var groupY = Math.floor(cellY/grid.groupHeight) * grid.groupHeight;

            for (var x=0, xl=grid.groupWidth; x<xl; x++) {
                for (var y=0, yl=grid.groupHeight; y<yl; y++) {
                    if (cellX == groupX + x && cellY == groupY + y) continue;
                    elems.cells[(groupY + y) * grid.width + groupX + x].setAttribute(ATTR.DATA.HIGHLIGHT, "");
                }
            }

            // Highlight digits
            if (cell.getAttribute(ATTR.DATA.CELL_VALUE) != 0 && cell.getAttribute(ATTR.DATA.CELL_STATE) != CELL_STATE.PENCIL) {
                var value = cell.getAttribute(ATTR.DATA.CELL_VALUE);
                for (var i=0, j=elems.cells.length; i<j; i++) {
                    var tempCell = elems.cells[i];
                    if (tempCell == cell) continue;
                    if (tempCell.getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.PENCIL) continue;
                    if (tempCell.getAttribute(ATTR.DATA.CELL_VALUE) == value) {
                        tempCell.setAttribute(ATTR.DATA.DIGIT_HIGHLIGHT, "");
                    }
                }
            }
        }

        function updateError () {

            document.querySelectorAll('[' + ATTR.DATA.ERROR + ']').forEach((value, key, parent) => { 
                value.removeAttribute(ATTR.DATA.ERROR);
            });

            var groups = []; // rows = [], columns = [];
            var rows = [];
            var columns = [];

            // Check conflicting cells
            for (var i=0, j=grid.possibleValues.length; i<j; i++) {
                var checkCells = document.querySelectorAll('[' + ATTR.DATA.CELL_VALUE + '="' + grid.possibleValues[i] + '"]');
                for (var i0 = 0, j0 = checkCells.length; i0 < j0; i0++) {
                    if (checkCells[i0].getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.PENCIL) continue;
                    for (var i1 = 0, j1 = checkCells.length; i1 < j1; i1++) {
                        if (checkCells[i1].getAttribute(ATTR.DATA.CELL_STATE) == CELL_STATE.PENCIL) continue;
                        if (i0 == i1) continue;
                        var cell0 = checkCells.item(i0);
                        var cell1 = checkCells.item(i1);

                        if ((cell0.getAttribute(ATTR.DATA.CELL_X) == cell1.getAttribute(ATTR.DATA.CELL_X))) {
                            if (columns.indexOf(cell0.getAttribute(ATTR.DATA.CELL_X)) < 0) columns.push(cell0.getAttribute(ATTR.DATA.CELL_X));
                            cell0.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                            cell1.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                        }
                        if ((cell0.getAttribute(ATTR.DATA.CELL_Y) == cell1.getAttribute(ATTR.DATA.CELL_Y))) {
                            if (rows.indexOf(cell0.getAttribute(ATTR.DATA.CELL_Y)) < 0) rows.push(cell0.getAttribute(ATTR.DATA.CELL_Y));
                            cell0.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                            cell1.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                        }
                        if ((cell0.getAttribute(ATTR.DATA.CELL_GROUP_INDEX) == cell1.getAttribute(ATTR.DATA.CELL_GROUP_INDEX))) {
                            if (groups.indexOf(cell0.getAttribute(ATTR.DATA.CELL_GROUP_INDEX)) < 0) groups.push(cell0.getAttribute(ATTR.DATA.CELL_GROUP_INDEX));
                            cell0.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                            cell1.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                        }
                    }
                }
            }

            // Highlight groups
            for (var i=0, j=groups.length; i<j; i++) {
                var groupIndex = parseInt(groups[i]);

                var groupX = (groupIndex % grid.groupsX) * grid.groupWidth;
                var groupY = Math.floor(groupIndex / grid.groupsX) * grid.groupHeight;

                for (var x=0, xl=grid.groupWidth; x<xl; x++) {
                    for (var y=0, yl=grid.groupHeight; y<yl; y++) {
                        //let checkCell = getCellAt(groupX + x, groupY + y);
                        var checkCell = elems.cells[(groupY + y) * grid.width + groupX + x];
                        if (!checkCell.hasAttribute(ATTR.DATA.ERROR)) checkCell.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.CELL);
                    }
                }
            }

            // Highlight rows
            for (var i=0, j=rows.length; i<j; i++) {
                var rowIndex = parseInt(rows[i]);
                for (var x=0, xl=grid.width; x<xl; x++) {
                    //let checkCell = getCellAt(x, rowIndex);
                    var checkCell = elems.cells[rowIndex * grid.width + x];
                    if (!checkCell.hasAttribute(ATTR.DATA.ERROR)) checkCell.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.CELL);
                }
            }

            // Highlight rows
            for (var i=0, j=columns.length; i<j; i++) {
                var columnIndex = parseInt(columns[i]);
                for (var y=0, yl=grid.height; y<yl; y++) {
                    //let checkCell = getCellAt(columnIndex, y);
                    var checkCell = elems.cells[y * grid.width + columnIndex];
                    if (!checkCell.hasAttribute(ATTR.DATA.ERROR)) checkCell.setAttribute(ATTR.DATA.ERROR, CELL_ERROR.CELL);
                }
            }

            //console.log("NUMBER OF CONFLICTING CELLS: " + cellsConflicting.length);

            for (var i=0, j=grid.possibleValues.length; i<j; i++) {
                var checkValue = grid.possibleValues[i];
                var gridIndexes = [];
                var errorNums = [];
                document.querySelectorAll('[' + ATTR.DATA.CELL_VALUE + '="' + String(checkValue) + '"]').forEach((value, key, parent) => {
                    var tempGridIndex = value.getAttribute(ATTR.DATA.CELL_GROUP_INDEX);
                    if (value.getAttribute(ATTR.DATA.CELL_STATE) != CELL_STATE.PENCIL) {
                        if (gridIndexes.indexOf(tempGridIndex) < 0) gridIndexes.push(tempGridIndex);
                        if (value.hasAttribute("data-sudoku-cell-error") && value.getAttribute("data-sudoku-cell-error") == "digit") errorNums.push(value);
                    }
                });
                if (gridIndexes.length > grid.groupsTotal-1 && errorNums.length == 0) {
                    elems.containerBottomElems.bottom.buttons[grid.possibleValues.indexOf(checkValue)].setAttribute("data-sudoku-button-state", "disabled");
                } else {
                    elems.containerBottomElems.bottom.buttons[grid.possibleValues.indexOf(checkValue)].removeAttribute("data-sudoku-button-state");
                }
            }
        }

        return {remove:remove, updatePencil:updatePencil, forSelected:forSelected, updateError:updateError};
    }();

    //  +------------------+
    //  |      Logger      |
    //  +------------------+

    var log = function () {

        var historyCurrentIndex = -1;
        var history = [];

        function reset () {
            history = [];
            historyCurrentIndex = -1;
        }

        function getCurrent () { return historyCurrentIndex > -1 ? history[historyCurrentIndex+1] : null; }

        function add (cells, valuesBefore, valuesAfter, typesBefore, typesAfter) {
            var historyArray = [];

            if (!Array.isArray(cells)) cells = [cells];
            if (!Array.isArray(valuesBefore)) valuesBefore = [valuesBefore];
            if (!Array.isArray(valuesAfter)) valuesAfter = [valuesAfter];
            if (!Array.isArray(typesBefore)) typesBefore = [typesBefore];
            if (!Array.isArray(typesAfter)) typesAfter = [typesAfter];

            for (var i=0, j=cells.length; i<j; i++) {
                if (valuesBefore[i] == valuesAfter[i] && typesBefore[i] == typesAfter[i]) continue;
                historyArray.push({cell: cells[i], valueBefore: valuesBefore[i], valueAfter: valuesAfter[i], typeBefore: typesBefore[i], typeAfter: typesAfter[i]});
            }

            if (history.length != 0 && historyCurrentIndex < history.length - 1) {
                history.splice(historyCurrentIndex + 1, history.length - historyCurrentIndex - 1);
            }

            history.push(historyArray);
            historyCurrentIndex = history.length - 1;
        }

        function undo () {
            if (historyCurrentIndex == -1) return;
            
            var action = history[historyCurrentIndex];
            for(var i=0, j=action.length; i<j; i++) {
                actions.setCellValue(action[i].cell, action[i].valueBefore, false, false, action[i].typeBefore);
            }
            historyCurrentIndex--;
        }

        function redo () {
            if (historyCurrentIndex == history.length - 1) return;

            var action = history[historyCurrentIndex + 1];

            historyCurrentIndex++;
            for (let i=0, j=action.length; i<j; i++) {
                actions.setCellValue(action[i].cell, action[i].valueAfter, false, false, action[i].typeAfter);
            }
        }

        return {reset:reset, getCurrent:getCurrent, add:add, undo:undo, redo:redo};
    }();

    //  +------------------+
    //  |      Solver      |
    //  +------------------+

    var solver = function () {

        function solve () {
            // Construct solve grid structure
            var gridArray = []
            for (var i=0, j=elems.cells.length; i<j; i++) {
                var cellStructure = {};
                cellStructure.cell = elems.cells[i];
                cellStructure.value = elems.cells[i].getAttribute(ATTR.DATA.CELL_VALUE);
                cellStructure.possible = [];
                cellStructure.x = parseInt(cellStructure.cell.getAttribute(ATTR.DATA.CELL_X));
                cellStructure.y = parseInt(cellStructure.cell.getAttribute(ATTR.DATA.CELL_Y));
                cellStructure.groupIndex = parseInt(cellStructure.cell.getAttribute(ATTR.DATA.CELL_GROUP_INDEX));
                cellStructure.type = cellStructure.cell.getAttribute(ATTR.DATA.CELL_STATE);
                gridArray.push(cellStructure);
            }

            // Fill possible numbers
            for (var i=0, j=gridArray.length; i<j; i++) {
                var checkCell = gridArray[i];
                if (checkCell.type == CELL_STATE.CLUE || checkCell.value != 0) continue;
                checkCell.possible = solveGetAllowedValues(gridArray, i);
            }

            // Recursive solve
            while (!allCellsFilled(gridArray)) {
                var gotStuck = true;
                for (var i=0, j=gridArray.length; i<j; i++) {
                    if (!gotStuck) continue;

                    var checkCell = gridArray[i];

                    if (checkCell.value == 0 && checkCell.possible.length == 1) {
                        checkCell.value = checkCell.possible[0];
                        checkCell.possible = [];
                        solveUpdateAllowedValues(gridArray, i);
                        gotStuck = false;
                    }

                    if (gotStuck) {
                        for (var checkValueIndex=0, checkValueMax=checkCell.possible.length; checkValueIndex<checkValueMax; checkValueIndex++) {
                            if (gotStuck) continue;
                            var checkValue = checkCell.possible[checkValueIndex];
                            if (solveOnlyPossible(gridArray, i, checkValue)) {
                                checkCell.value = checkValue;
                                checkCell.possible = [];
                                solveUpdateAllowedValues(gridArray, i);
                                gotStuck = false;
                            }
                        }
                    }
                }
                if (gotStuck) {
                    alert("Got stuck in recursive loop for solver...");
                    break;
                }
            }

            // Fill solved grid
            for (var i=0, j=gridArray.length; i<j; i++) {
                if (gridArray[i].type == CELL_STATE.CLUE) continue;
                actions.setCellValue(gridArray[i].cell, gridArray[i].value, false, false, CELL_STATE.NORMAL);
            }
        }

        function allCellsFilled (grid) {
            for (var x=0, xl=grid.length; x<xl; x++) {
                if (grid[x].type == CELL_STATE.CLUE) continue;
                if (grid[x].possible.length > 0) return false;
            }
            return true;
        }

        function solveGetAllowedValues (someGrid, index) {
            var cellData = someGrid[index];
            var allowedValues = grid.possibleValues.slice(0);

            // Check Vertical
            for (var y=0, yl=grid.height; y<yl; y++) {
                var checkCell = someGrid[y * grid.width + cellData.x];
                if (checkCell.value == grid.emptyValue) continue;
                if (allowedValues.indexOf(checkCell.value) >= 0) {
                    allowedValues.splice(allowedValues.indexOf(checkCell.value), 1);
                }
            }

            // Check Horizontal
            for (var x=0, xl=grid.width; x<xl; x++) {
                var checkCell = someGrid[cellData.y * grid.width + x];
                if (checkCell.value == grid.emptyValue) continue;
                if (allowedValues.indexOf(checkCell.value) >= 0) {
                    allowedValues.splice(allowedValues.indexOf(checkCell.value), 1);
                }
            }

            // Check Group
            var groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
            var groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

            for (var x=0, xl=grid.groupWidth; x<xl; x++) {
                for (var y=0, yl=grid.groupHeight; y<yl; y++) {
                    var checkCell = someGrid[(groupY + y) * grid.width + groupX + x];
                    if (checkCell.value == grid.emptyValue) continue;
                    if (allowedValues.indexOf(checkCell.value) >= 0) {
                        allowedValues.splice(allowedValues.indexOf(checkCell.value), 1);
                    }
                }
            }

            return allowedValues;
        }

        function solveOnlyPossible (someGrid, index, value) {
            var cellData = someGrid[index];

            var onlyPossible = true;

            // Check rows
            for (var x=0, xl=grid.width; x<xl; x++) {
                var checkCell = someGrid[cellData.y * grid.width + x];
                if (checkCell.type == CELL_STATE.CLUE || checkCell == cellData || checkCell.value != grid.emptyValue) continue;
                if (checkCell.possible.indexOf(value) >= 0) onlyPossible = false;
            }

            if (onlyPossible) return true;
            onlyPossible = true;

            // Check columns
            for (var y=0, yl=grid.height; y<yl; y++) {
                var checkCell = someGrid[y * grid.width + cellData.x];
                if (checkCell.type == CELL_STATE.CLUE || checkCell == cellData || checkCell.value != grid.emptyValue) continue;
                if (checkCell.possible.indexOf(value) >= 0) onlyPossible = false;
            }

            if (onlyPossible) return true;
            onlyPossible = true;

            // Check group
            var groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
            var groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

            for (var x=0, xl=grid.groupWidth; x<xl; x++) {
                for (var y=0, yl=grid.groupHeight; y<yl; y++) {
                    var checkCell = someGrid[(groupY + y) * grid.width + groupX + x];
                    if (checkCell.type == CELL_STATE.CLUE || checkCell == cellData || checkCell.value != grid.emptyValue) continue;
                    if (checkCell.possible.indexOf(value) >= 0) onlyPossible = false;
                }
            }

            return onlyPossible;
        }

        function solveUpdateAllowedValues (someGrid, index) {
            var cellData = someGrid[index];

            // Check Vertical
            for(var y=0, yl=grid.height; y<yl; y++) {
                var checkCell = someGrid[y * grid.width + cellData.x];
                if (checkCell.value != grid.emptyValue) continue;
                if (checkCell.possible.indexOf(cellData.value) >= 0) {
                    checkCell.possible.splice(checkCell.possible.indexOf(cellData.value), 1);
                }
            }

            // Check Horizontal
            for(var x=0, xl=grid.width; x<xl; x++) {
                var checkCell = someGrid[cellData.y * grid.width + x];
                if (checkCell.value != grid.emptyValue) continue;
                if (checkCell.possible.indexOf(cellData.value) >= 0) {
                    checkCell.possible.splice(checkCell.possible.indexOf(cellData.value), 1);
                }
            }

            // Check Group
            var groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
            var groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

            for(var x=0, xl=grid.groupWidth; x<xl; x++) {
                for(var y=0, yl=grid.groupHeight; y<yl; y++) {
                    var checkCell = someGrid[(groupY + y) * grid.width + groupX + x];
                    if (checkCell.value != grid.emptyValue) continue;
                    if (checkCell.possible.indexOf(cellData.value) >= 0) {
                        checkCell.possible.splice(checkCell.possible.indexOf(cellData.value), 1);
                    }
                }
            }
        }

        return {
            solve:solve
        };
    }();

    //  +--------------------+
    //  |      Generate      |
    //  +--------------------+

    var generate = function () {

        function uniqueFilled () {

            // Create temp grid
            var tempGrid = [];
            for (var i=0, j=grid.cellsTotal; i<j; i++) tempGrid.push(grid.emptyValue);

            // Error variables for tracking failures...
            var error = {
                indexCounter : 0,
                maxIndexes : 9,
                lineCounter : 0,
                maxLines : 20,
                resetCounter : 0,
                maxResets : 500,

                totalIndexes : 0,
                totalLines : 0,
                totalResets : 0
            }

            // Loop to fill grid
            GridLoop:
            while (tempGrid.indexOf(grid.emptyValue) >= 0) {

                // Find cell index with unset value
                var cellIndex = -1;
                for (var i=0, j=tempGrid.length; i<j; i++) {
                    if (tempGrid[i] == grid.emptyValue) {
                        cellIndex = i;
                        break;
                    }
                }

                // Check if found cellIndex
                if (cellIndex == -1) {
                    error.indexCounter++;
                    continue GridLoop;
                }

                // Check if any value is allowed, in random order
                var allowedValue = -1;
                var possibleValues = grid.possibleValues.slice(0);
                var checkNearIndexes = [];

                var cellIndexX = cellIndex % grid.width;
                var cellIndexY = Math.floor(cellIndex / grid.width);
                var groupIndexX = Math.floor(cellIndexX / grid.groupWidth) * grid.groupWidth;
                var groupIndexY = Math.floor(cellIndexY / grid.groupHeight) * grid.groupHeight;

                var checkValueIndex = 0;
                var checkValue = 0;

                ValueLoop: 
                while(possibleValues.length > 0) {

                    // Reset allowedValue
                    checkNearIndexes.length = 0;

                    // Store individual check value from remaining list
                    checkValueIndex = possibleValues.length == 1 ? 0 : Math.round(Math.random()*(possibleValues.length-1));
                    checkValue = possibleValues.splice(checkValueIndex, 1)[0];

                    // Row
                    for (var i=cellIndexY*grid.width, j=cellIndexY*grid.width+grid.width; i<j; i++) {
                        if (i != cellIndex && tempGrid[i] == checkValue) continue ValueLoop;
                    }

                    // Column
                    for (var i=cellIndexX, j=grid.height*grid.width+cellIndexX; i<j; i+=grid.width) {
                        if (i != cellIndex && tempGrid[i] == checkValue) continue ValueLoop;
                    }

                    // Group
                    for (var gx=groupIndexX, gxl=groupIndexX+grid.groupWidth; gx<gxl; gx++) { 
                        for (var gy=groupIndexY*grid.width, gyl=(groupIndexY+grid.groupHeight)*grid.width; gy<gyl; gy+=grid.width) {
                            if (gy + gx != cellIndex && tempGrid[gy + gx] == checkValue) continue ValueLoop;
                        }
                    }

                    // Value is allowed, store it and continue
                    allowedValue = checkValue;
                    break ValueLoop;
                }

                // Set value and continue..
                if (allowedValue != -1) {
                    tempGrid[cellIndex] = allowedValue;
                    error.indexCounter = 0;
                } else { // If no allowed value were found, continue
                    if (error.indexCounter >= error.maxIndexes) {
                        if (error.lineCounter >= error.maxLines) {
                            if (error.resetCounter < error.maxResets) {
                                error.resetCounter++; error.totalResets++;
                                error.lineCounter = 0; error.indexCounter = 0;
                                for (var ri=0, ril=tempGrid.length; ri<ril; ri++) tempGrid[ri] = grid.emptyValue;
                            } else break;
                        } else {
                            error.lineCounter++; error.totalLines++;
                            error.indexCounter = 0;
                            var resetPoint = Math.floor((tempGrid.indexOf(grid.emptyValue) - 1) / grid.width) * grid.width;
                            for (var i=resetPoint, j=tempGrid.length; i<j; i++) tempGrid[i] = grid.emptyValue;
                        }
                    } else {
                        error.totalIndexes++;
                        error.indexCounter++;
                    }
                }
            }

            if (error.resetCounter >= error.maxResets) {
                alert("Stopped generating grid, too many failed attempts...");
                return null;
            }

            return tempGrid;
        }

        function newPuzzle (numsToRemove=50) {

            // Prepare grid
            var workingGrid = uniqueFilled();
            var tempGrid = workingGrid.slice(0);

            var removeGoal = numsToRemove;
            var removeCount = 0;
            var attempts = [];
            var changeData = [];
            var onBestAttempt = false;

            var error = {
                indexCount : 0,
                maxIndexes : grid.possibleValues.length,
                resetCount : 0,
                maxResets : 200
            }

            while (removeCount < removeGoal) {
                
                // Find random index
                var workingIndex = -1;
                while (workingIndex == -1) {
                    var checkIndex = Math.floor(Math.random() * tempGrid.length );
                    if (checkIndex == tempGrid.length) checkIndex--;
                    if (tempGrid[checkIndex] != grid.emptyValue) workingIndex = checkIndex;
                }

                // Remove digit and check
                changeData.push({index:workingIndex, value:tempGrid[workingIndex]});
                tempGrid[workingIndex] = grid.emptyValue;
                removeCount++;
                if (!hasSingleUniqueSolution(tempGrid)) {
                    tempGrid[changeData[changeData.length-1]] = changeData[changeData.length-1].value;
                    removeCount--;
                    changeData.length--;
                    if (error.indexCount >= error.maxIndexes) {
                        if (error.resetCount >= error.maxResets) {
                            changeData = attempts[0];
                            for (var i=0, j=attempts.length; i<j; i++) if (changeData.length < attempts[i].length) changeData = attempts[i];
                            if (changeData.length < removeGoal-10 || changeData.length == 0) {
                                tempGrid = workingGrid.slice(0);
                                attempts = [];
                                changeData = [];
                                removeCount = 0;
                                error.resetCount = 0;
                                error.indexCount = 0;
                            } else break;
                        } else {
                            tempGrid = workingGrid.slice(0);
                            attempts.push(changeData);
                            changeData = [];
                            removeCount = 0;
                            error.resetCount++;
                            error.indexCount = 0;
                        }
                    } else {
                        error.indexCount++;
                    }
                }
            }

            for (var i=0, j=changeData.length; i<j; i++) workingGrid[changeData[i].index] = grid.emptyValue;
            console.log(`Initializing best puzzle of ${changeData.length}/${removeGoal} removed digits...`);
            initPuzzle(workingGrid);
        }

        function hasSingleUniqueSolution (checkGrid) {
            var testGrid = checkGrid.slice(0);

            // Set 0s to arrays of possible values
            for (var i=0, j=testGrid.length; i<j; i++) {
                if (testGrid[i] == grid.emptyValue) testGrid[i] = getPossibleValuesOf(i, testGrid);
            }

            var indexFound = -1;

            // Loop until stuck or solved
            while (!isGridSolved(testGrid)) {
                
                // Find grid index with array of length == 1
                indexFound = -1;
                for (var i=0, j=testGrid.length; i<j; i++) {
                    if (Array.isArray(testGrid[i]) && testGrid[i].length == 1) {
                        indexFound = i;
                        break;
                    }
                }

                // Check if found no index, return false
                if (indexFound == -1) return false;

                // Set value and remove pencils of affected cells
                testGrid[indexFound] = testGrid[indexFound][0];
                getPencilAffectedOf(indexFound, testGrid).forEach((value, key, parent) => {
                    if (testGrid[value].indexOf(testGrid[indexFound]) >= 0) {
                        testGrid[value].splice(testGrid[value].indexOf(testGrid[indexFound]), 1);
                    }
                });
            }
            return true;
        }

        function getAllAffectedValues (sourceIndex, sourceGrid) {
            var returnArray = [];
            var xIndex = sourceIndex % grid.width;
            var yIndex = Math.floor(sourceIndex / grid.width);
            var xGroup = Math.floor(xIndex / grid.groupWidth) * grid.groupWidth;
            var yGroup = Math.floor(yIndex / grid.groupHeight) * grid.groupHeight;

            // Get column
            for (var i=xIndex, j=xIndex+grid.height*grid.width; i<j; i+=grid.width) {
                if (i != sourceIndex && !Array.isArray(sourceGrid[i]) && returnArray.indexOf(sourceGrid[i]) < 0) returnArray.push(sourceGrid[i]);
            }

            // Get row
            for (var i=yIndex*grid.width, j=yIndex*grid.width+grid.width; i<j; i++) {
                if (i != sourceIndex && !Array.isArray(sourceGrid[i]) && returnArray.indexOf(sourceGrid[i]) < 0) returnArray.push(sourceGrid[i]);
            }

            // Get group
            for (var gx=xGroup, gxl=xGroup+grid.groupWidth; gx<gxl; gx++) {
                for (var gy=yGroup*grid.width, gyl=(yGroup+grid.groupHeight)*grid.width; gy<gyl; gy+=grid.width) {
                    if (gy+gx != sourceIndex && !Array.isArray(sourceGrid[gy+gx]) && returnArray.indexOf(sourceGrid[gy+gx]) < 0) returnArray.push(sourceGrid[gy+gx]);
                }
            }

            // Return all indexes
            return returnArray;
        }

        function getPossibleValuesOf (sourceIndex, sourceGrid) {
            var returnArray = grid.possibleValues.slice(0);
            var affectedValues = getAllAffectedValues(sourceIndex, sourceGrid);
            for (var i=0, j=affectedValues.length; i<j; i++) {
                if (returnArray.indexOf(affectedValues[i]) >= 0) returnArray.splice(returnArray.indexOf(affectedValues[i]), 1);
            }
            return returnArray;
        }

        function getPencilAffectedOf (sourceIndex, sourceGrid) {
            var returnArray = [];
            var xIndex = sourceIndex % grid.width;
            var yIndex = Math.floor(sourceIndex / grid.width);
            var xGroup = Math.floor(xIndex / grid.groupWidth) * grid.groupWidth;
            var yGroup = Math.floor(yIndex / grid.groupHeight) * grid.groupHeight;

            // Get column
            for (var i=xIndex, j=grid.height*grid.width+xIndex; i<j; i+=grid.width) {
                if (i != sourceIndex && Array.isArray(sourceGrid[i]) && returnArray.indexOf(i) < 0) returnArray.push(i);
            }

            // Get row
            for (var i=yIndex*grid.width, j=yIndex*grid.width+grid.width; i<j; i++) {
                if (i != sourceIndex && Array.isArray(sourceGrid[i]) && returnArray.indexOf(i) < 0) returnArray.push(i);
            }

            // Get group
            for (var gx=xGroup, gxl=xGroup+grid.groupWidth; gx<gxl; gx++) {
                for (var gy=yGroup*grid.Width, gyl=(yGroup+grid.groupHeight)*grid.width; gy<gyl; gy+=grid.width) {
                    if (gy+gx != sourceIndex && Array.isArray(sourceGrid[gy+gx]) && returnArray.indexOf(gy+gx) < 0) returnArray.push(gy+gx);
                }
            }

            return returnArray;
        }

        function isGridSolved (sourceGrid) {
            if (sourceGrid.indexOf(grid.emptyValue) >= 0) return false;
            for (var i=0, j=sourceGrid.length; i<j; i++) if (Array.isArray(sourceGrid[i])) return false;
            return true;
        }

        return {
            newPuzzle:newPuzzle
        };
    }();

    //  +-------------------+
    //  |      Builder      |
    //  +-------------------+

    var builder = function () {
    
        function SudokuElems (docRoot) {
            // DocRoot: If no given docRoot, create one and add it to the body
            if (!docRoot) docRoot = document.getElementById(ATTR.ID.DOC_ROOT);
            if (!docRoot) docRoot = buildElement('div', null, null, null, null, document.body);
            this.docRoot = docRoot;
    
            // Root
            this.root = buildElement('div', ATTR.ID.ROOT, null, null, null, this.docRoot);
            if (!debugging || true) this.root.oncontextmenu = (e) => { return false; }
            this.root.addEventListener('pointerover', (e) => { input.mouseOverRoot = true; });
            this.root.addEventListener('pointerout', (e) => { input.mouseOverRoot = false; });
    
            // Containers
            this.containerTop = buildElement('div', ATTR.ID.CONTAINER_TOP, null, null, null, this.root);
            this.containerGrid = buildElement('div', ATTR.ID.CONTAINER_GRID, null, null, null, this.root);
            this.containerBottom = buildElement('div', ATTR.ID.CONTAINER_BOTTOM, null, null, null, this.root);
    
            // Build containers
            ContainerTop.call(this);
            ContainerGrid.call(this);
            ContainerBottom.call(this);
        }
    
        function ContainerTop () {
            this.containerTopElems = {
                top : {}, bottom : {},
                topContainer : buildElement('div', 'sudoku-container-top-top', null, null, null, this.containerTop),
                bottomContainer :  buildElement('div', 'sudoku-container-top-bottom', null, null, null, this.containerTop)
            };
    
            // Logo
            this.containerTopElems.top.logo = buildElement('span', ATTR.ID.LOGO, null, 'Sudoku', null, this.containerTopElems.topContainer);
    
            // Pause Button
            this.containerTopElems.top.pauseButton = buildButton('span', ATTR.ID.BTN_PAUSE, null, null, (e) => { clock.pause(); }, this.containerTopElems.topContainer)
            this.containerTopElems.top.pauseIcon = buildImage('img', ATTR.ID.BTN_PAUSE_ICON, null, ATTR.SRC.SVG.UNPAUSED, this.containerTopElems.top.pauseButton);
    
            // Action buttons
            this.containerTopElems.bottom.buttonContainer = buildElement('span', ATTR.ID.BTN_CONTAINER_CORE, null, null, null, this.containerTopElems.bottomContainer);
            this.containerTopElems.bottom.buttons = {};
            this.containerTopElems.bottom.buttons.newSample = buildButton('button', ATTR.ID.BTN_NEW_SAMPLE, ATTR.CLASS.BTNS_CORE, "New Sample", (e) => { initPuzzle(samplePuzzles.easy[0]); }, this.containerTopElems.bottom.buttonContainer);
            this.containerTopElems.bottom.buttons.reset = buildButton('button', ATTR.ID.BTN_RESET, ATTR.CLASS.BTNS_CORE, "Reset", (e) => { reset(); }, this.containerTopElems.bottom.buttonContainer);
            this.containerTopElems.bottom.buttons.solve = buildButton('button', ATTR.ID.BTN_SOLVE, ATTR.CLASS.BTNS_CORE, "Solve", (e) => { solver.solve(); }, this.containerTopElems.bottom.buttonContainer);
            this.containerTopElems.bottom.buttons.createPuzzle = buildButton('button', ATTR.ID.BTN_CREATE_PUZZLE, ATTR.CLASS.BTNS_CORE, "Create Puzzle", (e) => { generate.newPuzzle(); }, this.containerTopElems.bottom.buttonContainer);
        
            // Clock
            this.containerTopElems.bottom.clockContainer = buildElement('span', ATTR.ID.CLOCK_ROOT, null, null, null, this.containerTopElems.bottomContainer);
            clockInit(this.containerTopElems.bottom.clockContainer, false);
        }
    
        function ContainerGrid () {
            this.containerGridElems = {};
    
            // Table
            this.containerGridElems.table = buildElement('table', ATTR.ID.TABLE, null, null, null, this.containerGrid);
            if (isTouch) {
                this.containerGridElems.table.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    var elements = document.elementsFromPoint(e.touches.item(0).clientX, e.touches.item(0).clientY);
                    for (var i=0, j=elements.length; i<j; i++) {
                        if (elements[i].getAttribute('class') == ATTR.CLASS.CELL) {
                            input.onOverCell(elements[i]);
                            return;
                        }
                    }
                });
            }
    
            // Rows
    
            console.log(grid);
            this.containerGridElems.rows = [];
            for (var i=0, j=grid.height; i<j; i++) {
                this.containerGridElems.rows.push(buildElement('tr', null, ATTR.CLASS.ROW, null, null, this.containerGridElems.table));
            }
    
            // Cells
            this.cells = [];
            for (var i=0, j=grid.cellsTotal; i<j; i++) {
                var x = i % grid.width;
                var y = (i / grid.width)|0;
                var g = Math.floor(y / grid.groupHeight) * grid.groupsX + Math.floor(x / grid.groupWidth);
                this.cells.push(buildCell(x, y, g, this.containerGridElems.rows[y]));
            }
        }
    
        function ContainerBottom () {
            this.containerBottomElems = {
                top : {}, bottom : {},
                topContainer : buildElement('div', null, null, null, null, this.containerBottom),
                bottomContainer :  buildElement('div', null, null, null, null, this.containerBottom)
            };
    
            // Button Containers
            this.containerBottomElems.top.buttonContainer = buildElement('span', ATTR.ID.BTN_CONTAINER_ACTIONS, null, null, null, this.containerBottomElems.topContainer);
            this.containerBottomElems.bottom.buttonContainer = buildElement('span', ATTR.ID.BTN_CONTAINER_VALUES, null, null, null, this.containerBottomElems.bottomContainer);
    
            // Action buttons
            this.containerBottomElems.top.buttons = {};
            this.containerBottomElems.top.buttons.undo = buildButtonAction(ATTR.ID.BTN_UNDO, ATTR.CLASS.BTNS_ACTIONS, ATTR.SRC.SVG.UNDO, "Undo", (e) => { log.undo(); }, this.containerBottomElems.top.buttonContainer);
            this.containerBottomElems.top.buttons.redo = buildButtonAction(ATTR.ID.BTN_REDO, ATTR.CLASS.BTNS_ACTIONS, ATTR.SRC.SVG.REDO, "Redo", (e) => { log.redo(); }, this.containerBottomElems.top.buttonContainer);
            this.containerBottomElems.top.buttons.eraser = buildButtonAction(ATTR.ID.BTN_ERASER, ATTR.CLASS.BTNS_ACTIONS, ATTR.SRC.SVG.ERASER, "Delete", (e) => { actions.deleteDigit(true, true); }, this.containerBottomElems.top.buttonContainer);
            this.containerBottomElems.top.buttons.pen = buildButtonAction(ATTR.ID.BTN_PEN, ATTR.CLASS.BTNS_ACTIONS, ATTR.SRC.SVG.PEN_OFF, "Pencil", (e) => { pencil.toggle(); }, this.containerBottomElems.top.buttonContainer);
            this.containerBottomElems.top.buttons.hint = buildButtonAction(ATTR.ID.BTN_HINT, ATTR.CLASS.BTNS_ACTIONS, ATTR.SRC.SVG.HINT, "Hint", (e) => { /** Hint action... */}, this.containerBottomElems.top.buttonContainer);
            
            // Value buttons
            this.containerBottomElems.bottom.buttons = [];
            for (var i=0, j=grid.possibleValues.length; i<j; i++) {
                this.containerBottomElems.bottom.buttons.push(buildButton('button', null, ATTR.CLASS.BTNS_VALUES, grid.possibleValues[i], null, this.containerBottomElems.bottom.buttonContainer));
                (function (button, value, setValue) {
                    button.addEventListener('click', (e) => {
                        setValue(value);
                    });
                })(this.containerBottomElems.bottom.buttons[i], grid.possibleValues[i], selection.setValue);
            }
        }
    
        /**
         *         HELPER FUNCTIONS
         */
    
    
        function buildElement (type='div', idAttr, classAttr, innerText, innerHTML, parentAppend, parentPrepend, childrenAppend, childrenPrepend) {
            var elem = document.createElement(type);
            if (idAttr) elem.setAttribute('id', idAttr);
            if (classAttr) elem.setAttribute('class', classAttr);
            if (innerText) elem.innerText = innerText;
            if (innerHTML) elem.innerHTML = innerHTML;
            if (parentAppend) parentAppend.append(elem);
            if (parentPrepend) parentPrepend.prepend(elem);
            if (childrenAppend) {
                if (!Array.isArray(childrenAppend)) childrenAppend = [childrenAppend];
                for (var i=0, j=childrenAppend.length; i<j; i++) elem.append(childrenAppend[i]);
            }
            if (childrenPrepend) {
                if (!Array.isArray(childrenPrepend)) childrenPrepend = [childrenPrepend];
                for (var i=0, j=childrenPrepend.length; i<j; i++) elem.prepend(childrenPrepend[i]);
            }
            return elem;
        }
    
        function buildImage (type='img', idAttr, classAttr, srcAttr, parentAppend, parentPrepend) {
            var img = document.createElement(type);
            if (idAttr) img.setAttribute('id', idAttr);
            if (classAttr) img.setAttribute('class', classAttr);
            if (srcAttr) img.setAttribute('src', srcAttr);
            if (parentAppend) parentAppend.append(img);
            if (parentPrepend) parentPrepend.prepend(img);
            return img;
        }
    
    
        function buildButton (type='button', idAttr, classAttr, label, callback, parentAppend, parentPrepend) {
            var btn = document.createElement(type);
            if (idAttr) btn.setAttribute('id', idAttr);
            if (classAttr) btn.setAttribute('class', classAttr);
            if (label) btn.innerText = label;
            if (callback) btn.onclick = callback;
            if (parentAppend) parentAppend.append(btn);
            if (parentPrepend) parentPrepend.prepend(btn);
            return btn;
        }
    
        function buildButtonAction (idAttr, classAttr, srcAttr, label, callback, parentAppend, parentPrepend) {
            var btnDat = {};
            btnDat.root = buildButton('button', idAttr, classAttr, null, callback, parentAppend, parentPrepend);
            if (callback) btnDat.root.onclick = callback;
            btnDat.icon = buildImage('img', null, null, srcAttr, btnDat.root);
            btnDat.label = buildElement('div', null, null, label, null, btnDat.root);
            return btnDat;
        }
    
        function buildCell (x, y, groupIndex, parentRow) {
            var td = buildElement('td', null, ATTR.CLASS.CELL);
            td.setAttribute(ATTR.DATA.CELL_X, x);
            td.setAttribute(ATTR.DATA.CELL_Y, y);
            td.setAttribute(ATTR.DATA.CELL_GROUP_INDEX, groupIndex);
            td.setAttribute(ATTR.DATA.CELL_STATE, CELL_STATE.NORMAL);
            td.setAttribute(ATTR.DATA.CELL_VALUE, grid.emptyValue);

            if (x % grid.groupWidth == grid.groupWidth - 1 && x != grid.width - 1) td.setAttribute(STYLE_ATTR.CELL_BORDER_RIGHT, "");
            if (y % grid.groupHeight == grid.groupHeight - 1 && y != grid.height - 1) td.setAttribute(STYLE_ATTR.CELL_BORDER_BOTTOM, "");
    
            (function (cell, onPointerDown, onOverCell) {
                if (!isTouch) {
                    cell.addEventListener('pointerdown', (e) => {
                        e.preventDefault();
                        onPointerDown(cell);
                    });
                    cell.addEventListener('pointerover', (e) => {
                        e.preventDefault();
                        onOverCell(cell);
                    });
                } else {
                    cell.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        onPointerDown(cell);
                    });
                }
            })(td, input.onPointerDown, input.onOverCell);
    
            parentRow.append(td);
            return td;
        }
    
        return {
            SudokuElems:SudokuElems
        };
    }();

    function removeAllAttributesFromAll () {
        for (let i=0, j=elems.cells.length; i<j; i++) {
            elems.cells[i].removeAttribute(ATTR.DATA.HIGHLIGHT);
            elems.cells[i].removeAttribute(ATTR.DATA.DIGIT_HIGHLIGHT);
            elems.cells[i].setAttribute(ATTR.DATA.CELL_STATE, CELL_STATE.NORMAL);
            elems.cells[i].removeAttribute(ATTR.DATA.ERROR);
        }
    }

    function checkIfSolvedPuzzle () {
        for (var i=0, j=elems.cells.length; i<j; i++) {
            var cellType = elems.cells[i].getAttribute(ATTR.DATA.CELL_STATE);
            if (cellType == CELL_STATE.PENCIL || elems.cells[i].getAttribute(ATTR.DATA.CELL_VALUE) == grid.emptyValue) return;
        }

        if (document.querySelectorAll(`[${ATTR.DATA.ERROR}]`).length > 0) return;

        clock.stop();

        alert("You won!");
    }

    var isPaused = false;

    var clock = {
        start : () => {
            if (isPaused) clock.pause();
            else clockStart();
        },
        pause : () => {
            if (isPaused) {
                isPaused = false;
                elems.containerGridElems.table.removeAttribute("data-puzzle-paused");
                elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.UNPAUSED);
            } else {
                isPaused = true;
                elems.containerGridElems.table.setAttribute("data-puzzle-paused", "");
                elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.PAUSED);
            }
            clockPause();
        },
        reset : () => {
            clockReset();
            isPaused = false;
            elems.containerGridElems.table.removeAttribute("data-puzzle-paused");
            elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.UNPAUSED);
        },
        stop : () => {
            clockPause();
            isPaused = true;
            elems.containerGridElems.table.removeAttribute("data-puzzle-paused");
            elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.UNPAUSED);
        }
    }

    return {
        init:init
    };
}();

sudoku.init();