var input = function () {

    var x = 0;
    var y = 0;
    var leftDown = false;
    var middleDown = false;
    var rightDown = false;

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointerup', onPointerUp);

    function onPointerMove (e) {
        x = e.clientX;
        y = e.clientY;
    }

    function onPointerDown (e) {
        switch (e.button) {
            case 0: leftDown = true; break;
            case 1: middleDown = true; break;
            case 2: rightDown = true; break;
            default:
        }
        callDownListeners(x, y);
    }

    function onPointerUp (e) {
        switch (e.button) {
            case 0: leftDown = false; break;
            case 1: middleDown = false; break;
            case 2: rightDown = false; break;
            default:
        }
        callUpListeners(x, y);
    }

    var downCallbacks = [];
    var upCallbacks = [];
    function addDownListener(callback){if(downCallbacks.indexOf(callback)<0)downCallbacks.push(callback);}
    function removeDownListener(callback){if(downCallbacks.indexOf(callback)>=0)downCallbacks.splice(downCallbacks.indexOf(callback),1);}
    function addUpListener(callback){if(upCallbacks.indexOf(callback)<0)upCallbacks.push(callback);}
    function removeUpListener(callback){if(upCallbacks.indexOf(callback)>=0)upCallbacks.splice(upCallbacks.indexOf(callback),1);}
    function callDownListeners(x, y){for(var i=0,j=downCallbacks.length;i<j;i++)downCallbacks[i](x, y);}
    function callUpListeners(x, y){for(var i=0,j=upCallbacks.length;i<j;i++)upCallbacks[i](x, y);}

    return {
        x:x,
        y:y,
        leftDown:leftDown,
        rightDown:rightDown,
        middleDown:middleDown,
        addDownListener:addDownListener,
        addUpListener:addUpListener,
        removeDownListener:removeDownListener,
        removeUpListener:removeUpListener
    };
}();