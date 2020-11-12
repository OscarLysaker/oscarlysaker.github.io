//##########################//
//##|   Game Variables   |##//
//##########################//

var cityInfo = document.getElementById("city-info");

var city = new entity.City("Supercoool city", onCityTick, onCityDay, onCityMonth, onCityYear);

cityInfo.innerText = `City: ${city.name}\nPopulation: ${city.population.length}\nStructures: ${city.structures.length}`;

function onCityTick () {
    //console.log("New city hour...");
}

function onCityDay () {
    //console.log("New city day...");
}

function onCityMonth () {
    //console.log("New city month...");
}

function onCityYear () {
    //console.log("New city year...");
}

//###################//
//##|   Tickers   |##//
//###################//

var time = {
    hour : 0,
    maxHours : 24,
    day : 0,
    maxDays : 30,
    month : 0,
    maxMonths : 12,
    year : 1996,
    total : {
        hours : 0,
        days : 0,
        months : 0,
        years : 0
    }
}

// Main timer
var tickTimer = new Timer(onMainTick, 100);

function onMainTick () {

    // Tick time one hour on
    time.hour ++;
    entity.all.forEach((entity, index, list) => { entity.onTick(); });
    if (time.hour >= time.maxHours) {
        entity.all.forEach((entity, index, list) => { entity.onDay(); });
        time.hour = 0; time.day++;
        if (time.day >= time.maxDays) {
            entity.all.forEach((entity, index, list) => { entity.onMonth(); });
            time.day = 0; time.month++;
            if (time.month >= time.maxMonths) {
                entity.all.forEach((entity, index, list) => { entity.onYear(); });
                time.month = 0; time.year++;
            }
        }
    }

    // Add one hour to total time tracker
    time.total.hours++;
    if (time.total.hours >= time.maxHours) {
        time.total.hours = 0;
        time.total.days++;
        if (time.total.days >= time.maxDays) {
            time.total.days = 0;
            time.total.months++;
            if(time.total.months >= time.maxMonths) {
                time.total.months = 0;
                time.total.years++;
            }
        }
    }

    var currentHourString = String(time.hour);
    if (currentHourString.length < 2) currentHourString = `0${currentHourString}`;

    //console.log(`Current time: ${currentHourString}:00, ${time.day}/${time.month}/${time.year}`);
    //console.log(`Time passed: ${time.total.hours} hours, ${time.total.days} days, ${time.total.months} months and ${time.total.years} years...`);
}

var canvasObject = function () {

    function BaseObject (x=0, y=0, width=10, height=10, color="#33dd55") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.getRect = () => {
            var right = this.x + this.width;
            var bottom = this.y + this.height;
            return {x:this.x, y:this.y, width:this.width, height:this.height, top:this.y, left:this.x, right:right, bottom:bottom};
        }
        this.getCenter = () => {
            return {
                x : this.x + this.width * 0.5,
                y : this.y + this.height * 0.5
            };
        }
    }

    function StructureObject (structure, label, x, y, width=100, height=100) {
        BaseObject.call(this, x, y, width, height, "#55aa33");
        this.structure = structure;
        this.label = structure.name;
        this.fontSize = 12;
        this.fontSizeSmall = 10;
        this.fontColor = "#ffffff";
        this.selected = false;
    }

    return {
        BaseObject:BaseObject,
        StructureObject:StructureObject
    };
}();

var objectInfo = document.getElementById("object-info");

var selectedObject = null;
function selectStructureObject (obj=null) {
    for (var i=0, j=city.structures.length; i<j; i++) {
        city.structures[i].selected = false;
    }
    if (obj != null) {
        obj.selected = true;
        objectInfo.innerText = obj.structure.toMultiString();
        if (obj.structure.type == entity.STRUCTURE_TYPE.CITY) {
            var htmlString = `${obj.structure.name}:\n-- Population:\n`;
            for (var i=0, j=obj.structure.population.length; i<j; i++) {
                var person = obj.structure.population[i];
                htmlString += `---- ${person.firstName} ${person.lastName}, aged ${person.age}`;
                if (person.home == null) htmlString += ", homeless";
                htmlString += "\n";
            }
            htmlString += `-- Structures: ${obj.structure.structures.length}`;
            objectInfo.innerText = htmlString;
        } else if (obj.structure.type == entity.STRUCTURE_TYPE.HOUSING) {
            var htmlString = `${obj.structure.name}:\n-- Population:\n`;
            for (var i=0, j=obj.structure.population.length; i<j; i++) {
                var person = obj.structure.population[i];
                htmlString += `---- ${person.fullName()}, aged ${person.age}\n`;
            }
            htmlString += `-- Houses: ${obj.structure.buildings}`;
            objectInfo.innerText = htmlString;
        }
    } else {
        objectInfo.innerText = "";
    }
    selectedObject = obj;
}

