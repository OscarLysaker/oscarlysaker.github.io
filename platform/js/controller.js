var controllers = function () {

    var ACTIONS = {
        MOVE : 'move',
        JUMP : 'jump',
        DESTROY : 'destroy',
        ATTACK : 'attack',
        TAKE_DAMAGE : 'take-damage',
        ANIMATION : 'animation',
        STATE_CHANGE : 'state-change'
    }

    //###########################//
    //##|   Base Controller   |##//
    //###########################//

    var uniqueIdCounter = -1;
    var getUniqueId = () => uniqueIdCounter++;
    var all = [];

    class Controller {
        constructor (entity) {
            this.id = getUniqueId();
            this.entity = entity;
            this.active = true;

            if (this.entity) {
                this.entity.controller = this;
                this.entity.onControllerAdded();
            }

            this.actions = {
                left : false,
                right : false,
                up : false,
                down : false,
                jump : false,
                attack : false,
                sprint : false
            }

            this.states = {
                grounded : true,
                jumped : false
            }
        }

        destroy () {
            if (all.indexOf(this) >= 0) all.splice(all.indexOf(this), 1);
            if (this.entity) {
                this.entity.controller = null;
                this.entity.onControllerRemoved();
                this.entity = null;
            }
        }
        onAction (action) { 
            //console.log(`Entity received action request [${action}]!`); 
        }
        onTick () {}
    }

    //##########################//
    //##|   NPC Controller   |##//
    //##########################//

    var maxNpcControllers = -1;
    var npcControllers = [];

    class NpcController extends Controller {
        constructor (entity) {
            super(entity);
            npcControllers.push(this);
        }

        destroy () {
            if (npcControllers.indexOf(this) >= 0) npcControllers.splice(npcControllers.indexOf(this), 1);
            super.destroy();
        }
    }

    function createNpcController (entity) {
        if (maxNpcControllers != -1 && npcControllers.length < maxNpcControllers) {
            console.log(`Cannot create new npcController, max amount of npcControllers (${maxNpcControllers}) has been reached...`);
            return null;
        }
        return new NpcController(entity);
    }

    //#############################//
    //##|   Player Controller   |##//
    //#############################//

    var maxPlayerControllers = 4;
    var playerControllers = [];

    class PlayerController extends Controller {
        constructor (entity) {
            super(entity);
            playerControllers.push(this);
        }

        get index () { return playerControllers.indexOf(this); }

        onKeyDown (e) {
            switch (e.keyCode) {
                case 37: this.actions.left = true; break;   // Left
                case 38: this.actions.up = true; break;     // Up
                case 39: this.actions.right = true; break;  // Right
                case 40: this.actions.down = true; break;   // Down
                case 32: this.actions.jump = true; break;   // Space
                default:
            }
        }

        onKeyUp (e) {
            switch (e.keyCode) {
                case 37: this.actions.left = false; break;  // Left
                case 38: this.actions.up = false; break;    // Up
                case 39: this.actions.right = false; break; // Right
                case 40: this.actions.down = false; break;  // Down
                default:
            }
        }

        onKeyPress (e) {}

        onTick () {
            super.onTick();
            
            // Check move
            if (this.actions.left || this.actions.right || this.actions.up || this.actions.down) {
                var moveX = 0;
                var moveY = 0;
                if (this.actions.left && !this.actions.right) moveX = -1;
                else if (!this.actions.left && this.actions.right) moveX = 1;
                if (this.actions.up && !this.actions.down) moveY = -1;
                else if (!this.actions.up && this.actions.down) moveY = 1;
                this.onAction(ACTIONS.MOVE, moveX, moveY);
            }

            // Check jump
            if (this.actions.jump) {
                if (this.states.grounded && !this.states.jumped) {
                    this.onAction(ACTIONS.JUMP);
                    this.states.grounded = false;
                    this.states.jumped = true;
                }
                this.actions.jump = false;
            }
        }

        onAction (action) {
            super.onAction(action);
            var args = Array.prototype.slice.call(arguments).slice(1);
            switch (action) {
                case ACTIONS.MOVE:
                    var moveX = args[0];
                    var moveY = args[1];
                    if (this.entity && this.entity.sprite) {

                        moveX *= this.entity.acc;
                        moveY *= this.entity.acc;

                        this.entity.vx += moveX;
                        this.entity.vy += moveY;

                        if (this.entity.vx > this.entity.maxSpeed) this.entity.vx = this.entity.maxSpeed;
                        else if (this.entity.vx < -this.entity.maxSpeed) this.entity.vx = -this.entity.maxSpeed;
                        else if (this.entity.vy > this.entity.maxSpeed) this.entity.vy = this.entity.maxSpeed;
                        else if (this.entity.vy < -this.entity.maxSpeed) this.entity.vy = -this.entity.maxSpeed;
                    }
                    break;
                case ACTIONS.JUMP:
                    if (this.entity && this.entity.sprite) {
                        this.states.jumped = false;
                        this.entity.gy = -this.entity.maxSpeed;
                        this.entity.spriteOffset.y += this.entity.gy;
                    }
                    break;
                default:
            }
        }

        destroy () {
            if (playerControllers.indexOf(this) >= 0) playerControllers.splice(playerControllers.indexOf(this), 1);
            super.destroy();
        }
    }

    function createPlayerController (entity) {
        if (playerControllers.length > maxPlayerControllers) {
            console.log(`Cannot create new playerController, max amount of playerControllers (${maxPlayerControllers}) has been reached...`);
            return null;
        }
        return new PlayerController(entity);
    }

    //##################//
    //##|   Events   |##//
    //##################//

    function onKeyDown(e){for(var i=0,j=playerControllers.length;i<j;i++)playerControllers[i].onKeyDown(e);}
    function onKeyUp(e){for(var i=0,j=playerControllers.length;i<j;i++) playerControllers[i].onKeyUp(e);}
    function onKeyPress(e){for(var i=0,j=playerControllers.length;i<j;i++) playerControllers[i].onKeyPress(e);}

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    document.addEventListener('keypress', onKeyPress);

    return {
        createPlayerController:createPlayerController,
        createNpcController:createNpcController
    };
}();