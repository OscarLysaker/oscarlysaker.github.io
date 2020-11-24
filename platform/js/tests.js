class TestClass {
    constructor (name) {
        this.name = name;
    }
}

class TestClass2 extends TestClass {
    constructor (name) {
        super(name);
        this.age = 12;
    }

    sayName () {
        console.log(`My name is ${this.name}, and my age is ${this.age}!`);
    }
}

var testing = new TestClass2("Martin");
testing.sayName();

var testFunctionClass = function () {

    class TestClass {
        constructor (name) {
            this.name = name;
            this.friends = ["Kayla", "Benjamin", "Alex"];
            this.states = {
                tired : true,
                thirsty : false,
                hungry : true
            }
        }
    }
    
    class TestClass2 extends TestClass {
        constructor (name) {
            super(name);
            this.age = 12;
            this.friends.push("Harris");
            this.states.hungry = false;
            this.states.dizzy = false;
        }
    
        sayName () {
            console.log(`My name is ${this.name}, and my age is ${this.age}!`);
        }

        sayFriends () {
            console.log(`Here is a list of my friends: ${this.friends}`);
        }

        listStates () {
            console.log(this.states.tired ? `I am reeeally tired...` : "I am not tired right now...");
            console.log(this.states.thirsty ? `I am thirsty...` : "I am not thirsty right now...");
            console.log(this.states.hungry ? `I am hungry beyond words...` : "I am not hungry right now...");
            console.log(this.states.dizzy ? `I am dizzy to the point of falling...` : "I am not dizzy right now...");
        }
    }
    
    var testing = new TestClass2("Martin");
    testing.sayName();
    testing.sayFriends();
    testing.listStates();

    return{

    };
}();