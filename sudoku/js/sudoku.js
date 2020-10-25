var sudoku = function () {

    var root = null;

    var cells = {
        elems : [],
        emptyValue : 0
    }

    var GRID_SIZE = {
        SMALL  : {emptyCellValue: 0, cellsTotal:  36, width:  6, height:  6, groupsTotal:  6, groupsX: 2, groupsY: 3, groupWidth: 3, groupHeight: 2, groupNum:  6, possibleValues: [1,2,3,4,5,6]},
        NORMAL : {emptyCellValue: 0, cellsTotal:  81, width:  9, height:  9, groupsTotal:  9, groupsX: 3, groupsY: 3, groupWidth: 3, groupHeight: 3, groupNum:  9, possibleValues: [1,2,3,4,5,6,7,8,9]},
        HUGE   : {emptyCellValue: 0, cellsTotal: 256, width: 16, height: 16, groupsTotal: 16, groupsX: 4, groupsY: 4, groupWidth: 4, groupHeight: 4, groupNum: 16, possibleValues: [1,2,3,4,5,6,7,8,9,"A","B","C","D","E","F","G"]}
    };

    var grid = GRID_SIZE.NORMAL;

    var ATTR = {
        CELL_ID : 'sudoku-root-cell',
        CELL_X : 'data-pos-x',
        CELL_Y : 'data-pos-y',
        CELL_INDEX : 'data-cell-index',
        CELL_TYPE : 'data-sudoku-cell-type',
        CELL_VALUE : 'data-value',
        ROW_ID : 'sudoku-root-row',
        TABLE_ID : 'sudoku-root-table',
        CLASS_UNSELECTABLE : 'unselectable'
    }

    var CELL_TYPE = {
        EMPTY : 'empty',
        NORMAL : 'normal',
        PENCIL : 'pencil',
        CLUE : 'clue'
    };

    var init = function (docRoot=null) {
        if (docRoot == null) return;


    }

    var setup = {

    }

    //--|  Grid handling and manipulation

    var rebuildGrid = function () {
        
    }

    var createGrid = function (table) {
        table.innerHTML = "";
        for (var i = 0, j = grid.cellsTotal, l = grid.width; i < j; i += l) {
            var tempRow = createRow(i);
            table.append(tempRow);
        }
    }

    var createRow = function (index) {
        var tempRow = document.createElement("tr");
        tempRow.setAttribute("id", ATTR.ROW_ID);
        for (var i = index, j = grid.width; i < j; i++) {
            var tempCell = createCell(i);
            tempRow.push(tempCell);
            cells.elems.push(tempCell);
        }
        return tempRow;
    }

    var createCell = function (index) {
        var tempCell = document.createElement("th");
        tempCell.setAttribute("id", ATTR.CELL_ID);
        tempCell.setAttribute(ATTR.CELL_INDEX, index);
        tempCell.setAttribute(ATTR.CELL_TYPE, CELL_TYPE.EMPTY);
        tempCell.setAttribute(ATTR.CELL_VALUE, cells.emptyValue);
        return tempCell;
    }

    //--|  Button handling and manipulation

    var buttons = {
        temp : [],
        tempRoot : null,
        tempInit : function (docRoot) {
            tempRoot = docRoot;
            tempRoot.append(tempCreate("New Sample", "sudoku-button-temp-sample-set", null, () => { initPuzzle(samplePuzzles.easy[0]); })));
        },
        tempCreate : function (label, id, cl, callback) {
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
        },

        input : [],
        inputRoot : null,
        inputInit : function (docRoot) {
            tempRoot = docRoot;
            
        },
        inputCreate : function () {

        },

        value : [],
        valueRoot : null,
        valueInit : function (docRoot) {
            tempRoot = docRoot;
            
        },
        valueCreate : function () {

        }
    }

    return {};
}();