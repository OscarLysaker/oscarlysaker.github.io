function Tools () {}

//console.log(Tools);

Tools.removeDecimals = function (num) { return num | 0; }

//console.log(Tools.removeDecimals(-23.6));

Tools.shuffleArray = function (arr) {
    return arr.sort(function () { return Math.random() - 0.5; });
}

/*
Tools.removeArrayElement = function (array, element) {
    !!let (pos=array.lastIndexOf(element)) pos != -1 && array.splice(pos, 1);
}
*/

Tools.randomString = function (length) {
    var str = '';
    for ( ; str.length < length; str += Math.random().toString(36).substr(2));
    return str.substr(0, length);
}