city.structures.push(new canvasObject.StructureObject(new entity.Housing(), "Housing", 20, 20));
city.structures.push(new canvasObject.StructureObject(new entity.Industrial(), "Industrial", 200, 20));
city.structures.push(new canvasObject.StructureObject(new entity.Medicinal(), "Medicinal", 20, 200));
city.structures.push(new canvasObject.StructureObject(new entity.Commercial(), "Commercial", 200, 200));
city.structures.push(new canvasObject.StructureObject(new entity.Policing(), "Policing", 380, 20));
city.structures.push(new canvasObject.StructureObject(new entity.Education(), "Education", 380, 200));
city.structures.push(new canvasObject.StructureObject(city, "City", 20, 380));


//##################//
//##|   Canvas   |##//
//##################//

var c = document.getElementById("game-canvas");
var ctx = c.getContext("2d", {alpha:false});
var canvasWidth = 0;
var canvasHeight = 0;
var canvasOffset = {x:0, y:0};
var cRect = c.getBoundingClientRect();
resizeCanvas();

var mousePos = {x:0, y:0}
document.onpointermove = (e) => {
    mousePos.x = e.clientX - cRect.x;
    mousePos.y = e.clientY - cRect.y;
}

window.onresize = () => {
    resizeCanvas();
}

function resizeCanvas () {
    var minVar = Math.min(window.innerHeight, window.innerWidth);
    canvasWidth = canvasHeight = Math.floor(minVar * 0.9);
    c.setAttribute("width", canvasWidth);
    c.setAttribute("height", canvasHeight);
    bodyRect = document.body.getBoundingClientRect();
    cRect = c.getBoundingClientRect();
}

//###################//
//##|   Drawing   |##//
//###################//

var draw = {
    ctx : ctx,
    setAlpha : (alpha) => {
        draw.ctx.globalAlpha = alpha;
    },
    border : (width, height, borderSize, color) => {
        draw.ctx.fillStyle = color;
        draw.ctx.fillRect(0, 0, borderSize, height);
        draw.ctx.fillRect(0, 0, width, borderSize);
        draw.ctx.fillRect(0, height - borderSize, width, borderSize);
        draw.ctx.fillRect(width - borderSize, 0, borderSize, height);
    },
    rect : (x, y, width, height, color) => {
        draw.ctx.fillStyle = color;
        draw.ctx.fillRect(x, y, width, height);
    }
}

function drawBorder (ctx, width, height, borderSize, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, borderSize, height);
    ctx.fillRect(0, 0, width, borderSize);
    ctx.fillRect(0, height - borderSize, width, borderSize);
    ctx.fillRect(width - borderSize, 0, borderSize, height);
}

