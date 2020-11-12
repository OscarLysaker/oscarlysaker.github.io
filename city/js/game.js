function Game (cityName="New City", onTick=()=>{}, onDay=()=>{}, onMonth=()=>{}, onYear=()=>{}) {
    this.onTick = onTick;
    this.onDay = onDay;
    this.onMonth = onMonth;
    this.onYear = onYear;

    this.city = new entity.City(cityName, this.onTick, this.onDay, this.onMonth, this.onYear);
}

var gameData = function () {
    var game = new Game();

    return {
        game:game
    };
}();

var gameHandler = function () {
    
    function restart () {
        // Reset everything
        gameData.game = new Game();
    }

    return {
        restart:restart
    };
}();