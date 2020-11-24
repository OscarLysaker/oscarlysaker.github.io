//#################//
//##|   Timer   |##//
//#################//

function Timer (callback, delayMs, times) {
    if (times == undefined) times = -1;
    if (delayMs == undefined) delayMs = 10;
    
    this.callback = callback;
    var times = times;
    var timesCount = 0;
    var ticks = (delayMs / 1) | 0;
    var count = 0;
    Timer.instances.push(this);

    this.tick = function () {
        if (count >= ticks) {
            this.callback();
            count = 0;
            if (times > -1) {
                timesCount++;
                if (timesCount >= times) this.stop();
            }
        }
        count++;
    };

    this.stop = () => Timer.instances.splice(Timer.instances.indexOf(this), 1);
}
Timer.instances = [];
Timer.onTick = function () { for (var i in Timer.instances) Timer.instances[i].tick(); }
window.setInterval(Timer.onTick, 1);