var buildingMode = false;
//var drawTimer = new Timer(onDraw, 1);
var drawPlaneOffset = {x:0, y:0}
function onDraw () {
    var w = canvasWidth;
    var h = canvasHeight;

    ctx.fillStyle = "#118888";
    ctx.fillRect(0, 0, w, h);

    var selectedSize = 2;

    ctx.fillStyle = "#000000";
    ctx.beginPath();
    var drawnIndex = 0;
    for (var ia=0, ja=city.structures.length; ia<ja; ia++) {
        var p1 = city.structures[ia].getCenter();
        for (var ib=drawnIndex, jb=city.structures.length; ib<jb; ib++) {
            if (ia == ib) continue;
            var p2 = city.structures[ib].getCenter();
            ctx.moveTo(p1.x + drawPlaneOffset.x, p1.y + drawPlaneOffset.y);
            ctx.lineTo(p2.x + drawPlaneOffset.x, p2.y + drawPlaneOffset.y);
        }
        drawnIndex++;
    }
    ctx.stroke();

    // Draw structures
    for (var i=0, j=city.structures.length; i<j; i++) {
        var obj = city.structures[i];
        
        if (obj.selected) {
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(drawPlaneOffset.x + obj.x - selectedSize, drawPlaneOffset.y + obj.y - selectedSize, obj.width + selectedSize * 2, obj.height + selectedSize * 2);
        }

        ctx.fillStyle = obj.color;
        ctx.fillRect(drawPlaneOffset.x + obj.x, drawPlaneOffset.y + obj.y, obj.width, obj.height);

        ctx.fillStyle = obj.fontColor;
        ctx.textAlign = "center";
        ctx.font = `${obj.fontSize}px Arial`;
        //ctx.fillText(obj.label, drawPlaneOffset.x + obj.x + obj.width * 0.5, drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.3);
        ctx.fillText(obj.label, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.3 + obj.fontSize * 0.3));
        //ctx.font = `${obj.fontSize}px Arial`;
        switch (obj.structure.type) {
            case entity.STRUCTURE_TYPE.HOUSING:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`People: ${obj.structure.population.length}/${obj.structure.maxPopulation()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Houses: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.6));
                break;
            case entity.STRUCTURE_TYPE.INDUSTRIAL:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Workers: ${obj.structure.workers.length}/${obj.structure.maxWorkers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Factories: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.6));
                break;
            case entity.STRUCTURE_TYPE.COMMERCIAL:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Workers: ${obj.structure.workers.length}/${obj.structure.maxWorkers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Shops: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.6));
                break;
            case entity.STRUCTURE_TYPE.MEDICINAL:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Doctors: ${obj.structure.workers.length}/${obj.structure.maxWorkers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Buildings: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.5));
                ctx.fillText(`Patients: ${obj.structure.careTakers.length}/${obj.structure.maxCareTakers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 2.9));
                break;
            case entity.STRUCTURE_TYPE.EDUCATION:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Teachers: ${obj.structure.workers.length}/${obj.structure.maxWorkers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Buildings: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.5));
                ctx.fillText(`Students: ${obj.structure.careTakers.length}/${obj.structure.maxCareTakers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 2.9));
                break;
            case entity.STRUCTURE_TYPE.POLICING:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Officers: ${obj.structure.workers.length}/${obj.structure.maxWorkers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Buildings: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.5));
                ctx.fillText(`Prisoners: ${obj.structure.careTakers.length}/${obj.structure.maxCareTakers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 2.9));
                break;
            case entity.STRUCTURE_TYPE.FIRE:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Firefighters: ${obj.structure.workers.length}/${obj.structure.maxWorkers()}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Buildings: ${obj.structure.buildings}/${obj.structure.maxBuildings}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.6));
                break;
            case entity.STRUCTURE_TYPE.CITY:
                ctx.font = `${obj.fontSizeSmall}px Arial`;
                ctx.fillText(`Population: ${obj.structure.population.length}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 0.2));
                ctx.fillText(`Structures: ${obj.structure.structures.length}`, Math.floor(drawPlaneOffset.x + obj.x + obj.width * 0.5), Math.floor(drawPlaneOffset.y + obj.y + obj.height * 0.5 + obj.fontSize * 1.6));
                break;    
            default:
        }
    }

    // Building mode
    if (buildingMode) {
        draw.border(w, h, 6, "#ffff00");

        ctx.globalAlpha = 0.2;
        ctx.fillStyle = "#000000";
        ctx.fillRect(mousePos.x - 50, mousePos.y - 30, 100, 60);
        ctx.globalAlpha = 1.0;
    }

    // Draw planeOffset
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.font = `20px Arial`;
    ctx.fillText(`Plane offset (x:${drawPlaneOffset.x}, y:${drawPlaneOffset.y})`, 6, 20);
}

//#############################//
//##|   Temporary Buttons   |##//
//#############################//

var buildingButton = document.getElementById("build-button");
buildingButton.onclick = (e) => { buildingMode = true; }

var bulldozeButton = document.getElementById("bulldoze-button");
bulldozeButton.onclick = (e) => {
    if (selectedObject != null && city.structures.indexOf(selectedObject) >= 0) {
        city.structures.splice(city.structures.indexOf(selectedObject), 1);
        objectInfo.innerText = "";
    }
}

//##########################//
//##|   Pointer Events   |##//
//##########################//

// Canvas pointer events
var MOUSE_BUTTON = {
    LEFT : 0,
    MIDDLE : 1,
    RIGHT : 2
}
var mouse = {
    moved : false,
    lastPos : {x : 0, y : 0},
    dragging : false,
    dragStart : {x : 0, y : 0},
    dragStop : {x : 0, y : 0},
    isDown : false,
    isOver : false,
    dragObject : null,
    dragObjectOffset : {x:0, y:0}
}
c.oncontextmenu = (e) => {
    if (buildingMode) {
        buildingMode = false;
    }
    return false;
}
c.addEventListener("pointerdown", (e) => {
    // Button index: left=0, middle=1, right=2
    switch (e.button) {
        case MOUSE_BUTTON.MIDDLE:
            console.log("Middle mouse down...");
            break;
        case MOUSE_BUTTON.RIGHT:
            console.log("Right mouse down...");
            break;
        case MOUSE_BUTTON.LEFT:
        default:
            mouse.isDown = true;
            mouse.moved = false;
            var mp = {x:e.clientX-cRect.x, y:e.clientY-cRect.y};
            var cp = {x:mp.x-drawPlaneOffset.x, y:mp.y-drawPlaneOffset.y}
            for (var i=0, j=city.structures.length; i<j; i++) {
                var obj = city.structures[i];
                if (cp.x > obj.x && cp.x < obj.x + obj.width && cp.y > obj.y && cp.y < obj.y + obj.height) {
                    mouse.dragObject = obj;
                    mouse.dragObjectOffset.x = obj.x - cp.x;
                    mouse.dragObjectOffset.y = obj.y - cp.y;
                }
            }
            mouse.dragStart.x = mouse.lastPos.x = mp.x;
            mouse.dragStart.y = mouse.lastPos.y = mp.y;
            console.log("Pointer down...");
    }
});
c.addEventListener("pointerup", (e) => {
    switch (e.button) {
        case MOUSE_BUTTON.MIDDLE:
            console.log("Middle mouse up...");
            break;
        case MOUSE_BUTTON.RIGHT:
            console.log("Right mouse up...");
            break;
        case MOUSE_BUTTON.LEFT:
        default:
            console.log("Pointer up...");
            if (mouse.dragging) onDragEnd(e.clientX - cRect.x, e.clientY - cRect.y);
            else onClickedCanvas(e.clientX - cRect.x, e.clientY - cRect.y);
            mouse.isDown = false;
            mouse.moved = false;
    }
});
c.addEventListener("pointermove", (e) => {
    mouse.moved = true;
    if (mouse.isDown && mouse.isOver) onDrag(e.clientX - cRect.x, e.clientY - cRect.y);

    var mp = {x:e.clientX-cRect.x, y:e.clientY-cRect.y};
    var cp = {x:mp.x-drawPlaneOffset.x, y:mp.y-drawPlaneOffset.y}
    for (var i=0, j=city.structures.length; i<j; i++) {
        var obj = city.structures[i];
        if (cp.x > obj.x && cp.x < obj.x + obj.width && cp.y > obj.y && cp.y < obj.y + obj.height) {
            c.style.cursor = "pointer";
            break;
        } else if (i == j-1) c.style.cursor = "default";
    }
});
c.addEventListener("pointerleave", (e) => {
    mouse.isOver = false;
});
c.addEventListener("pointerenter", (e) => {
    mouse.isOver = true;
});

function onClickedCanvas (x, y) {
    if (buildingMode) {
        city.structures.push(new canvasObject.StructureObject(new entity.Housing(), "Housing", x - 50 - drawPlaneOffset.x, y - 30 - drawPlaneOffset.y));
        buildingMode = false;
    } else if (mouse.dragObject != null) {
        console.log(`Clicked CanvasObject at (x=${x}, y=${y})`);
        selectStructureObject(mouse.dragObject);
        mouse.dragObject = null;
    } else {
        console.log(`Clicked canvas at (x=${x}, y=${y})`);
        selectStructureObject();
    }
}

function onDrag (x, y) {
    if (!mouse.dragging) mouse.dragging = true;
    if (mouse.dragObject != null) setDragObjectPos(x, y);
    else {
        drawPlaneOffset.x += Math.floor(x - mouse.lastPos.x);
        drawPlaneOffset.y += Math.floor(y - mouse.lastPos.y);
        mouse.lastPos.x = x;
        mouse.lastPos.y = y;
    }
}

function onDragEnd (x, y) {
    mouse.dragging = false;
    if (mouse.dragObject != null) {
        setDragObjectPos(x, y);
        mouse.dragObject = null;
    } else {
        mouse.dragStop.x = x;
        mouse.dragStop.y = y;
        drawPlaneOffset.x += Math.floor(x - mouse.lastPos.x);
        drawPlaneOffset.y += Math.floor(y - mouse.lastPos.y);
    }

    console.log(`Dragged from (x:${mouse.dragStart.x}, y:${mouse.dragStart.y}) to (x:${mouse.dragStop.x}, y:${mouse.dragStop.y})`);
}

function setDragObjectPos (x, y) {
    var nx = x - drawPlaneOffset.x;
    var ny = y - drawPlaneOffset.y;
    mouse.dragObject.x = Math.floor(nx + mouse.dragObjectOffset.x);
    mouse.dragObject.y = Math.floor(ny + mouse.dragObjectOffset.y);
}