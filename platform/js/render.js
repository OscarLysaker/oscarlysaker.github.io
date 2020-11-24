//##########################//
//##|                    |##//
//##|   RENDER OBJECTS   |##//
//##|                    |##//
//##########################//

var renderObjects = function () {

    var uniqueId = -1;
    var getUniqueId = () => uniqueId++;

    var TYPE = {
        SPRITE : 'sprite',
        RECT : 'rect',
        CIRCLE : 'circle',
        PARTICLES : 'particles'
    }

    // Render object components
    var com = function () {

        function Point (x=0, y=0) {
            var _x = x;
            var _y = y;
            var _xInt = Math.floor(x);
            var _yInt = Math.floor(y);
            Object.defineProperty(this, 'x', {get () { return _x; }, set (v) { _xInt = Math.floor(v); return _x = v; }});
            Object.defineProperty(this, 'y', {get () { return _y; }, set (v) { _yInt = Math.floor(v); return _y = v; }});
            Object.defineProperty(this, 'xInt', {get () { return _xInt; }});
            Object.defineProperty(this, 'yInt', {get () { return _yInt; }});
            this.getCenter = () => { return {x:this.x, y:this.y} };
            this.getCenterInt = () => { return {x:this.xInt, y:this.yInt} };
        }

        function Bounds (width=0, height=0) {
            var _width = width;
            var _height = height;
            var _widthInt = Math.floor(width);
            var _heightInt = Math.floor(height);
            Object.defineProperty(this, 'width', {get () { return _width; }, set (v) { _widthInt = Math.floor(v); return _width = v; }});
            Object.defineProperty(this, 'height', {get () { return _height; }, set (v) { _heightInt = Math.floor(v); return _height = v; }});
            Object.defineProperty(this, 'widthInt', {get () { return _widthInt; }});
            Object.defineProperty(this, 'heightInt', {get () { return _heightInt; }});
            this.getCenter = () => { return {x:this.x+_width*0.5, y:this.y+_height*0.5} };
            this.getCenterInt = () => { return {x:this.xInt+(_widthInt*0.5)|0, y:this.yInt+(_heightInt*0.5)|0} };
        }

        function Circle (radius=0) {
            var _radius = radius;
            var _radiusInt = Math.floor(radius);
            Object.defineProperty(this, 'radius', {get () { return _radius; }, set (v) { _radiusInt = v>0?v|0:(v-1)|0; return _radius = v; }});
            Object.defineProperty(this, 'radiusInt', {get () { return _radiusInt; }});
            this.getCenter = () => { return {x:this.x, y:this.y} };
            this.getCenterInt = () => { return {x:this.xInt, y:this.yInt} };
        }

        function PathPoint (x, y, line=false) {
            Point.call(this, x, y);
            this.line = line;
        }

        function Velocity (vx=0, vy=0) {
            this.vx = vx;
            this.vy = vy;
        }

        function Particle (x, y, vx, vy) {
            Point.call(this, x, y);
            Velocity.call(this, vx, vy);
            this.lifespanCounter = 0;
        }

        return {
            Point:Point,
            Bounds:Bounds,
            Circle:Circle,
            PathPoint,
            Velocity:Velocity,
            Particle:Particle
        };
    }();

    function Sprite (x, y, color="#0099ff", z=0, layer=0) {
        com.Point.call(this, x, y);
        this.id = getUniqueId();
        this.type = TYPE.SPRITE;
        this.color = color;
        this.z = z;
        this.layer = layer;
        this.entity = null;

        this.remove = () => { render.removeObject(this); }

        this.onAdd = () => {}
        this.onRemove = () => {}
    }

    function Rect (x, y, width, height, color, z, layer) {
        Sprite.call(this, x, y, color, z, layer);
        com.Bounds.call(this, width, height);
        this.type = TYPE.RECT;
    }

    function Circle (x, y, radius, color, z, layer) {
        Sprite.call(this, x, y, color, z, layer);
        com.Circle.call(this, radius);
        this.type = TYPE.CIRCLE;
    }

    function Particles (x, y, size=2, maxParticles=100, spawnRadius=100, spawnRate=0.5, lifespan=100, color="#0000ff", once=false, z, layer) {
        Sprite.call(this, x, y, color, z, layer);
        this.type = TYPE.PARTICLES;
        this.size = size;
        this.max = maxParticles;
        this.radius = spawnRadius;
        this.rate = spawnRate;
        this.lifespan = lifespan;
        this.all = [];
        this.once = once;

        this.acc = 0.02;
        this.fric = 0.99;
        this.maxSpeed = 2;

        var particleCounter = 0;
        var canSpawn = true;

        this.onTick = () => {
            if (this.all.length > 0) {
                var indexOffset = 0;
                for (var i=0, j=this.all.length; i<j; i++) {
                    var part = this.all[i-indexOffset];
                    if (part.lifespanCounter >= lifespan) {
                        this.all.splice(i-indexOffset, 1);
                        indexOffset++;
                        if (!canSpawn && this.all.length == 0) {
                            render.removeObject(this);
                            break;
                        }
                        continue;
                    } 
                    part.lifespanCounter++;

                    part.vx *= this.fric;
                    if (part.vy < this.maxSpeed) part.vy += this.acc;

                    part.x += part.vx;
                    part.y += part.vy;
                }
            }

            if (this.all.length < this.max) {
                if (Math.random() < this.rate && canSpawn) {
                    var nx = Math.random() * this.radius - this.radius * 0.5;
                    var ny = Math.random() * this.radius - this.radius * 0.5;
                    var vx = Math.random() * this.maxSpeed - this.maxSpeed * 0.5;
                    var vy = Math.random() * this.maxSpeed - this.maxSpeed * 0.5;
                    this.all.push(new com.Particle(nx + this.x, ny + this.y, vx, vy));
                    if (this.once) {
                        particleCounter++;
                        if (particleCounter >= this.max) canSpawn = false;
                    }
                }
            }
        }
    }

    return {
        TYPE:TYPE,
        Sprite:Sprite,
        Rect:Rect,
        Particles:Particles,
        Circle:Circle
    };
}();

