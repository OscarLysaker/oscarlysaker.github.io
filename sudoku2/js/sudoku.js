var sudoku = function () {

    var gridHandler = function () {

        var SIZE = {
            SMALL  : {total:36,  size:6,  groupWidth:3, groupHeight:2, groupsX:2, groupsY:3, possible:["1","2","3","4","5","6"]},
            NORMAL : {total:81,  size:9,  groupWidth:3, groupHeight:3, groupsX:3, groupsY:3, possible:["1","2","3","4","5","6","7","8","9"]},
            HUGE   : {total:256, size:16, groupWidth:4, groupHeight:4, groupsX:4, groupsY:4, possible:["1","2","3","4","5","6","7","8","9","A","B","C","D","E","F","G"]}
        }

        var RULES = {
            NON_CONSECUTIVE : 'non-consecutive',
            KNIGHT : 'knight'
        }
        
        function Grid (size, rules=[]) {
            // Variables given
            this.size = size.size;
            this.total = size.total;
            this.groupWidth = size.groupWidth;
            this.groupHeight = size.groupHeight;
            this.groupsX = size.groupsX;
            this.groupsY = size.groupsY;
            this.possible = size.possible;
            this.rules = rules;
            
            // Variables from given
            this.groupsTotal = this.groupsX * this.groupsY;
        }

        return {Grid:Grid, SIZE:SIZE, RULES:RULES};
    }();

    var grid = new gridHandler.Grid(gridHandler.SIZE.NORMAL);

    var elem = {
        root : null,
        table : null,
        rows : [],
        cells : []
    }

    var builder = function () {

        var buildTable = function (elem, grid) {
            elem.table.innerHtml = "";
            for (var i=0, j=grid.size; i<j; i++) {
                elem.rows[i].innerHtml = "";
                for (var x=0; x<j; x++) {
                    elem.rows[i].append(elem.cells[i * j + x]);
                }
                elem.table.append(elem.rows[i]);
            }
        }

        return {buildTable:buildTable};
    }();

    var input = function () {

        var onPointerDown = function (e, cell, index) { console.log(`Pointer down on cell [${index}]!`); }
        var onPointerUp = function (e, cell, index) { /* console.log(`Pointer up on cell [${index}]!`); */ }
        var onPointerEnter = function (e, cell, index) { /* console.log(`Pointer enter cell [${index}]!`); */ }
        var onPointerLeave = function (e, cell, index) { /* console.log(`Pointer left cell [${index}]!`); */ }
        var onPointerCancel = function (e, cell, index) { /* console.log(`Pointer cancelled on cell [${index}]!`); */ }

        return {onPointerDown:onPointerDown,
                onPointerUp:onPointerUp,
                onPointerEnter:onPointerEnter,
                onPointerLeave:onPointerLeave,
                onPointerCancel:onPointerCancel
            };
    }();

    var state = function () {

        function setPuzzle (elem, grid, puzzle) {
            for (var i=0, j=grid.total; i<j; i++) {
                elem.cells[i].innerText = puzzle[i];
            }
        }

        return {setPuzzle:setPuzzle};
    }();

    var generate = function () {

        function filledGrid (grid) {
            var tempGrid = [];
            var emptyValue = 0;
            var possible = grid.possible.slice(0);

            var gw = grid.groupWidth;
            var gh = grid.groupHeight;
            var gsx = grid.groupsX;
            var gsy = grid.groupsY;

            // Attempts counter
            var lineAttempts = 0;
            var maxLineAttempts = 20;
            var resetAttempts = 0;

            // Main loop
            MainLoop:
            while (true) {

                // Reset tempGrid
                tempGrid = [];
                for (var i=0, j=grid.total; i<j; i++) tempGrid.push(emptyValue);

                // Indexes and possible storage
                var x=0;
                var y=0;
                var g=0;
                var columns = [];
                var rows = [];
                var groups = [];
                for (var i=0, j=grid.size; i<j; i++) {
                    columns.push(possible.slice(0));
                    rows.push(possible.slice(0));
                    groups.push(possible.slice(0));
                }

                // Main grid loop
                GridLoop:
                while (true) {

                    console.log("Grid loop...");

                    // Get group index
                    g = Math.floor(y / gh) * gsx + Math.floor(x / gw);

                    // Find possible value
                    var foundValue = emptyValue;
                    var valueAttempts = 0;
                    var maxValueAttempts = grid.size;
                    ValueLoop:
                    while (true) {
                        console.log("Value loop...");
                        console.log(`x: ${x}, y: ${y}, g: ${g}`);
                        var checkValue = columns[x][Math.floor(Math.random() * columns[x].length)];
                        console.log(`Checking value: ${checkValue}`);
                        if (rows[y].indexOf(checkValue) >= 0 && groups[g].indexOf(checkValue) >= 0) {
                            foundValue = checkValue;
                            console.log("FOUND VALUE!!");
                            break ValueLoop;
                        } else {
                            valueAttempts++;
                            if (valueAttempts >= maxValueAttempts) break ValueLoop;
                        }
                    }

                    if (foundValue == emptyValue) {
                        if (lineAttempts < maxLineAttempts) {
                            // Reset line
                            console.log(`Reset line at ${x}..`);
                            var currentIndex = y * grid.size + x;
                            var targetIndex = currentIndex - grid.size;
                            if (targetIndex < 0) targetIndex = 0;
                            for (var i=currentIndex, j=targetIndex; i>j; i--) {
                                var tx = i % grid.size;
                                var ty = Math.floor(i / grid.size);
                                var tg = Math.floor(y / gh) * gsx + Math.floor(x / gw);

                                columns[tx].push(tempGrid[i]);
                                rows[ty].push(tempGrid[i]);
                                groups[tg].push(tempGrid[i]);
                                tempGrid[i] = emptyValue;
                            }
                            x = targetIndex % grid.size;
                            y = Math.floor(targetIndex / grid.size);
                            lineAttempts++;
                        } else {
                            // Reset grid
                            lineAttempts = 0;
                            resetAttempts++;

                            if (resetAttempts > 20) break MainLoop;

                            break GridLoop;
                        }
                        
                    } else {
                        lineAttempts = 0;
                        resetAttempts = 0;

                        tempGrid[y * grid.size + x] = foundValue;
                        columns[x].splice(columns[x].indexOf(checkValue), 1);
                        rows[y].splice(rows[y].indexOf(checkValue), 1);
                        groups[g].splice(groups[g].indexOf(checkValue), 1);

                        x++;
                        if (x >= grid.size) {
                            console.log("Next line...");
                            y++;
                            x = 0;
                        }
                        if (y >= grid.size) {
                            break MainLoop;
                        }
                    }
                }
            }

            return tempGrid;
        }

        return {filledGrid:filledGrid};
    }();

    var init = function (docRoot) {
        if (elem.root != null) elem.root.innerHtml = "";
        elem.root = docRoot;

        // Create table
        elem.table = document.createElement("table");
        elem.table.setAttribute("id", "sudoku-table");
        
        // Create all rows
        for (var i=0, j=gridHandler.SIZE.HUGE.size; i<j; i++) {
            var row = document.createElement("tr");
            row.setAttribute("class", "row");
            row.setAttribute("index", i);
            elem.rows.push(row);
        }

        // Create all cells
        for (var i = 0, j = gridHandler.SIZE.HUGE.total; i<j; i++) {
            var cell = document.createElement("th");
            cell.setAttribute("class", "cell");
            cell.setAttribute("index", i);
            cell.innerText = "0";
            (function (input, cell, index) {
                cell.onpointerdown = (obj, e) => { input.onPointerDown(e, cell, index); }
                cell.onpointerup = (obj, e) => { input.onPointerUp(e, cell, index); }
                cell.onpointerenter = (obj, e) => { input.onPointerEnter(e, cell, index); }
                cell.onpointerleave = (obj, e) => { input.onPointerLeave(e, cell, index); }
                cell.onpointercancel = (obj, e) => { input.onPointerCancel(e, cell, index); }
            })(input, cell, i);
            elem.cells.push(cell);
        }

        // Append table
        elem.root.append(elem.table);

        // Build table
        builder.buildTable(elem, grid);

        // Temp button
        var tempButton = document.createElement("button");
        tempButton.innerText = "Generate new";
        tempButton.onpointerdown = (e) => {
            state.setPuzzle(elem, grid, generate.filledGrid(grid));
        }
        elem.root.append(tempButton);
    }

    return {init:init};
}();