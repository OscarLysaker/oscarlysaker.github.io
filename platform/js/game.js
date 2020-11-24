var game = function () {

    // Init game
    var root = document.getElementById('game-root');
    render.init(root);

    world.addEntity(new entity.Entity("Test Entity 1", new renderObjects.Particles(100, 100, 2, 100, 100, 0.5, 100, "#ff0000"), entity.TYPE.PARTICLES));
    world.addEntity(new entity.Entity("Test Entity 2", new renderObjects.Particles(250, 250, 5, 500, 200, 1.0, 200, "#990033"), entity.TYPE.PARTICLES));
    world.addEntity(new entity.Entity("Test Entity 3", new renderObjects.Particles(400, 400), entity.TYPE.PARTICLES));

    var player = new entity.DynamicEntity("Player", new renderObjects.Rect(20, 20, 40, 40, "#4488ff"), entity.TYPE.CHAR);
    world.addEntity(player);
    controllers.createPlayerController(player);

    var walls = [];
    walls.push(new entity.Entity("Wall", new renderObjects.Rect(300, 300, 80, 80, "#2266dd"), entity.TYPE.WALL));
    walls.push(new entity.Entity("Wall", new renderObjects.Rect(260, 380, 40, 40, "#2266dd"), entity.TYPE.WALL));
    
    for (var i=0, j=walls.length; i<j; i++) world.addEntity(walls[i]);

    function onTick () {
        world.tick();
    }

    var gameTickIndex = new Timer(onTick, 2);

    input.addUpListener((x, y) => {
        console.log(`Added temp entity at (x=${x}, y=${y})`);

        //addTempCircle(x, y);
        addTempPickup(x, y);
    });

    function addTempPickup (x, y) {
        var tempEnt = new entity.Pickup("Temp Pickup", new renderObjects.Rect(x, y, 20, 20, "#ff9900"), entity.TYPE.ITEM, player);
        tempEnt.onPickup = () => {
            console.log("Picked up apple!");
            console.log("Aaaand gave you a speed booost!");
            tempEnt.triggerEntity.vx*=10;
            tempEnt.triggerEntity.vy*=10;
        }
        world.addEntity(tempEnt);
    }

    function addTempCircle (x, y) {
        var tempEnt = new entity.TimedEntity("Temp Entity", new renderObjects.Circle(x, y, 10, "#ff0000"), entity.TYPE.CHAR, 2000);
        tempEnt.onTimerEnd = (ent) => {
            ent.destroy();
        }
        world.addEntity(tempEnt);
    }

    return {
        root:root
    };
}();