//##############################//
//##|                        |##//
//##|   MAIN RENDER ACCESS   |##//
//##|                        |##//
//##############################//

var render = function () {
    var initialized = false;
    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext("2d");
    var width = 0;
    var height = 0;
    var tickIndex = null;

    //###################################//
    //##|   Canvas Setup & Handlers   |##//
    //###################################//

    canvas.setAttribute('id', 'game-canvas');
    //canvas.oncontextmenu = () => { return false; }

    function getCanvas () { return canvas; }

    //##################//
    //##|   Events   |##//
    //##################//

    window.addEventListener('resize', onResize);

    //#################################//
    //##|   Render Base Functions   |##//
    //#################################//

    function init (root) {
        if (initialized) return;
        initialized = true;
        root.append(canvas);
        start();
    }

    function start () {
        if (tickIndex != null) return;
        tickIndex = new Timer(tick, 1);
    }

    function stop () {
        if (tickIndex == null) return;
        tickIndex.stop();
        tickIndex = null;
    }

    function onResize () {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.setAttribute('width', width);
        canvas.setAttribute('height', height);
    }

    //###################################//
    //##|   Object & Layer Handlers   |##//
    //###################################//

    var objects = [];
    var layers = [new ObjectLayer(null, null, 0)];
    var numLayers = () => layers.length;

    function ObjectLayer (name, length=0, index) {
        this.name = name || `Object Layer ${this.index}`;
        this.from = objects.length;
        this.to = this.from + length;
        this.length = +length|0;
        this.index = +index|0;
    }

    function addLayer (name, length) {
        layers.push(new ObjectLayer(name, length, layers.length));
    }

    function removeLayer (layer) {
        if (!layer || layers.indexOf(layer) < 0) return;
        var layerIndex = layers.indexOf(layer);
        var layersToMove = objects.length - layerIndex - 1;

        // Correct above layers
        for (var i=layerIndex, j=layersToMove; i<j; i++) {
            layers[i].from -= layer.length;
            layers[i].to -= layer.length;
            layers[i].index--;
        }

        // Call onRemove
        for (var i=layer.from, j=layer.to; i<j; i++) object[i].onRemove();

        // Move above layer objects
        for (var copyTo=layer.from, copyTo=layer.to, j=layer.from + layer.length; i<j; copyTo++, copyFrom++) {
            if (objects[copyFrom]) {
                objects[copyTo] = objects[copyFrom];
                continue;
            }
            // If no move objects to move, set new
            // object array length...
            objects.length = copyFrom;
            break;
        }
    }

    function addLayerAt (index, name, length) {
        if (!index) return;

        // If index pos is taken, move
        if (layers[index]) {
            for (var i=layers.length-index-1, j=index; i>j; i--) {
                layers[i].index++;
                layers[i+1] = layers[i];
            }
        } else if (index > layers.length) {
            index = layers.length;
        }

        layer[index] = new ObjectLayer(name, length, index);
    }

    function removeLayerAt (index) {
        if (!index) return;
    }

    function addObject (obj) {
        if (objects.indexOf(obj) >= 0) return false;
        obj.layer = layers.length-1;
        layers[layers.length-1].length++;
        layers[layers.length-1].to++;
        objects.push(obj);
        obj.onAdd();
        return true;
    }

    function addObjectAt (obj, layer) {
        if (objects.indexOf(obj) >= 0 || !layer || layer < 0) {
            console.log("Invalid arguments at [addNewObject], returning...");
            return false;
        }
        
        if (layers.length >= layer+1) {
            for (var i=layer+1, j=layers.length; i<j; i++) {
                layers[i].from++;
                layers[i].to++;
            }
            for (var i=objects.length, j=layers[layer+1].from; i>j; i--) objects[i] = objects[i-1];
            layers[layer].to++;
            layers[layer].length++;
            objects[layers[layer].to] = obj;
        } else {
            layer = layers.length;
            addLayer(null, 1);
            objects.push(obj);
        }

        obj.layer = layer;
        obj.onAdd();
        return true;
    }

    function removeObject (obj) {
        if (objects.indexOf(obj) < 0) return false;
        objects.splice(objects.indexOf(obj), 1);
        layers[obj.layer].length--;
        layers[obj.layer].to--;
        if (layers.length > obj.layer + 1) {
            for (var i=obj.layer+1, j=layers.length; i<j; i++) {
                layers[i].from--;
                layers[i].to--;
            }
        }
        return true;
    }

    function getObjectAt (index, layer) {
        if (!index && !layer) return;
        if (layer && index && objects[layers[layer].from + index]) return objects[layers[layer].from + index];
        else if (index && !layer && objects[index]) return objects[index];
        return null; 
    }

    function hasObject (obj) { return (objects.indexOf(obj) < 0) ? false : true; }

    //############################//
    //##|   Render Tick Loop   |##//
    //############################//

    function tick () {

        ctx.fillStyle = "#33ff99";
        ctx.fillRect(0, 0, width, height);

        for (var i=0, j=objects.length; i<j; i++) {
            var obj = objects[i];
            switch (obj.type) {
                case renderObjects.TYPE.CIRCLE:
                    ctx.beginPath();
                    if (!obj.entity) ctx.arc(obj.xInt, obj.yInt, obj.radiusInt, 0, 2*Math.PI);
                    else ctx.arc(obj.xInt + obj.entity.spriteOffset.x, obj.yInt + obj.entity.spriteOffset.y, obj.radiusInt, 0, 2*Math.PI, false);
                    ctx.fillStyle = obj.color;
                    ctx.fill();
                    break;
                case renderObjects.TYPE.RECT:
                    ctx.fillStyle = obj.color;
                    if (!obj.entity) ctx.fillRect(obj.xInt, obj.yInt, obj.widthInt, obj.heightInt);
                    else {
                        ctx.fillRect(obj.xInt + obj.entity.spriteOffset.x, obj.yInt + obj.entity.spriteOffset.y, obj.widthInt, obj.heightInt);
                    }
                    break;
                case renderObjects.TYPE.PARTICLES:
                    obj.onTick();
                    ctx.fillStyle = obj.color;
                    var pSize = obj.size;
                    for (var ii=0, jj=obj.all.length; ii<jj; ii++) {
                        var part = obj.all[ii];
                        if (part.xInt + pSize <= 0 || part.xInt > width || part.yInt + pSize < 0 || part.yInt > height) continue;
                        ctx.fillRect(part.xInt, part.yInt, pSize, pSize);
                    }
                    break;
                default: continue;
            }
        }

        for (var i=0, j=tempObjects.length; i<j; i++) {
            var obj = tempObjects[i];
            switch (obj.type) {
                case renderObjects.TYPE.RECT:
                    ctx.fillStyle = obj.color;
                    ctx.fillRect(obj.xInt, obj.yInt, obj.widthInt, obj.heightInt);
                    break;
                case renderObjects.TYPE.PARTICLES:
                    obj.onTick();
                    ctx.fillStyle = obj.color;
                    var pSize = obj.size;
                    for (var ii=0, jj=obj.all.length; ii<jj; ii++) {
                        var part = obj.all[ii];
                        if (part.xInt + pSize <= 0 || part.xInt > width || part.yInt + pSize < 0 || part.yInt > height) continue;
                        ctx.fillRect(part.xInt, part.yInt, pSize, pSize);
                    }
                    break;
                default: continue;
            }
        }
        tempObjects.length = 0;

        debug.tick(ctx);
    }

    //#####################################//
    //##|   Render Local Post Actions   |##//
    //#####################################//

    onResize();

    //#####################################//
    //##|   Render Local Post Actions   |##//
    //#####################################//

    var tempObjects = [];
    function addTempObject (renderObject) {
        tempObjects.push(renderObject);
    }

    //########################//
    //##|   Debug Render   |##//
    //########################//

    var debug = function () {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var needRedraw = false;
        var height = 30;
        var width = window.innerWidth;

        var doDraw = false;
        function show () {
            if (doDraw) return;
            doDraw = true;
            previousTime = Date.now();
            window.addEventListener('resize', onResize);
            needRedraw = true;
        }
        function hide () {
            if (!doDraw) return;
            doDraw = false; 
            window.removeEventListener('resize', onResize);
        }

        function onResize () {
            width = window.innerWidth;
            height = 30;
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            needRedraw = true;
        }

        var timeCounter = 0;
        var previousTime = 0;
        var frameCounter = 0;
        var previousFramerate = 0;

        function tick (ctx) {
            if (!doDraw) return;

            // Calc fps
            var currentTime = Date.now();
            timeCounter += currentTime - previousTime;
            previousTime = currentTime;
            frameCounter++;
            if (timeCounter >= 1000) {
                timeCounter -= 1000;
                previousFramerate = frameCounter;
                frameCounter = 0;
                needRedraw = true;
            }

            if (needRedraw) redrawCanvas();

            ctx.drawImage(canvas, 0, 0);
        }

        function redrawCanvas () {
            needRedraw = false;

            ctx.clearRect(0, 0, width, height);

            var debugString = "[Debug] ";
            debugString += `fps: ${previousFramerate}`;
            debugString += `, win-size: ${window.innerWidth}x${window.innerHeight}`;
            ctx.textAlign = "left";
            ctx.font = `12px Arial`;

            ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
            ctx.fillRect(0, 0, ctx.measureText(debugString).width + 12, height);

            ctx.fillStyle = "#ffffff";
            ctx.fillText(debugString, 6, 20);
        }

        return {
            show:show,
            hide:hide,
            tick:tick
        }
    }();

    debug.show();

    return {
        // Base variables
        canvas:canvas,
        // Base handlers
        init:init,
        start:start,
        stop:stop,
        getCanvas:getCanvas,
        // Objects
        objects:objects,
        addObject:addObject,
        removeObject:removeObject,
        addObjectAt:addObjectAt,
        getObjectAt:getObjectAt,
        hasObject:hasObject,
        // Layers
        addLayer:addLayer,
        addLayerAt:addLayerAt,
        removeLayer:removeLayer,
        removeLayerAt:removeLayerAt,
        // Debug
        debug:debug,
        // temp
        addTempObject:addTempObject
    };
}();