var sudoku = function () {

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

    var CELL_CHECK = {
        ERROR : 'error'
    }

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
            BTN_CREATE_PUZZLE : 'sudoku-button-create-puzzle',
            BTN_RESTART : 'sudoku-button-restart',
            BTN_SOLVE : 'sudoku-button-solve',
            BTN_CLEAR : 'sudoku-button-clear',
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
            SELECTED : 'data-sudoku-cell-selected',
            CHECK : 'data-sudoku-check'
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

    function CellData (cell, index, x, y, groupIndex, state, value) {
        this.cell = cell;
        this.index = index;
        this.x = x;
        this.y = y;
        this.g = groupIndex;
        var _state = state;
        var _value = value;
        var _data = new Map();

        Object.defineProperty(this, 'state', {
            get () { return _state; },
            set (v) { this.cell.setAttribute(ATTR.DATA.CELL_STATE, v); return _state = v; }
        });
        Object.defineProperty(this, 'value', {
            get () { return _value; },
            set (v) { this.cell.setAttribute(ATTR.DATA.CELL_VALUE, v); this.cell.innerText = v == grid.emptyValue ? "" : v; return _value = v; }
        });

        this.removeData = (dataAttr) => { if (_data.delete(dataAttr)) this.cell.removeAttribute(dataAttr); }
        this.hasData = (dataAttr) => _data.has(dataAttr);
        this.getData = (dataAttr) => _data.get(dataAttr);
        this.setData = (dataAttr, value) => {
            if (_data.get(dataAttr) == value) return;
            this.cell.setAttribute(dataAttr, value);
            _data.set(dataAttr, value);
        }
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
        this.cells = [];
        this.cellMap = new Map();
        this.cellData = [];
        this.cellRow = [];
        this.cellColumn = [];
        this.cellGroup = [];
        this.setCells = (cellArray) => {
            this.cells.length = 0;
            this.cellMap = new Map();
            this.cellData.length = 0;
            this.cellRow.length = 0;
            this.cellColumn.length = 0;
            this.cellGroup.length = 0;
            for (var i=0, j=cellArray.length; i<j; i++) {
                var x = Number(cellArray[i].getAttribute(ATTR.DATA.CELL_X));
                var y = Number(cellArray[i].getAttribute(ATTR.DATA.CELL_Y));
                var g = Number(cellArray[i].getAttribute(ATTR.DATA.CELL_GROUP_INDEX));
                var v = cellArray[i].getAttribute(ATTR.DATA.CELL_VALUE);
                var s = cellArray[i].getAttribute(ATTR.DATA.CELL_STATE);
                this.cells.push(cellArray[i]);
                this.cellMap.set(cellArray[i], new CellData(cellArray[i], i, x, y, g, s, v));
                this.cellData.push(this.cellMap.get(cellArray[i]));
                while (this.cellRow.length < y+1) this.cellRow.push([]);
                while (this.cellColumn.length < x+1) this.cellColumn.push([]);
                while (this.cellGroup.length < g+1) this.cellGroup.push([]);
                this.cellRow[y].push(this.cellData[i]);
                this.cellColumn[x].push(this.cellData[i]);
                this.cellGroup[g].push(this.cellData[i]);
            }
        }
        this.puzzleData = null;
        this.setSize(gridSize);
    }

    var grid = new GridData(GRID_SIZE.NORMAL);
    var elems = null;
    var debugging = false;
    var allowSolve = false;

    function init () {
        isTouch = detectMob();
        if (isTouch) document.head.querySelector('[href="./css/sudoku.css"]').setAttribute("href", "./css/sudoku-mobile.css");
        elems = new builder.SudokuElems(null);
        grid.setCells(elems.cells);
    }

    function reset (playerInput=false) {
        selection.remove();
        pencil.toggle(false);
        elems.containerBottomElems.top.buttons.hint.root.setAttribute(ATTR.DATA.BUTTON_STATE, BUTTON_STATE.DISABLED);
        for (var i=0, j=elems.containerBottomElems.bottom.buttons.length; i<j; i++) {
            elems.containerBottomElems.bottom.buttons[i].removeAttribute("data-sudoku-button-state", "disabled");
        }
        state.reset();
        actions.setCellValue(grid.cellData, grid.emptyValue, false, false, CELL_STATE.NORMAL);
        removeAllAttributesFromAll();
        log.reset();
        arrow.remove();
        if (playerInput) {
            allowSolve = false;
            hints.allow = false;
        }
    }

    var cellTimeouts = [];

    function initPuzzle (generateNew=false) {
        reset();
        if (generateNew) grid.puzzleData = generate.newPuzzle();
        else if (grid.puzzleData == null) return;
        elems.containerBottomElems.top.buttons.hint.root.removeAttribute(ATTR.DATA.BUTTON_STATE);
        while (cellTimeouts.length > 0) clearTimeout(cellTimeouts.splice(0,1)[0]);

        grid.cellData.forEach((cellData) => { cellData.removeData("data-sudoku-cell-start-anim"); });

        var animOffset = 4;
        var animTotal = 4 * 81 + 400;
        cellTimeouts.push(
            setTimeout(function () {
                grid.cellData.forEach((cellData) => { cellData.removeData("data-sudoku-cell-start-anim"); });
                state.start();
                console.log("Started clock...");
            }, animTotal)
        );
        for (var [index, cellData] of grid.cellData.entries()) {
            (function (cellData, value, state, timeout) {
                cellTimeouts.push(
                    setTimeout(function () {
                        cellData.setData("data-sudoku-cell-start-anim", "");
                        actions.setCellValue(cellData, value, false, false, state);
                    }, timeout)
                );
            })(cellData, grid.puzzleData.puzzle[cellData.index], grid.puzzleData.puzzle[cellData.index] == grid.emptyValue ? CELL_STATE.NORMAL : CELL_STATE.CLUE, cellData.index * animOffset);
        }

        allowSolve = true;
        hints.allow = true;
    }

    function restart () {
        if (grid.puzzleData == null) return;
        initPuzzle();
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

    //  +------------------+
    //  |      Pencil      |
    //  +------------------+

    var hints = function () {

        this.allow = false;

        function reveal () {
            if (!this.allow || grid.puzzleData == null) return;
            if (selection.cells.length == 0) revealRandom();
            else if (selection.cells.length == 1) revealSelected();
        }

        function revealSelected () {
            if (selection.cells[0].value != grid.puzzleData.solution[selection.cells[0].index]) {
                actions.setCellValue(selection.cells[0], grid.puzzleData.solution[selection.cells[0].index], false, true, CELL_STATE.NORMAL);
            }
        }

        function revealRandom () {
            var unresolved = [];
            for (var [index, cellData] of grid.cellData.entries()) {
                if (cellData.state != CELL_STATE.PENCIL && cellData.value != grid.emptyValue) unresolved.push(cellData);
            }
            if (unresolved.length == 0) return;
            var index = Math.floor(Math.random()*unresolved.length);
            if (index >= unresolved.length) index = unresolved.length-1;
            actions.setCellValue(unresolved[index], grid.puzzleData.solution[i], false, true, CELL_STATE.NORMAL);
        }

        return {
            allow:allow,
            reveal:reveal
        }
    }();

    //  +-------------------+
    //  |      Actions      |
    //  +-------------------+

    var actions = function () {

        function deleteDigit (playerInput=false, logAction=false) {
            if (selection.cells.length == 0) return;
            actions.setCellValue(selection.cells, grid.emptyValue, playerInput, logAction, CELL_STATE.NORMAL);
        }

        function setCellValue (cells, value, playerInput=false, logAction=false, forcedType=CELL_STATE.NORMAL) {
            if (!Array.isArray(cells)) cells = [cells];

            var affectedCells = [];
            var previousValues = [];
            var previousStates = [];
            var newValues = [];
            var newStates = [];

            // New values
            var newState = forcedType;
            var newValue = value;

            if (pencil.active && playerInput && value != grid.emptyValue) newState = CELL_STATE.PENCIL;
            else if (value != grid.emptyValue && !playerInput && forcedType != CELL_STATE.PENCIL && forcedType != CELL_STATE.CLUE) newState = CELL_STATE.NORMAL;
            else if (value != grid.emptyValue && playerInput && !pencil.active) newState = CELL_STATE.NORMAL;

            for (var [index, cellData] of cells.entries()) {

                // Clue cells can't be manipulated by player, skip
                if (cellData.state == CELL_STATE.CLUE && playerInput) continue;

                // Store affected and previous values
                affectedCells.push(cellData);
                previousValues.push(cellData.value);
                previousStates.push(cellData.state);

                // Temp values prone for manipulation
                var tempNewState = newState;
                var tempNewValue = newValue;

                // If value is 0 or previous value, delete value
                if (tempNewValue == grid.emptyValue || (tempNewValue == cellData.value && cellData.state == tempNewState)) {
                    tempNewState = CELL_STATE.NORMAL;
                    tempNewValue = grid.emptyValue;
                } else {
                    // Check pencil
                    if (tempNewState == CELL_STATE.PENCIL && String(tempNewValue).length > 1) {
                    } else if (tempNewState == CELL_STATE.PENCIL && cellData.state == CELL_STATE.PENCIL) {
                        var valueArray = String(cellData.value).split("");
                        var canPlaceValue = true;
                        var tempText = "";
                        for (var i=0, j=valueArray.length; i<j; i++) {
                            var checkValue = valueArray[i];
                            if (checkValue == tempNewValue) {
                                canPlaceValue = false;
                                continue;
                            }
                            if (grid.possibleValues.indexOf(checkValue) > grid.possibleValues.indexOf(tempNewValue) && canPlaceValue) {
                                tempText += String(tempNewValue);
                                canPlaceValue = false;
                            }
                            tempText += checkValue;
                            if (i == valueArray.length - 1 && canPlaceValue) {
                                tempText += String(tempNewValue);
                            }
                        }
                        tempNewValue = tempText;
                    }
                }

                // Store and apply new values
                newValues.push(tempNewValue);
                newStates.push(tempNewState);
                cellData.value = tempNewValue;
                cellData.state = tempNewState;
                cellData.removeData(ATTR.DATA.CHECK);

                // If applied number, check if pencils should be removed
                if (tempNewState == CELL_STATE.NORMAL && playerInput) {
                    var checkCells = [];
                    
                    grid.cellRow[cellData.y].forEach(fillCheckCells);
                    grid.cellColumn[cellData.x].forEach(fillCheckCells);
                    grid.cellGroup[cellData.g].forEach(fillCheckCells);
                    
                    function fillCheckCells (cd) {
                        if (cd != cellData && cd.state == CELL_STATE.PENCIL && checkCells.indexOf(cd) < 0) checkCells.push(cd);
                    }

                    for (var i=0, j=checkCells.length; i<j; i++) {
                        if (String(checkCells[i].value).indexOf(String(tempNewValue)) < 0) continue;
                        
                        affectedCells.push(checkCells[i]);
                        previousValues.push(checkCells[i].value);
                        previousStates.push(checkCells[i].state);

                        var valueText = String(checkCells[i].value).replace(String(tempNewValue), "");

                        if (String(valueText).length == 0) {
                            newValues.push(grid.emptyValue);
                            newStates.push(CELL_STATE.NORMAL);

                            checkCells[i].value = grid.emptyValue;
                            checkCells[i].state = CELL_STATE.NORMAL;
                        } else {
                            newValues.push(valueText);
                            newStates.push(CELL_STATE.PENCIL);

                            checkCells[i].value = valueText;
                            checkCells[i].state = CELL_STATE.PENCIL;
                        }
                    }
                }
            }

            if (selection.cells.length == 1) {
                highlights.forSelected();
                if (selection.cells[0].state == CELL_STATE.NORMAL) highlights.updatePencil();
            }

            highlights.updateError();

            if (logAction) log.add(affectedCells, previousValues, newValues, previousStates, newStates);
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

        this.cells = [];
        this.dragging = false;
        this.dragFirstCell = null;

        function remove () {
            cells.forEach((cell) => { cell.removeData(ATTR.DATA.SELECTED); });
            cells.length = 0;
            highlights.remove();
        }

        function select (cellData, add=false) {
            if (add) {
                if (cells.length == 1) {
                    highlights.remove();
                    cells[0].setData(ATTR.DATA.SELECTED, SELECTION.MULTI);
                }
                if (cells.indexOf(cellData) >= 0) return;
                cellData.setData(ATTR.DATA.SELECTED, SELECTION.MULTI);
                cells.push(cellData);
            } else {
                remove();
                cellData.setData(ATTR.DATA.SELECTED, SELECTION.SINGLE);
                cells.push(cellData);
                highlights.forSelected();
                highlights.updatePencil();
            }
        }

        function setValue (value) {
            actions.setCellValue(cells, value, true, true);
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
            cell.removeData(ATTR.DATA.ARROW_HIGHLIGHT);
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
                nx = cell.x;
                ny = cell.y;    
                if (x != 0) nx += x > 0 ? 1 : -1;
                if (y != 0) ny += y > 0 ? 1 : -1;
            }

            if (nx > grid.width-1) nx = 0;
            if (nx < 0) nx = grid.width-1;
            if (ny > grid.height-1) ny = 0;
            if (ny < 0) ny = grid.height-1;
            
            arrow.remove();
            cell = grid.cellData[ny * grid.width + nx];
            cell.setData(ATTR.DATA.ARROW_HIGHLIGHT, "");

            if (selection.cells.length >= 0 && KEY_DOWN.SHIFT) selection.select(cell, true);
            else selection.select(cell);
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

        function onOverCell (x, y) {
            var cellData = grid.cellData[y*grid.width+x];
            if (!selection.dragging && selection.dragFirstCell != cellData && pointerDown) {
                selection.dragging = true;
                selection.dragFirstCell = null;
                selection.select(cellData, true);
            } else if (selection.dragging) {
                selection.select(cellData, true);
            }
        }

        function onPointerDown (x, y) {
            var cellData = grid.cellData[y*grid.width+x];
            pointerDown = true;
            arrow.remove();
            selection.select(cellData);
            selection.dragFirstCell = cellData;
        }

        return {addEvent:addEvent, onOverCell:onOverCell, onPointerDown:onPointerDown, mouseOverRoot:mouseOverRoot};
    }();

    //  +-------------------+
    //  |      Checker      |
    //  +-------------------+

    var checker = function () {

        function check () {
            if (grid.puzzleData == null) return;

            for (var i=0, j=grid.puzzleData.solution.length; i<j; i++) {
                if (grid.cellData[i].value != grid.emptyValue && grid.cellData[i].state != CELL_STATE.PENCIL && grid.cellData[i].value != grid.puzzleData.solution[i]) {
                    grid.cellData[i].setData(ATTR.DATA.CHECK, CELL_CHECK.ERROR);
                }
            }
        }

        return {
            check:check
        }
    }();

    //  +----------------------+
    //  |      Highlights      |
    //  +----------------------+

    var highlights = function () {

        function remove () {
            for (var [index, cellData] of grid.cellData.entries()) {
                cellData.removeData(ATTR.DATA.HIGHLIGHT);
                cellData.removeData(ATTR.DATA.DIGIT_HIGHLIGHT);
            }
        }

        function updatePencil () {

            // Reset pencil cells
            for (var [index, cellData] of grid.cellData.entries()) if (cellData.state == CELL_STATE.PENCIL) cellData.cell.innerText = cellData.value;

            // Update highlights
            if (selection.cells.length == 1 && (selection.cells[0].state != CELL_STATE.NORMAL && selection.cells[0].state != CELL_STATE.CLUE)) return;
            if (selection.cells[0] == undefined) return;
            for (var [index, cellData] of grid.cellData.entries()) {
                if (cellData.state != CELL_STATE.PENCIL) continue;
                var cellValue = "" + String(cellData.value);
                var selectedValue = "" + String(selection.cells[0].value);
                if (cellValue.indexOf(selectedValue) >= 0) {
                    cellData.cell.innerHTML = "";

                    var tempSpanLow = document.createElement("span");
                    tempSpanLow.setAttribute(ATTR.DATA.PENCIL_HIGHLIGHT, "");

                    var tempSpanHigh = document.createElement("span");
                    tempSpanHigh.setAttribute(ATTR.DATA.PENCIL_HIGHLIGHT_DIGIT, "");
                    tempSpanHigh.innerText = selectedValue;

                    var splitValue = cellValue.split("");
                    for (var ii=0, jj=splitValue.length; ii<jj; ii++) {
                        if (splitValue[ii] == selectedValue) {
                            if (tempSpanLow.innerText != "") cellData.cell.append(tempSpanLow);
                            tempSpanLow = document.createElement("span");
                            tempSpanLow.setAttribute(ATTR.DATA.PENCIL_HIGHLIGHT, "");
                            cellData.cell.append(tempSpanHigh);
                        } else {
                            tempSpanLow.append(splitValue[ii]);
                        }
                    }

                    if (tempSpanLow.innerText != "") cellData.cell.append(tempSpanLow);
                }
            }
        }

        function forSelected () {
            remove();
            if (selection.cells.length == 0 || selection.cells[0].value == grid.emptyValue || selection.cells[0].state == CELL_STATE.PENCIL) return;
            
            var cellData = selection.cells[0];
            var groupX = Math.floor(cellData.x/grid.groupWidth) * grid.groupWidth;
            var groupY = Math.floor(cellData.y/grid.groupHeight) * grid.groupHeight;

            for (var i=cellData.y*grid.width, j=cellData.y*grid.width+grid.width; i<j; i++) {
                if (i!=cellData.index) grid.cellData[i].setData(ATTR.DATA.HIGHLIGHT, "");
            }

            for (var i=cellData.x, j=cellData.x+grid.width*grid.height; i<j; i+=grid.width) {
                if (i!=cellData.index) grid.cellData[i].setData(ATTR.DATA.HIGHLIGHT, "");
            }

            for (var x=groupX, xl=groupX+grid.groupWidth; x<xl; x++) {
                for (var y=groupY*grid.width, yl=grid.width*(groupY+grid.groupHeight); y<yl; y+=grid.width) {
                    if (x+y != cellData.index) grid.cellData[x+y].setData(ATTR.DATA.HIGHLIGHT, "");
                }
            }

            // Highlight digits
            if (cellData.value != grid.emptyValue && cellData.state != CELL_STATE.PENCIL) {
                for (var [i, cd] of grid.cellData.entries()) {
                    if (cd == cellData || cd.state == CELL_STATE.PENCIL) continue;
                    if (cd.value == cellData.value) cd.setData(ATTR.DATA.DIGIT_HIGHLIGHT, "");
                }
            }
        }

        function updateError () {

            for (var [index, cellData] of grid.cellData.entries()) if (cellData.hasData(ATTR.DATA.ERROR)) cellData.removeData(ATTR.DATA.ERROR);

            var groups=[], rows=[], columns=[];

            // Check conflicting cells
            var checkCells = new Map();
            for (var i=0, j=grid.possibleValues.length; i<j; i++) checkCells.set(grid.possibleValues[i], []);
            for (var [index, cellData] of grid.cellData.entries()) {
                if (cellData.value != grid.emptyValue && cellData.value.length == 1 && cellData.state != CELL_STATE.PENCIL) checkCells.get(cellData.value).push(cellData);
            }
            for (var cells of checkCells.values()) {
                for (var c0 of cells) {
                    for (var c1 of cells) {
                        if (c0 == c1) continue;
                        if (c0.x == c1.x || c0.y == c1.y || c0.g == c1.g) {
                            if (c0.x==c1.x && columns.indexOf(c0.x)<0) columns.push(c0.x);
                            if (c0.y==c1.y && rows.indexOf(c0.y)<0) rows.push(c0.y);
                            if (c0.g==c1.g && groups.indexOf(c0.g)<0) groups.push(c0.g);
                            c0.setData(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                            c1.setData(ATTR.DATA.ERROR, CELL_ERROR.DIGIT);
                        }
                    }
                }
            }

            // Highlight groups
            var groupX=0, groupY=0;
            for (var i=0, j=groups.length; i<j; i++) {
                groupX = (groups[i] % grid.groupsX) * grid.groupWidth;
                groupY = Math.floor(groups[i] / grid.groupsX) * grid.groupHeight;
                for (var x=groupX, xl=groupX+grid.groupWidth; x<xl; x++) {
                    for (var y=groupY*grid.width, yl=(groupY+grid.groupHeight)*grid.width; y<yl; y+=grid.width) {
                        if (!grid.cellData[y+x].hasData(ATTR.DATA.ERROR)) grid.cellData[y+x].setData(ATTR.DATA.ERROR, CELL_ERROR.CELL);
                    }
                }
            }

            // Highlight rows
            for (var i=0, j=rows.length; i<j; i++) {
                for (var x=rows[i]*grid.width, xl=rows[i]*grid.width+grid.width; x<xl; x++) {
                    if (!grid.cellData[x].hasData(ATTR.DATA.ERROR)) grid.cellData[x].setData(ATTR.DATA.ERROR, CELL_ERROR.CELL);
                }
            }

            // Highlight columns
            for (var i=0, j=columns.length; i<j; i++) {
                for (var y=columns[i], yl=columns[i]+grid.width*grid.height; y<yl; y+=grid.width) {
                    if (!grid.cellData[y].hasData(ATTR.DATA.ERROR)) grid.cellData[y].setData(ATTR.DATA.ERROR, CELL_ERROR.CELL);
                }
            }

            var gridIndexes=[], errorNums=[];
            for (var cells of checkCells.values()) {
                if (cells.length == 0) continue;
                gridIndexes.length = 0;
                errorNums.length = 0;
                for (var i=0, j=cells.length; i<j; i++) {
                    if (gridIndexes.indexOf(cells[i].g) < 0) gridIndexes.push(cells[i].g);
                    if (cells[i].getData(ATTR.DATA.ERROR) == CELL_ERROR.DIGIT) errorNums.push(cells[i]);
                }
                if (gridIndexes.length > grid.groupsTotal-1 && errorNums.length == 0) {
                    elems.containerBottomElems.bottom.buttons[grid.possibleValues.indexOf(cells[0].value)].setAttribute(ATTR.DATA.BUTTON_STATE, BUTTON_STATE.DISABLED);
                } else elems.containerBottomElems.bottom.buttons[grid.possibleValues.indexOf(cells[0].value)].removeAttribute(ATTR.DATA.BUTTON_STATE);
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

        function reset () { history = []; historyCurrentIndex = -1; }
        function getCurrent () { return historyCurrentIndex > -1 ? history[historyCurrentIndex+1] : null; }
        function add (cells, valuesBefore, valuesAfter, statesBefore, statesAfter) {
            var historyArray = [];

            if (!Array.isArray(cells)) cells = [cells];
            if (!Array.isArray(valuesBefore)) valuesBefore = [valuesBefore];
            if (!Array.isArray(valuesAfter)) valuesAfter = [valuesAfter];
            if (!Array.isArray(statesBefore)) statesBefore = [statesBefore];
            if (!Array.isArray(statesAfter)) statesAfter = [statesAfter];

            for (var i=0, j=cells.length; i<j; i++) {
                if (valuesBefore[i] == valuesAfter[i] && statesBefore[i] == statesAfter[i]) continue;
                historyArray.push({cell:cells[i], valueBefore:valuesBefore[i], valueAfter:valuesAfter[i], stateBefore:statesBefore[i], stateAfter:statesAfter[i]});
            }

            if (history.length > historyCurrentIndex+1) history.length = historyCurrentIndex+1;
            history.push(historyArray);
            historyCurrentIndex++;
        }

        function undo () {
            if (historyCurrentIndex < 0) return;
            var action = history[historyCurrentIndex];
            historyCurrentIndex--;
            for(var i=0, j=action.length; i<j; i++) {
                actions.setCellValue(action[i].cell, action[i].valueBefore, false, false, action[i].stateBefore);
            }
        }

        function redo () {
            if (historyCurrentIndex == history.length-1) return;
            historyCurrentIndex++;
            var action = history[historyCurrentIndex];
            for (var i=0, j=action.length; i<j; i++) {
                actions.setCellValue(action[i].cell, action[i].valueAfter, false, false, action[i].stateAfter);
            }
        }

        return {reset:reset, getCurrent:getCurrent, add:add, undo:undo, redo:redo};
    }();

    //  +------------------+
    //  |      Solver      |
    //  +------------------+

    var solver = function () {

        function solve () {

            if (grid.puzzleData != null) {
                if (!allowSolve) return;
                for (var i=0, j=grid.puzzleData.puzzle.length; i<j; i++) {
                    if (grid.puzzleData.puzzle[i] != grid.emptyValue && grid.cellData[i].value == grid.puzzleData.solution[i]) continue;
                    actions.setCellValue(grid.cellData[i], grid.puzzleData.solution[i], false, false, CELL_STATE.NORMAL);
                }
                return;
            }

            // Construct solve grid structure
            var gridArray = []
            for (var [index, cellData] of grid.cellData.entries()) {
                var cellStructure = {};
                cellStructure.cellData = cellData;
                cellStructure.cell = cellData.cell;
                cellStructure.value = cellData.state == CELL_STATE.PENCIL ? grid.emptyValue : cellData.value;
                cellStructure.possible = [];
                cellStructure.x = cellData.x;
                cellStructure.y = cellData.y;
                cellStructure.groupIndex = cellData.g;
                cellStructure.type = cellData.state;
                gridArray.push(cellStructure);
            }

            // Fill possible numbers
            for (var i=0, j=gridArray.length; i<j; i++) {
                var checkCell = gridArray[i];
                if (checkCell.type == CELL_STATE.CLUE || checkCell.value != grid.emptyValue) continue;
                checkCell.possible = solveGetAllowedValues(gridArray, i);
            }

            // Recursive solve
            while (!allCellsFilled(gridArray)) {
                var gotStuck = true;
                for (var i=0, j=gridArray.length; i<j; i++) {
                    if (!gotStuck) continue;

                    var checkCell = gridArray[i];

                    if (checkCell.value == grid.emptyValue && checkCell.possible.length == 1) {
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
                actions.setCellValue(gridArray[i].cellData, gridArray[i].value, false, false, CELL_STATE.NORMAL);
            }
        }

        function allCellsFilled (checkGrid) {
            for (var i=0, j=checkGrid.length; i<j; i++) {
                if (checkGrid[i].type == CELL_STATE.CLUE) continue;
                if (checkGrid[i].possible.length > 0) return false;
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
            var solution = uniqueFilled();
            var tempGrid = solution.slice(0);

            var removeGoal = numsToRemove;
            var removeCount = 0;
            var attempts = [];
            var changeData = [];

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
                                tempGrid = solution.slice(0);
                                attempts = [];
                                changeData = [];
                                removeCount = 0;
                                error.resetCount = 0;
                                error.indexCount = 0;
                            } else break;
                        } else {
                            tempGrid = solution.slice(0);
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

            tempGrid = solution.slice(0);
            for (var i=0, j=changeData.length; i<j; i++) tempGrid[changeData[i].index] = grid.emptyValue;
            console.log(`Initializing best puzzle of ${changeData.length}/${removeGoal} removed digits...`);
            return {solution:solution, puzzle:tempGrid};
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

    //  +-----------------+
    //  |      Clock      |
    //  +-----------------+

    var clock = function () {

        var root = null;
        var rootDigits = null;
        var digitSpans = [];
        var timeArray = [0,0, 0,0, 0,0];
        var elapsed = null;
        var timeout = null;
        var paused = false;
        var offsetPaused = 0;
        var lastTimeStamp = 0;

        function init (docRoot=null, showButtons=false) {
            if (docRoot == null) return;

            root = docRoot;
            root.setAttribute("data-clock-root-container", "");
            
            rootDigits = document.createElement("div");
            rootDigits.setAttribute("id", "clock-root-digits");
            root.append(rootDigits);

            digitSpans.push(getDigitSpan("clock-hours-tens"));
            digitSpans.push(getDigitSpan("clock-hours-ones"));
            addDigitSpacer(rootDigits);
            digitSpans.push(getDigitSpan("clock-minutes-tens"));
            digitSpans.push(getDigitSpan("clock-minutes-ones"));
            addDigitSpacer(rootDigits);
            digitSpans.push(getDigitSpan("clock-seconds-tens"));
            digitSpans.push(getDigitSpan("clock-seconds-ones"));

            function getDigitSpan (id) {
                var elem = document.createElement("span");
                elem.setAttribute("class", "clock-digits");
                elem.setAttribute("id", id);
                elem.setAttribute("data-digit-position", "0");
                for (var i = 0; i < 10; i++) {
                    var divObj = document.createElement("div");
                    divObj.innerText = i;
                    elem.append(divObj);
                }
                rootDigits.append(elem);
                return elem;
            }

            function addDigitSpacer (root) {
                var elem = document.createElement("span");
                elem.setAttribute("class", "clock-digit-spacer");
                elem.innerText = ":";
                root.append(elem);
            }

            var faderElem = document.createElement("div");
            faderElem.setAttribute("class", "fade");
            root.append(faderElem);

            // Buttons
            if (showButtons) {
                createControlButton("Start", "clock-button-start", () => { start(); });
                createControlButton("Pause", "clock-button-pause", () => { pause(); });
                createControlButton("Reset", "clock-button-reset", () => { reset(); });

                function createControlButton (label, id, callBack) {
                    var elem = document.createElement("button");
                    elem.setAttribute("id", id);
                    elem.innerText = label;
                    elem.onclick = () => { callBack(); };
                    root.append(elem);
                }
            }

            reset();
        }

        function start () {
            if (elapsed != null) return;

            // If paused or reset, restart it
            if (paused) pause();
            else {
                lastTimeStamp = Date.now();
                elapsed = setInterval(function () { onTick(); }, 1000);
            }
        }

        function pause () {
            // If not running and not paused, return
            if (!paused && elapsed == null) return;

            // Unpause timer
            if (paused && elapsed == null) {
                paused = false;
                lastTimeStamp = Date.now();
                //console.log("Timer started with offset: " + offsetPaused);
                setTimeout(() => {
                    clearTimeout(timeout);
                    timeout = null;
                    offsetPaused = 0;
                    onTick();
                    elapsed = setInterval(function () { onTick(); }, 1000);
                }, offsetPaused);
                return;
            }

            // Pause timer
            clearInterval(elapsed);
            elapsed = null;
            paused = true;
            if (timeout != null) {
                clearTimeout(timeout);
                timeout = null;
                offsetPaused -= (Date.now() - lastTimeStamp);
                if (offsetPaused < 0) offsetPaused = 0;
            } else {
                offsetPaused = 1000 - (Date.now() - lastTimeStamp);
            }
        }


        function reset () {
            clearTimeout(timeout);
            timeout = null;
            clearInterval(elapsed);
            elapsed = null;
            paused = false;
            timeArray = [0,0, 0,0, 0,0]
            lastTimeStamp = 0;
            offsetPaused = 0;
            digitSpans.forEach((value, key, parent) => { value.setAttribute("data-digit-position", 0); });
        }

        function onTick () {
            lastTimeStamp = Date.now();
            if (timeArray[5] == 9) { timeArray[5] = 0;
                if (timeArray[4] == 5) { timeArray[4] = 0;
                    if (timeArray[3] == 9) { timeArray[3] = 0;
                        if (timeArray[2] == 5) { timeArray[2] = 0;
                            if (timeArray[1] == 9) { timeArray[1] = 0;
                                if (timeArray[0] == 9) timeArray = [0,0, 0,0, 0,0];
                                else timeArray[0]++;
                            } else timeArray[1]++;
                        } else timeArray[2]++;
                    } else timeArray[3]++;
                } else timeArray[4]++;
            } else timeArray[5]++;

            for (var i=0, j=digitSpans.length; i<j; i++) {
                digitSpans[i].setAttribute("data-digit-position", String(timeArray[i]));
            }
        }

        function getTime () { return {hours: timeArray[0] * 10 + timeArray[1], minutes: timeArray[2] * 10 + timeArray[3], seconds: timeArray[4] * 10 + timeArray[5]}; }

        return {
            init:init,
            start:start,
            stop:stop,
            pause:pause,
            reset:reset,
            onTick:onTick,
            getTime:getTime
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
            if (!debugging || true) this.root.oncontextmenu = (e) => false;
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
            this.containerTopElems.top.pauseButton = buildButton('span', ATTR.ID.BTN_PAUSE, null, null, (e) => { state.pause(); }, this.containerTopElems.topContainer)
            this.containerTopElems.top.pauseIcon = buildImage('img', ATTR.ID.BTN_PAUSE_ICON, null, ATTR.SRC.SVG.UNPAUSED, this.containerTopElems.top.pauseButton);
    
            // Action buttons
            this.containerTopElems.bottom.buttonContainer = buildElement('span', ATTR.ID.BTN_CONTAINER_CORE, null, null, null, this.containerTopElems.bottomContainer);
            this.containerTopElems.bottom.buttons = {};
            this.containerTopElems.bottom.buttons.createPuzzle = buildButton('button', ATTR.ID.BTN_CREATE_PUZZLE, ATTR.CLASS.BTNS_CORE, "New Puzzle", (e) => { initPuzzle(true); }, this.containerTopElems.bottom.buttonContainer);
            this.containerTopElems.bottom.buttons.restart = buildButton('button', ATTR.ID.BTN_RESTART, ATTR.CLASS.BTNS_CORE, "Restart", (e) => { restart(); }, this.containerTopElems.bottom.buttonContainer);
            this.containerTopElems.bottom.buttons.solve = buildButton('button', ATTR.ID.BTN_SOLVE, ATTR.CLASS.BTNS_CORE, "Solve", (e) => { solver.solve(); }, this.containerTopElems.bottom.buttonContainer);
            this.containerTopElems.bottom.buttons.clear = buildButton('button', ATTR.ID.BTN_CLEAR, ATTR.CLASS.BTNS_CORE, "Clear", (e) => { reset(true); }, this.containerTopElems.bottom.buttonContainer);

            // Clock
            this.containerTopElems.bottom.clockContainer = buildElement('span', ATTR.ID.CLOCK_ROOT, null, null, null, this.containerTopElems.bottomContainer);
            clock.init(this.containerTopElems.bottom.clockContainer, false);
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
            this.containerBottomElems.top.buttons.hint = buildButtonAction(ATTR.ID.BTN_HINT, ATTR.CLASS.BTNS_ACTIONS, ATTR.SRC.SVG.HINT, "Hint", (e) => { hints.reveal(); }, this.containerBottomElems.top.buttonContainer);
            
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

            this.checkContainer = buildElement('div', 'sudoku-button-check-container', null, null, null, this.root);
            this.checkButton = buildButton('button', 'sudoku-button-check', null, 'Check for errors...', (e) => { checker.check(); }, this.checkContainer);
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
    
            (function (cell, x, y, onPointerDown, onOverCell) {
                if (!isTouch) {
                    cell.addEventListener('pointerdown', (e) => {
                        e.preventDefault();
                        onPointerDown(x, y);
                    });
                    cell.addEventListener('pointerover', (e) => {
                        e.preventDefault();
                        onOverCell(x, y);
                    });
                } else {
                    cell.addEventListener('touchstart', (e) => {
                        e.preventDefault();
                        onPointerDown(x, y);
                    });
                }
            })(td, x, y, input.onPointerDown, input.onOverCell);
    
            parentRow.append(td);
            return td;
        }
    
        return {
            SudokuElems:SudokuElems
        };
    }();

    function removeAllAttributesFromAll () {
        grid.cellData.forEach((cellData) => {
            cellData.removeData(ATTR.DATA.HIGHLIGHT);
            cellData.removeData(ATTR.DATA.DIGIT_HIGHLIGHT);
            cellData.removeData(ATTR.DATA.ERROR);
            cellData.state = CELL_STATE.NORMAL;
            cellData.removeData(ATTR.DATA.CHECK);
        });
    }

    function checkIfSolvedPuzzle () {
        for (var [index, cellData] of grid.cellData.entries()) {
            if (cellData.state == CELL_STATE.PENCIL || cellData.value == grid.emptyValue || cellData.hasData(ATTR.DATA.ERROR)) return;
        }
        state.stop();
        alert("You won!");
    }

    var state = {
        paused : false,
        start : () => {
            if (state.paused) state.pause();
            else clock.start();
        },
        pause : () => {
            if (state.paused) {
                state.paused = false;
                elems.containerGridElems.table.removeAttribute("data-puzzle-paused");
                elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.UNPAUSED);
            } else {
                state.paused = true;
                elems.containerGridElems.table.setAttribute("data-puzzle-paused", "");
                elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.PAUSED);
            }
            clock.pause();
        },
        reset : () => {
            clock.reset();
            state.paused = false;
            elems.containerGridElems.table.removeAttribute("data-puzzle-paused");
            elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.UNPAUSED);
        },
        stop : () => {
            clock.pause();
            state.paused = true;
            elems.containerGridElems.table.removeAttribute("data-puzzle-paused");
            elems.containerTopElems.top.pauseIcon.setAttribute("src", ATTR.SRC.SVG.UNPAUSED);
        }
    }

    return {
        init:init
    };
}();

sudoku.init();