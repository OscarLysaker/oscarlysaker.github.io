//##################//
//##|   Canvas   |##//
//##################//

var sprite = function () {

    const TYPE = {
        STAGE : 'stage',
        SPRITE : 'sprite',
        SHAPE : 'shape',
        RECT : 'rect',
        ROUNDED_RECT : 'rounded-rect',
        CIRCLE : 'circle',
        PARTICLES : 'particles',
        PATH : 'path'
    }

    const PROPERTY = {
        SPRITE : 'sprite',
        POSITION : 'position'
    }

    var components = function () {

        function Point (x=0, y=0) {
            var _x = x;
            var _y = y;
            var _xInt = Math.floor(x);
            var _yInt = Math.floor(y);
            Object.defineProperty(this, "x", {get() {return _x;}, set(v) { _xInt = Math.floor(v); return _x = v;}});
            Object.defineProperty(this, "y", {get() {return _y;}, set(v) { _yInt = Math.floor(v); return _y = v;}});
            Object.defineProperty(this, "xInt", {get() {return _xInt;}});
            Object.defineProperty(this, "yInt", {get() {return _yInt;}});
        }
    
        function Bounds (x=0, y=0, width=0, height=0) {
            Point.call(this, x, y);
            var _width = width;
            var _height = height;
            var _widthInt = Math.floor(width);
            var _heightInt = Math.floor(width);
            Object.defineProperty(this, "width", {get() {return _width;}, set(v) { _widthInt = Math.floor(v); return _width = v;}});
            Object.defineProperty(this, "height", {get() {return _height;}, set(v) { _heightInt = Math.floor(v); return _height = v;}});
            Object.defineProperty(this, "widthInt", {get() {return _widthInt;}});
            Object.defineProperty(this, "heightInt", {get() {return _heightInt;}});
            this.getCenter = () => { return {x:this.x+Math.floor(_width*0.5), y:this.y+Math.floor(_height*0.5)} };
        }

        function Circle (x=0, y=0, radius=0) {
            Point.call(this, x, y);
            var _radius = radius;
            var _radiusInt = Math.floor(radius);
            Object.defineProperty(this, "radius", {get() {return _radius;}, set(v) { _radiusInt = Math.floor(v); return _radius = v;}});
            Object.defineProperty(this, "radiusInt", {get() {return _radiusInt;}});
            this.getCenter = () => { return {x:this.x, y:this.y} };
        }

        function PathPoint (x=0, y=0, line=true) {
            Point.call(this, x, y);
            this.line = line;
        }

        function Velocity (vx=0, vy=0) {
            this.vx = vx;
            this.vy = vy;
        }

        function Particle (x=0, y=0, vx=0, vy=0, lifespan=10) {
            Point.call(this, x, y);
            Velocity.call(this, vx, vy);
            this.lifespan = lifespan;
            this.lifespanCounter = 0;
        }

        function Size (size=0) {
            var _size = size;
            var _sizeInt = Math.floor(size);
            Object.defineProperty(this, "size", {get() {return _size;}, set(v) { _sizeInt = Math.floor(v); return _size = v;}});
            Object.defineProperty(this, "sizeInt", {get() {return _sizeInt;}});
        }

        return {
            Point:Point,
            Bounds:Bounds,
            Circle:Circle,
            PathPoint:PathPoint,
            Particle:Particle,
            Size:Size
        };
    }();

    function Sprite (type=TYPE.SPRITE, color="#00ff00", z=0, layer=0) {
        this.type = type;
        this.color = color;
        this.z = z;
        this.layer = layer;
    }

    function Stage (backgroundColor="#118888") {
        components.Bounds.call(this);
        this.backgroundColor = backgroundColor;
        this.scale = 1.0;
        this.objects = [];
    }

    function Rect (x, y, width, height, color, z, layer) {
        Sprite.call(this, TYPE.RECT, color, z, layer);
        components.Bounds.call(this, x, y, width, height);
    }

    function RoundedRect (x, y, width, height, radius, color, z, layer) {
        Rect.call(this, x, y, width, height, color, z, layer);
        this.type = TYPE.ROUNDED_RECT;
        this.radius = radius;
    }

    function Path (color, z, layer) {
        Sprite.call(this, TYPE.PATH, color, z, layer);
        this.relX = 0;
        this.relY = 0;
        this.points = [];
        this.lineTo = (x, y) => {
            this.points.push(new components.PathPoint(x, y));
            return this;
        }
        this.moveTo = (x, y) => {
            this.points.push(new components.PathPoint(x, y, false));
            return this;
        }
    }

    function Circle (x, y, radius, color, z, layer) {
        Sprite.call(this, TYPE.CIRCLE, color, z, layer);
        components.Circle.call(this, x, y, radius);
    }

    function Particles (x, y, size=0, max=20, radius=100, color, z, layers) {
        Sprite.call(this, TYPE.PARTICLES, color, z, layers);
        components.Point.call(this, x, y);
        components.Size.call(this, size);
        this.max = max;
        this.radius = radius;
        this.maxSpeed = 2;
        this.acc = 0.2;
        this.fric = 0.9;
        this.speedMultiplier = 0.05;
        this.all = [];
        this.tick = () => {
            var removeList = [];
            for (var i=0, j=this.all.length; i<j; i++) {
                var part = this.all[i];
                part.lifespanCounter++;
                if (part.lifespanCounter >= part.lifespan) {
                    removeList.push(i);
                    continue;
                }
                if (part.vy < this.maxSpeed) part.vy += this.acc;
                if (part.vy < 0) part.vy *= this.fric;
                part.vx *= this.fric;
                part.x += part.vx;
                part.y += part.vy;
            }

            var removeOffset = 0;
            for (var i=0, j=removeList.length; i<j; i++) {
                this.all.splice(removeList[i] - removeOffset, 1);
                removeOffset++;
            }

            if (this.all.length < this.max && Math.random() > 0.5) {
                var px = Math.floor((Math.random() * radius) - radius * 0.5);
                var py = Math.floor((Math.random() * radius) - radius * 0.5);
                var vx = px * this.speedMultiplier;
                var vy = py * this.speedMultiplier;
                this.all.push(new components.Particle(px + this.x, py + this.y, vx, vy, 50));
            }
        }
    }

    return {
        TYPE:TYPE,
        Sprite:Sprite,
        Stage:Stage,
        Rect:Rect,
        RoundedRect:RoundedRect,
        Path:Path,
        Circle:Circle,
        Particles:Particles
    };
}();

