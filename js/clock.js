let clockRoot = null, clockRootDigits = null;
let clockDigitSpans = [];
let clockTime = [0,0, 0,0, 0,0];
let clockElapsed = null;
let clockTimeout = null;
let clockPaused = false;
let clockOffsetPaused = 0;
let clockLastTimeStamp = 0;

function clockInit (root=null, showButtons=false) {
    if (root == null) return;

    clockRoot = root;
    clockRoot.setAttribute("data-clock-root-container", "");
    
    clockRootDigits = document.createElement("div");
    clockRootDigits.setAttribute("id", "clock-root-digits");
    clockRoot.append(clockRootDigits);

    clockDigitSpans.push(getDigitSpan("clock-hours-tens"));
    clockDigitSpans.push(getDigitSpan("clock-hours-ones"));
    addDigitSpacer(clockRootDigits);
    clockDigitSpans.push(getDigitSpan("clock-minutes-tens"));
    clockDigitSpans.push(getDigitSpan("clock-minutes-ones"));
    addDigitSpacer(clockRootDigits);
    clockDigitSpans.push(getDigitSpan("clock-seconds-tens"));
    clockDigitSpans.push(getDigitSpan("clock-seconds-ones"));

    function getDigitSpan (id) {
        let clockSpan = document.createElement("span");
        clockSpan.setAttribute("class", "clock-digits");
        clockSpan.setAttribute("id", id);
        clockSpan.setAttribute("data-digit-position", "0");
        for (let i = 0; i < 10; i++) {
            let divObj = document.createElement("div");
            divObj.innerText = i;
            clockSpan.append(divObj);
        }
        clockRootDigits.append(clockSpan);
        return clockSpan;
    }

    function addDigitSpacer (root) {
        let newSpacer = document.createElement("span");
        newSpacer.setAttribute("class", "clock-digit-spacer");
        newSpacer.innerText = ":";
        root.append(newSpacer);
    }

    let tempFader = document.createElement("div");
    tempFader.setAttribute("class", "fade");
    clockRoot.append(tempFader);

    // Buttons
    if (showButtons) {
        createControlButton("Start", "clock-button-start", () => { clockStart(); });
        createControlButton("Pause", "clock-button-pause", () => { clockPause(); });
        createControlButton("Reset", "clock-button-reset", () => { clockReset(); });

        function createControlButton (label, id, callBack) {
            let tempButton = document.createElement("button");
            tempButton.setAttribute("id", id);
            tempButton.innerText = label;
            tempButton.onclick = () => { callBack(); };
            root.append(tempButton);
        }
    }

    clockReset();
}

function clockStart () {
    if (clockElapsed != null) return;

    // If paused or reset, restart it
    if (clockPaused) clockPause();
    else {
        clockLastTimeStamp = Date.now();
        clockElapsed = setInterval(function () { clockTick(); }, 1000);
    }
}

function clockPause () {
    // If not running and not paused, return
    if (!clockPaused && clockElapsed == null) return;

    // Unpause timer
    if (clockPaused && clockElapsed == null) {
        clockPaused = false;
        clockLastTimeStamp = Date.now();
        console.log("Timer started with offset: " + clockOffsetPaused);
        setTimeout(() => {
            clearTimeout(clockTimeout);
            clockTimeout = null;
            clockOffsetPaused = 0;
            clockTick();
            clockElapsed = setInterval(function () { clockTick(); }, 1000);
        }, clockOffsetPaused);
        return;
    }

    // Pause timer
    clearInterval(clockElapsed);
    clockElapsed = null;
    clockPaused = true;
    if (clockTimeout != null) {
        clearTimeout(clockTimeout);
        clockTimeout = null;
        clockOffsetPaused -= (Date.now() - clockLastTimeStamp);
        if (clockOffsetPaused < 0) clockOffsetPaused = 0;
    } else {
        clockOffsetPaused = 1000 - (Date.now() - clockLastTimeStamp);
    }
}


function clockReset () {
    if (clockElapsed == null) return;
    clearTimeout(clockTimeout);
    clockTimeout = null;
    clearInterval(clockElapsed);
    clockElapsed = null;
    clockPaused = false;
    clockTime = [0,0, 0,0, 0,0]
    clockLastTimeStamp = 0;
    clockOffsetPaused = 0;
    clockDigitSpans.forEach((value, key, parent) => { value.setAttribute("data-digit-position", 0); });
}

function clockTick () {
    clockLastTimeStamp = Date.now();
    if (clockTime[5] == 9) { clockTime[5] = 0;
        if (clockTime[4] == 5) { clockTime[4] = 0;
            if (clockTime[3] == 9) { clockTime[3] = 0;
                if (clockTime[2] == 5) { clockTime[2] = 0;
                    if (clockTime[1] == 9) { clockTime[1] = 0;
                        if (clockTime[0] == 9) clockTime = [0,0, 0,0, 0,0];
                        else clockTime[0]++;
                    } else clockTime[1]++;
                } else clockTime[2]++;
            } else clockTime[3]++;
        } else clockTime[4]++;
    } else clockTime[5]++;

    for (let i = 0; i < clockDigitSpans.length; i++) {
        clockDigitSpans[i].setAttribute("data-digit-position", String(clockTime[i]));
    }
}

function clockGetTime () { return {hours: clockTime[0] * 10 + clockTime[1], minutes: clockTime[2] * 10 + clockTime[3], seconds: clockTime[4] * 10 + clockTime[5]}; }