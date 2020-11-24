var world = function () {
    
    var entities = [];

    function addEntity (entity) {
        if (!entity || entities.indexOf(entity) >= 0) return false;
        entities.push(entity);
        if (entity.sprite) render.addObject(entity.sprite);
        entity.onAdd();
        return true;
    }

    function getEntityAt (index) {
        return (entities[index]) ? entities[index] : null;
    }

    function removeEntity (entity) {
        if (!entity || entities.indexOf(entity) < 0) return false;
        entities.splice(entities.indexOf(entity), 1);
        entity.remove();
        entity.onRemove();
        return true;
    }

    function removeEntityAt (index) {
        if (!entities[index]) return false;
        entities[index].remove();
        entities.splice(index, 1);
        return true;
    }

    //###############################//
    //##|   Entity List Getters   |##//
    //###############################//

    function getCollidable () {
        var list = [];
        var arr = entities;
        for (var i=0, j=arr.length; i<j; i++) {
            if (arr[i].isDynamic && arr[i].collidable) list.push(arr[i]);
        }
        return list;
    }

    function getSolidCollidable () {
        var list = [];
        var arr = entities;
        for (var i=0, j=arr.length; i<j; i++) {
            if ((!arr[i].isDynamic && arr[i].collidable && arr[i].isSolid) || arr[i].canPickup) list.push(arr[i]);
        }
        return list;
    }

    function getCollisionData () {
        return {col:getCollidable(), sol:getSolidCollidable()};
    }

    //######################//
    //##|   Collisions   |##//
    //######################//

    function handleCollisions () {
        var ents = getCollisionData();
        if (ents.sol.length == 0) return;
        var calls = [];
        for (var i1=0, j1=ents.col.length; i1<j1; i1++) {
            var ent = ents.col[i1];
            var b1 = ent.bounds;
            for (var i2=0, j2=ents.sol.length; i2<j2; i2++) {
                if (ents === ents.sol[i2]) continue;
                var b2 = ents.sol[i2].bounds;
                if (b1.x < b2.x + b2.width && b1.x + b1.width > b2.x && b1.y < b2.y + b2.height && b1.y + b1.height > b2.y) {
                    calls.push({ent:ent, sol:ents.sol[i2], bounds:{
                        x: (b1.x > b2.x) ? b1.x : b2.x,
                        y: (b1.y > b2.y) ? b1.y : b2.y,
                        width: (b1.x > b2.x) ? (b1.width < b2.width + b2.x - b1.x) ? b1.width : b2.width + b2.x - b1.x : (b2.width < b1.width + b1.x - b2.x) ? b2.width : b1.width + b1.x - b2.x,
                        height: (b1.y > b2.y) ? (b1.height < b2.height + b2.y - b1.y) ? b1.height : b2.height + b2.y - b1.y : (b2.height < b1.height + b1.y - b2.y) ? b2.height : b1.height + b1.y - b2.y,
                    }});
                }
            }
        }

        for (var i=0, j=calls.length; i<j; i++) {
            if (calls[i].ent.onCollision && calls[i].sol.isSolid) calls[i].ent.onCollision(calls[i].sol, calls[i].bounds);
            if (calls[i].sol.onCollision) calls[i].sol.onCollision(calls[i].ent, calls[i].bounds);
        }
    }

    //###################//
    //##|   Updates   |##//
    //###################//

    function tick () {

        var ents = entities;
        var indexOffset = 0;

        // Update entities
        for (var i=0, j=ents.length; i<j; i++) {
            ents[i-indexOffset].onTick();
            if (ents[i-indexOffset].removed) {
                ents[i-indexOffset]._remove(false);
                ents.splice(i-indexOffset, 1);
                indexOffset++;
            } else if (ents[i-indexOffset].destroyed) {
                ents[i-indexOffset]._destroy(false);
                ents.splice(i-indexOffset, 1);
                indexOffset++;
            }
        }

        handleCollisions();
    }
    
    return {
        entities:entities,
        addEntity:addEntity,
        getEntityAt:getEntityAt,
        removeEntity:removeEntity,
        removeEntityAt:removeEntityAt,
        handleCollisions:handleCollisions,
        tick:tick
    };
}();