var render = function () {

    var canvas = document.getElementById("game-canvas");
    var canvasBounds = canvas.getBoundingClientRect();
    var ctx = canvas.getContext("2d");
    var stage = new sprite.Stage("#118888");
    var width = 0;
    var height = 0;
    var offset = {x:0, y:0};
    var scale = 1.0;

    var mousePos = {x:0, y:0};
    document.onpointermove = (e) => {
        mousePos.x = Math.floor(e.clientX - canvasBounds.x);
        mousePos.y = Math.floor(e.clientY - canvasBounds.y);
    }

    window.onresize = () => { onResize(); };
    onResize();

    function onResize () {
        var min = Math.min(window.innerWidth, window.innerHeight);
        width = height = Math.floor(min * 0.9);
        canvas.setAttribute("width", width);
        canvas.setAttribute("height", height);
        stage.width = width;
        stage.height = height;
        canvasBounds = canvas.getBoundingClientRect();
    }

    var objects = [];

    objects.push(new sprite.Particles(200, 200, 2, 300, 300, "#0ff0ff"));
    var particleTickIndex = new Timer(objects[0].tick, 2);

    //###################//
    //##|   Drawing   |##//
    //###################//

    var drawTimer = new Timer(onDraw, 1);
    function onDraw () {
        var w = canvasWidth;
        var h = canvasHeight;

        ctx.fillStyle = stage.backgroundColor;
        ctx.fillRect(0, 0, stage.width, stage.height);

        // Draw objects
        for (var i=0, j=objects.length; i<j; i++) {
            var obj = objects[i];
            switch (obj.type) {
                case sprite.TYPE.PARTICLES:
                    ctx.fillStyle = obj.color;
                    var pSize = obj.sizeInt;
                    for (var pi=0, pj=obj.all.length; pi<pj; pi++) {
                        var part = obj.all[pi];
                        if (part.x < -pSize || part.x > w || part.y < -pSize || part.y > h) continue;
                        ctx.fillRect(part.xInt, part.yInt, pSize, pSize);
                    }
                    break;
                case sprite.TYPE.RECT:
                    ctx.fillStyle = obj.color;
                    ctx.fillRect(obj.xInt, obj.yInt, obj.widthInt, obj.heightInt);
                    break;
                default:
            }
        }

        // Draw planeOffset
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "left";
        ctx.font = `20px Arial`;
        ctx.fillText(`Plane offset (x:${offset.x}, y:${offset.y})`, 6, 20);
    }

    return {
        canvas:canvas,
        ctx:ctx,
        width:width,
        height:height,
        offset:offset,
        canvasBounds:canvasBounds,
        mousePos:mousePos
    };
}();

//############################//
//##|   Sorting Z-Values   |##//
//############################//

function comparisonFunctionSprites (a, b) {
    return (a.layer != b.layer) ? a.layer - b.layer : a.z - b.z;
}

length = 2000;
arr1 = [];
for (i = 0; i < length; i++) {
    var indexValue = Math.floor(Math.random() * 5);
    var zValue = Math.floor(Math.random() * 1000);
    var layerValue = Math.floor(Math.random() * 20);
    arr1.push(getRandomDrawObject(indexValue, zValue, layerValue));
}

/*
var logArrayLayers = [];
for (var i=0, j=length; i<j; i++) {
    logArrayLayers.push(arr1[i].layer);
}
console.log(`Before sort: ${logArrayLayers}`);
*/

function getRandomDrawObject (index, z, layer) {
    switch (index) {
        case 0: return new sprite.Path(null, z, layer);
        case 1: return new sprite.Circle(null, null, null, null, z, layer);
        case 2: return new sprite.Rect(null, null, null, null, null, z, layer);
        case 3: return new sprite.RoundedRect(null, null, null, null, null, null, z, layer);
        default: return new sprite.Particles(null, null, null, null, null, null, z, layer);
    }
}

console.time("nativeSortLayers");
arr1.sort(comparisonFunctionSprites);
console.timeEnd("nativeSortLayers");


var currLayer = 0;
var logArrayAfter = [];
logArrayAfter.push(`Layer ${arr1[0].layer}:`)
for (var i=0, j=arr1.length; i<j; i++) {
    if (arr1[i].layer != currLayer) {
        currLayer = arr1[i].layer;
        logArrayAfter.push(`Layer ${currLayer}:`);
    }
    logArrayAfter.push(String(arr1[i].z));
}
//console.log(logArrayAfter);