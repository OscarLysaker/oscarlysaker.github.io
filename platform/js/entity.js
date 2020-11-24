var entity = function () {

    var TYPE = {
        ENTITY : 'entity',
        ITEM : 'item',
        CHAR : 'char',
        WALL : 'wall',
        PARTICLES : 'particles',
        GRAPHICS : 'graphics'
    }

    var all = [];
    var uniqueIdCounter = -1;
    var getUniqueId = () => uniqueIdCounter++;

    class Entity {

        constructor (name, sprite, type=TYPE.ENTITY) {
            all.push(this);
            this.sprite = (sprite) ? sprite : new renderObjects.Rect(0, 0, 40, 40, "#00ffff", null, null);
            this.sprite.entity = this;
            this.id = getUniqueId();
            this.name = (name) ? name : `Entity:${this.id}`;
            this._type = type; this.type = type;

            // Sprite offset
            this.spriteOffset = {x:0, y:0};

            // Controllers
            this.controller = null;
            this.onControllerAdded = () => {}
            this.onControllerRemoved = () => {}

            // Entity events
            this.onAdd = () => {}
            this.onRemove = () => {}

            // States
            this.destroyed = false;
            this.removed = false;
        }

        // Position getters & setters
        get x () { return this.sprite.x; }
        set x (v) { return this.sprite.x = v; }
        get y () { return this.sprite.y; }
        set y (v) { return this.sprite.y = v; }
        get xInt () { return this.sprite.xInt; }
        get yInt () { return this.sprite.yInt; }

        // Size getters & setters
        get width () { return this.sprite.width || this.sprite.radius ? this.sprite.width ? this.sprite.width : this.sprite.radius*2 : 0; }
        set width (v) { return this.sprite.width || this.sprite.radius ? this.sprite.width ? this.sprite.width = v : this.sprite.radius = v*0.5 : 0; }
        get height () { return this.sprite.height || this.sprite.radius ? this.sprite.height ? this.sprite.height : this.sprite.radius*2 : 0; }
        set height (v) { return this.sprite.height || this.sprite.radius ? this.sprite.height ? this.sprite.height=v : this.sprite.radius=v*0.5 : 0; }
        get widthInt () { return this.sprite.widthInt || this.radiusInt ? this.sprite.widthInt ? this.sprite.widthInt : this.sprite.radiusInt*2 : 0; }
        get heightInt () { return this.sprite.heightInt || this.radiusInt ? this.sprite.heightInt ? this.sprite.heightInt : this.sprite.radiusInt*2 : 0; }

        // Bounds getter
        get bounds () {return this.sprite.width || this.sprite.radius ? this.sprite.width ? {x:this.sprite.x, y:this.sprite.y, width:this.sprite.width, height:this.height} : {x:this.sprite.x-this.sprite.radius, y:this.sprite.y-this.sprite.radius, width:this.sprite.radius*2, height:this.sprite.radius*2} : {x:this.sprite.x, y:this.sprite.y, width:0, height:0}; }
        get boundsInt () {return this.sprite.widthInt || this.sprite.radiusInt ? this.sprite.widthInt ? {x:this.sprite.xInt, y:this.sprite.yInt, width:this.sprite.widthInt, height:this.heightInt} : {x:this.sprite.xInt-this.sprite.radiusInt, y:this.sprite.yInt-this.sprite.radiusInt, width:this.sprite.radiusInt*2, height:this.sprite.radiusInt*2} : {x:this.sprite.xInt, y:this.sprite.yInt, width:0, height:0}; }

        // Properties getters
        get isSolid () { return this._isSolid; }
        get isDynamic () { return this._isDynamic; }
        get collidable () { return this._collidable; }
        get canPickup () { return this._canPickup; }
        get canInteract () { return this._canInteract; }

        // Type getter & setter
        get type () { return this._type; }
        set type (t) {
            this._isSolid=false; this._isDynamic=false; this._collidable=false;
            this._canPickup=false; this._canInteract=false;
            switch (t) {
                case TYPE.CHAR: this._isDynamic=true; this._collidable=true; break;
                case TYPE.ITEM: this._isDynamic=true; this._collidable=true; this._canPickup=true; break;
                case TYPE.WALL: this._isSolid=true; this._collidable=true; break;
                case TYPE.PARTICLES: this._isDynamic=true; break;
                case TYPE.GRAPHICS: break;
                default: return;
            }
            this._type = t;
        }

        // Collide triggers
        onCollision (other, bounds) {}

        // Tick function
        onTick () {}

        add () {
            if (all.indexOf(this) >= 0) return;
            else all.push(this);
            if (world) world.addEntity(this);
        }

        // Remove
        remove () { this.removed = true; }

        // Destroy
        destroy () { this.destroyed = true; }

        // Cleanup
        _remove (removeFromWorld=true) {
            if (this.sprite) this.sprite.remove();
            all.splice(all.indexOf(this), 1);
            if (removeFromWorld) world.removeEntity(this);
        }
        _destroy (removeFromWorld=true) {
            this._remove(removeFromWorld);
            if (this.controller) this.controller.destroy();
        }
    }

    class DynamicEntity extends Entity {
        constructor (name, sprite, type) {
            super(name, sprite, type);

            this.maxSpeed = 8;
            this.acc = 0.3;
            this.fric = 0.92;

            this.vx = 0;
            this.vy = 0;
            this.gy = 0;

            this.canMove = {up:false, down:false, left:false, right:false};
        }

        // Collide triggers
        onCollision (other, bounds) {
            super.onCollision(other, bounds);

            var boundsSelf = this.bounds;

            render.addTempObject(new renderObjects.Rect(bounds.x, bounds.y, bounds.width, bounds.height, "#ffff00"));

            this.canMove.left = true;
            this.canMove.right = true;
            this.canMove.up = true;
            this.canMove.down = true;

            if (bounds.x == boundsSelf.x && bounds.x + bounds.width == boundsSelf.x + boundsSelf.width) {
                // Collision Vertical
                if (bounds.y == boundsSelf.y) {
                    // Collision up
                    this.y += bounds.height;
                    this.canMove.up = false;
                } else if (bounds.y + bounds.height == boundsSelf.y + boundsSelf.height) {
                    // Collision down
                    this.y -= bounds.height;
                    this.canMove.down = false;
                }
            } else if (bounds.y == boundsSelf.y && bounds.y + bounds.height == boundsSelf.y + boundsSelf.height) {
                // Collision Horizontal
                if (bounds.x == boundsSelf.x) {
                    // Collision left
                    this.x += bounds.width;
                    this.canMove.left = false;
                } else if (bounds.x + bounds.width == boundsSelf.x + boundsSelf.width) {
                    // Collision right
                    this.x -= bounds.width;
                    this.canMove.right = false;
                }   
            } else if (bounds.x == boundsSelf.x) {
                // Collision left
                if (bounds.y == boundsSelf.y) {
                    // Collision left & up
                    if (bounds.width < bounds.height) { this.x += bounds.width; this.canMove.left = false; }
                    else { this.y += bounds.height; this.canMove.up = false; }
                } else if (bounds.y + bounds.height == boundsSelf.y + boundsSelf.height) {
                    // Collision left & down
                    if (bounds.width < bounds.height) { this.x += bounds.width; this.canMove.left = false; }
                    else { this.y -= bounds.height; this.canMove.down = false; }
                }
            } else if (bounds.x + bounds.width == boundsSelf.x + boundsSelf.width) {
                // Collision right
                if (bounds.y == boundsSelf.y) {
                    // Collision right & up
                    if (bounds.width < bounds.height) { this.x -= bounds.width; this.canMove.right = false; }
                    else { this.y += bounds.height; this.canMove.up = false; }
                } else if (bounds.y + bounds.height == boundsSelf.y + boundsSelf.height) {
                    // Collision right & down
                    if (bounds.width < bounds.height) { this.x -= bounds.width; this.canMove.right = false; }
                    else { this.y -= bounds.height; this.canMove.down = false; }
                }
            }
        }

        onTick () {
            //super.onTick();

            if (this.controller) {
                this.controller.onTick();
                
                if (!this.controller.states.grounded && this.spriteOffset.y > 0) {
                    this.controller.states.grounded = true;
                    this.controller.states.jumped = false;
                    this.spriteOffset.y = 0;
                    this.gy = 0;
                } else if (!this.controller.states.grounded && this.spriteOffset.y < 0) {
                    if (this.gy < this.maxSpeed) this.gy += this.acc;
                }
            }

            this.spriteOffset.y += this.gy;

            this.x += this.vx;
            this.y += this.vy;

            this.vx *= this.fric;
            this.vy *= this.fric;

            if (this.vx < 0.1 && this.vx > -0.1) this.vx = 0;
            if (this.vy < 0.1 && this.vy > -0.1) this.vy = 0;
        }
    }

    class TimedEntity extends DynamicEntity {

        constructor (name, sprite, type=TYPE.CHAR, ms=100) {
            super(name, sprite, type);

            this._timerActive = false;
            this._previousTime = 0;
            this._timeCounter = 0;
            this._timerGoal = ms;
            this.onAdd = () => {
                this.activateTimer();
            }

            this.onTimerEnd = (ent) => {}
        }

        get timerActive () { return this._timerActive; }

        setNewTimer (ms=100, callback) {
            this._timerGoal = ms;
            if (callback) this.onTimerEnd = callback;
            this.activateTimer();
        }

        activateTimer () {
            console.log("Activated timer");
            if (this._timerActive) return;
            this._timerActive = true;
            this._previousTime = Date.now();
            this._timeCounter = 0;
        }

        onTick () {
            if (!this._timerActive) return;

            var currentTime = Date.now();
            this._timeCounter += currentTime - this._previousTime;
            this._previousTime = currentTime;
            if (this._timeCounter >= this._timerGoal) {
                this._timerActive = false;
                this.onTimerEnd(this);
            }
        }
    }

    class Player extends DynamicEntity {
        constructor (name, sprite, type) {
            super(name, sprite, type);
        }
    }

    class Pickup extends DynamicEntity { 
        constructor (name, sprite, type, triggerEntity=null) {
            super(name, sprite, type);
            this.triggerEntity = triggerEntity;
            this.onPickup = () => {}
        }

        onCollision (other, bounds) {
            if (other == this.triggerEntity) {
                this.destroy();
                this.onPickup();
            }
        }

        onTick () {
            super.onTick();
        }
    }

    return {
        all:all,
        TYPE:TYPE,
        Entity:Entity,
        DynamicEntity:DynamicEntity,
        TimedEntity:TimedEntity,
        Player:Player,
        Pickup:Pickup
    }
}();