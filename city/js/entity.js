//##################//
//##|   Entity   |##//
//##################//

var entity = function () {

    // Entity list
    var all = [];
    var removeQueue = [];

    // UID
    var idCount = -1;
    function getNextId () {
        idCount++;
        return idCount;
    }

    var TYPE = {
        UNKNOWN : 'unknown',
        ENTITY : 'entity',
        PERSON : 'person',
        STRUCTURE : 'structure',
        GOVERNMENT : 'government',
        WORKPLACE : 'workplace',
        HOUSING : 'housing',
        INDUSTRIAL : 'industrial',
        COMMERCIAL : 'commercial',
        MEDICINAL : 'medicinal',
        POLICING : 'policing',
        FIRE : 'fire',
        EDUCATION : 'education',
        CITY : 'city'
    }

    var PROPERTIES = {
        ENTITY : 'entity',
        PERSON : 'person',
        POPULATION : 'population',
        WORKERS : 'workers',
        CARETAKERS : 'caretakers',
        BUILDINGS : 'buildings',
        HOUSING : 'housing',
        CITY : 'city',
        STRUCTURE : 'structure',
        BUILDINGS : 'buildings',
        CARETAKERS : 'caretakers',
        WORKPLACE : 'workplace',
        CAREPLACE : 'careplace',
        INDUSTRIAL : 'industrial',
        COMMERCIAL : 'commercial'
    }

    var people = {
        maxMotivation : 100,
        minMotivation : 0,
        maxHealth : 100,
        minHealth : 0,
        maxHappiness : 100,
        minHappiness : 0
    }

    function Entity (name='Entity', type=TYPE.ENTITY, properties=[], onTick=()=>{}, onDay=()=>{}, onMonth=()=>{}, onYear=()=>{}) {
        this.name = name;
        this.id = getNextId();
        this.type = type;
        this.properties = new Set([PROPERTIES.ENTITY]);

        this.addProperty = () => {
            for (var i=0, j=arguments.length; i<j; i++) {
                if (Array.isArray(arguments[i])) {
                    for (var ii=0, jj=arguments[i].length; ii<jj; ii++) {
                        if (!this.properties.has(arguments[ii])) this.properties.add(arguments[ii]);
                    }
                } else if (!this.properties.has(arguments[i])) this.properties.add(arguments[i]);
            }
        }

        this.addProperty(properties);

        this.onTick = onTick;
        this.onDay = onDay;
        this.onMonth = onMonth;
        this.onYear = onYear;

        this.toString = () => {
            return `Entity(${this.name}:${this.id})`;
        }

        this.toMultiString = () => {
            return this.toString();
        }

        this.destory = () => {
            if (all.indexOf(this) < 0) return false;
            removeQueue.push(this);
            return true;
        }

        all.push(this);
    }

    function City (name='New City', type=TYPE.CITY, properties, onTick, onDay, onMonth, onYear) {
        Entity.call(this, name, type, properties, onTick, onDay, onMonth, onYear);
        this.properties.add(PROPERTIES.CITY);

        this.name = name;
        this.population = [];
        this.structures = [];

        this.dynamics = {
            balance : {
                population : 0.5,
                commercial : 0.5,
                industrial : 0.5
            },
            incentive : {
                population : 1.0,
                commercial : 1.0,
                industrial : 1.0
            },
            modifier : {
                population : 0.6,
                commercial : 0.2,
                industrial : 0.2
            },
            maxGrowth : {
                population : () => {
                    return Math.floor((this.population.length + 1000) * 0.005);
                }
            }
        }

        this.onTick = () => {

            var peopleToAdd = 0;
            if (this.dynamics.balance.population * this.dynamics.incentive.population < 0.6) {
                // Can add people
                console.log("City can add people...");
                if (Math.random() * this.dynamics.modifier.population > 0.5) {
                    peopleToAdd = Math.floor(Math.random() * this.dynamics.maxGrowth.population());
                }
            }
            for (var i=0, j=peopleToAdd; i<j; i++) {
                var persona = peoplePersona.getRandomPersona();
                this.population.push(new entity.Person(persona.firstName, persona.lastName, 30));
            }

            onTick();

            PersonLoop:
            for (var ia=0, ja=this.population.length; ia<ja; ia++) {
                var person = this.population[ia];
                if (person.home == null) {
                    StructureLoop:
                    for (var ib=0, jb=this.structures.length; ib<jb; ib++) {
                        if (this.structures[ib].structure.type == TYPE.HOUSING) {
                            var housing = this.structures[ib].structure;
                            if (!housing.addPerson(person)) continue StructureLoop;
                            else continue PersonLoop;
                        }
                        if (ib >= jb-1) break PersonLoop;
                    }
                }
            }
        }

        //------------------//
        //  Default values  //
        //------------------//

        this.taxValues = {
            population : 0.20,
            industrial : 0.32,
            commercial : 0.32
        }
    }

    function Person (firstName='FirstName', lastName='LastName', age=30, onTick, onDay, onMonth, onYear) {
        Entity.call(this, 'Person', TYPE.PERSON, [PROPERTIES.PERSON], onTick, onDay, onMonth, onYear);
        this.firstName = firstName;
        this.lastName = lastName;
        this.fullName = () => `${this.firstName} ${this.lastName}`;
        this.age = age;

        //------------------//
        //  Default values  //
        //------------------//

        // Budget
        this.savings = 0;
        this.income = 0;

        // Structures
        this.home = null;
        this.workplace = null;
        this.careplace = null;
        this.policing = {
            sentenced : false,
            sentenceLength : 0,
            sentenceServed : 0,
            facility : null
        }
        this.schooling = {
            studying : false,
            degreeLength : 0,
            degreeProgress : 0,
            facility : null
        }
        this.medicinal = {
            illnesses : [],
            sicknesses : [],
            facility : null,
            healthTarget : 0,
            healing : false
        }
        
        // Stats
        this.motivation = 50; // 0 - 100
        this.health = 100; // 0 - 100
        this.happiness = 50; // 0 - 100

        this.toString = () => {
            return `Entity(${this.name}:${this.id})`;
        }

        this.toMultiString = () => {
            return this.toString() + `\nFull name: ${this.fullName}\nAge: ${this.age}`;
        }
    }

    function Structure (name='Structure', type=TYPE.STRUCTURE, properties=[], onTick, onDay, onMonth, onYear) {
        Entity.call(this, name, type, properties, onTick, onDay, onMonth, onYear);
        this.properties.add(PROPERTIES.STRUCTURE);

        //------------------//
        //  Default values  //
        //------------------//

        // Taxes
        this.handleTaxes = (city) => {}
    }

    function Buildings (buildings=4, maxBuildings=8, maxPeoplePerBuilding=8) {
        this.buildings = buildings;
        this.maxPeoplePerBuilding = maxPeoplePerBuilding;
        this.maxBuildings = maxBuildings;
        this.onRemoveBuilding = [];
        this.addBuilding = () => {
            if (this.buildings >= this.maxBuildings) return false;
            this.buildings++;
            return true;
        }
        this.removeBuilding = () => {
            if (this.buildings <= 0) return false;
            this.buildings--;
            for (var i in this.onRemoveBuilding) { this.onRemoveBuilding[i](); }
            return true;
        }
    }

    function Housing (name='Housing', buildings=4, maxBuildings=4, maxPeoplePerBuilding=8) {
        Structure.call(this, name, TYPE.HOUSING, [PROPERTIES.POPULATION, PROPERTIES.BUILDINGS, PROPERTIES.HOUSING]);
        Buildings.call(this, buildings, maxBuildings, maxPeoplePerBuilding);

        //------------------//
        //  Default values  //
        //------------------//

        // Population & houses
        this.population = [];
        this.maxPopulation = () => this.buildings * this.maxPeoplePerBuilding;
        this.addPerson = (person) => {
            if (this.population.length >= this.maxPopulation() || this.population.indexOf(person) >= 0) return false;
            this.population.push(person);
            person.home = this;
            return true;
        }
        this.removePerson = (person) => {
            if (this.population.indexOf(person) < 0) return false;
            this.population.splice(this.population.indexOf(person), 1);
            person.home = null;
            return true;
        }

        //--------------//
        //  Overwrites  //
        //--------------//

        this.onRemoveBuilding.push(() => {
            while (this.population.length > this.maxPopulation()) this.population.pop().home = null;
        });

        // Taxes
        this.handleTaxes = (city) => {
            this.population.forEach((person, index, list) => {
                city.income += person.income * city.taxValues.population;
                person.income -= person.income * city.taxValues.population;
            });
        }

        this.toMultiString = () => {
            return this.toString() + `\nPopulation: ${this.population.length}/${this.maxPopulation()}\nHouses: ${this.buildings}/${this.maxBuildings}`;
        }
        
    }

    function Workplace (name='Workplace', type=TYPE.WORKPLACE, properties, buildings=4, maxBuildings=8, maxPeoplePerBuilding=8, onTick, onDay, onMonth, onYear) {
        Structure.call(this, name, type, properties, onTick, onDay, onMonth, onYear);
        Buildings.call(this, buildings, maxBuildings, maxPeoplePerBuilding);
        this.addProperty(PROPERTIES.WORKERS, PROPERTIES.BUILDINGS, PROPERTIES.WORKPLACE);

        //------------------//
        //  Default values  //
        //------------------//

        // Budget
        this.budget = 0;
        this.income = 0;

        // Workers
        this.workers = [];
        this.maxWorkersPerBuilding = this.maxPeoplePerBuilding;
        this.maxWorkers = () => this.buildings * this.maxWorkersPerBuilding;
        this.addWorker = (person) => {
            if (this.workers.length >= this.maxWorkers() || this.workers.indexOf(person) >= 0) return false;
            this.workers.push(person);
            person.workplace = this;
            return true;
        }
        this.removeWorker = (person) => {
            if (this.workers.indexOf(person) < 0) return false;
            this.workers.splice(this.workers.indexOf(person), 1);
            person.workplace = null;
            return true;
        }

        //--------------//
        //  Overwrites  //
        //--------------//

        this.onRemoveBuilding.push(() => { while (this.workers.length > this.maxWorkers()) this.workers.pop().workplace = null; });

        this.toMultiString = () => {
            return this.toString() + `\nWorkers: ${this.workers.length}/${this.maxWorkers()}\nBuildings: ${this.buildings}/${this.maxBuildings}`;
        }
    }

    function Industrial (name="Industrial", type=TYPE.INDUSTRIAL, properties, buildings=4, maxBuildings=8, maxPeoplePerBuilding=18) {
        Workplace.call(this, name, type, properties, buildings, maxBuildings, maxPeoplePerBuilding);
        this.properties.add(PROPERTIES.INDUSTRIAL);

        //------------------//
        //  Default values  //
        //------------------//

        // Stats
        this.productivity = 50; // 0 - 100
        this.stock = 0;
        this.maxStock = 1000;
        this.productPrice = 50;

        // Production
        this.sellStock = () => {
            this.income += this.stock * this.productPrice;
            this.stock = 0;
        }

        //--------------//
        //  Overwrites  //
        //--------------//

        // Taxes
        this.handleTaxes = (city) => {
            city.income += this.income * city.taxValues.industrial;
            this.income -= this.income * city.taxValues.industrial;
        }

    }

    function Commercial (name='Commercial', type=TYPE.COMMERCIAL, properties, buildings=4, maxBuildings=12, maxPeoplePerBuilding=20) {
        Workplace.call(this, name, type, properties, buildings, maxBuildings, maxPeoplePerBuilding);
        this.properties.add(PROPERTIES.COMMERCIAL);

        //------------------//
        //  Default values  //
        //------------------//

        // Stats
        this.productivity = 50; // 0 - 100
        this.stock = 0;
        this.maxStock = 1000;
        this.productPrice = 50;

        // Production
        this.sellStock = () => {
            this.income += this.stock * this.productPrice;
            this.stock = 0;
        }

        //--------------//
        //  Overwrites  //
        //--------------//

        // Taxes
        this.handleTaxes = (city) => {
            city.income += this.income * city.taxValues.commercial;
            this.income -= this.income * city.taxValues.commercial;
        }

    }

    function Careplace (name='Careplace', type=TYPE.CAREPLACE, properties, buildings=4, maxBuildings=8, maxPeoplePerBuilding=16, onTick, onDay, onMonth, onYear) {
        Workplace.call(this, name, type, properties, buildings, maxBuildings, maxPeoplePerBuilding, onTick, onDay, onMonth, onYear);
        this.addProperty(PROPERTIES.CAREPLACE, PROPERTIES.CARETAKERS);

        //------------------//
        //  Default values  //
        //------------------//

        // Stats
        this.maxEffectiveness = 100;
        this.effectiveness = 50; // 0 - 100
        this.effectPerTick = 4;

        // Handle careTaker properties
        this.onCareTakerAdded = (person) => { person.careplace = this; }
        this.onCareTakerRemoved = (person) => { person.careplace = null; }
        this.onCareTakerSuccess = (person) => { person.careplace = null; }

        // Caretakers
        this.careTakers = [];
        this.maxCareTakersPerBuilding = 12;
        this.maxCareTakers = () => this.buildings * this.maxCareTakersPerBuilding;
        this.addCareTaker = (person) => {
            if (this.careTakers.length >= this.maxCareTakers() || this.careTakers.indexOf(person) >= 0) return false;
            this.careTakers.push(person);
            this.onCareTakerAdded(person);
        }
        this.removeCareTaker = (person) => {
            if (this.careTakers.indexOf(person) < 0) return false;
            this.careTakers.splice(this.careTakers.indexOf(person), 1);
            this.onCareTakerRemoved(person);
            return true;
        }

        //--------------//
        //  Overwrites  //
        //--------------//

        this.onRemoveBuilding.push(() => { while (this.careTakers.length > this.maxCareTakers()) this.onCareTakerRemoved(this.careTakers.pop()); });

        this.toMultiString = () => {
            return this.toString() + `\nWorkers: ${this.workers.length}/${this.maxWorkers()}\nBuildings: ${this.buildings}/${this.maxBuildings} \nPeople in care: ${this.careTakers.length}/${this.maxCareTakers()}`;
        }
    }

    function Medicinal (name='Medicinal', type=TYPE.MEDICINAL, properties, buildings=4, maxBuildings=8, maxPeoplePerBuilding=8) {
        Careplace.call(this, name, type, properties, buildings, maxBuildings, maxPeoplePerBuilding);

        //------------------//
        //  Default values  //
        //------------------//



        //--------------//
        //  Overwrites  //
        //--------------//

        this.onCareTakerAdded = (person) => {
            person.medicinal.facility = this;
            person.medicinal.targetHealth = people.maxHealth - person.medicinal.illnesses.length;
            person.medicinal.healing = true;
        }

        this.onCareTakerRemoved = (person) => {
            person.medicinal.facility = null;
            person.medicinal.healing = false;
            person.medicinal.targetHealth = 0;
        }

        this.onCareTakerSuccess = (person) => {
            person.medicinal.facility = null;
            person.health = person.medicinal.healthTarget;
            person.medicinal.healthTarget = 0;
            person.medicinal.sicknesses = [];
            person.medicinal.healing = false;
        }

        this.onTick = () => {
            var recovered = [];
            var healing = (this.effectPerTick * this.effectiveness) / this.maxEffectiveness;
            for (var i=0, j=this.careTakers.length; i<j; i++) {
                this.careTakers[i].health += healing;
                if (this.careTakers[i].health >= this.careTakers[i].medicinal.healthTarget) {
                    recovered.push(this.careTakers[i]);
                }
            }
            if (recovered.length > 0) {
                console.log("People has recovered in the hospital!");
                console.log("Recovered listed:");
                for (var i=0, j=recovered.length; i<j; i++) {
                    if (this.careTakers.indexOf(recovered[i]) < 0) continue;
                    this.careTakers.splice(this.careTakers.indexOf(recovered[i]), 1);
                    console.log(recovered[i].fullName);
                    this.onCareTakerSuccess(recovered[i]);
                }
                console.log("We wish them health and a happy life onwards!");
            }
        }
    }

    function Policing (name="Policing", type=TYPE.POLICING, properties, buildings=4, maxBuildings=8, maxPeoplePerBuilding=12) {
        Careplace.call(this, name, type, properties, buildings, maxBuildings, maxPeoplePerBuilding);

        //------------------//
        //  Default values  //
        //------------------//



        //--------------//
        //  Overwrites  //
        //--------------//

        this.onCareTakerAdded = (person) => {
            person.policing.sentenced = true;
            person.policing.sentenceServed = 0;
            person.policing.sentenceLength = 60;
            person.policing.facility = this;
        }

        this.onCareTakerRemoved = (person) => {
            person.policing.sentenced = false;
            person.policing.sentenceServed = 0;
            person.policing.sentenceLength = 0;
            person.policing.facility = null;
        }

        this.onCareTakerSuccess = (person) => {
            person.policing.sentenced = false;
            person.policing.sentenceServed = 0;
            person.policing.sentenceLength = 0;
            person.policing.facility = null;
        }

        this.onDay = () => {
            var released = [];
            var timeServed = this.effectiveness / this.maxEffectiveness;
            for (var i=0, j=this.careTakers.length; i<j; i++) {
                this.careTakers[i].policing.sentenceServed += timeServed;
                if (this.careTakers[i].policing.sentenceServed >= this.careTakers[i].policing.sentenceLength) {
                    released.push(this.careTakers[i]);
                }
            }
            if (released.length > 0) {
                console.log("People has finished their prison sentences!");
                console.log("Released listed:");
                for (var i=0, j=released.length; i<j; i++) {
                    this.careTakers.splice(this.careTakers.indexOf(released[i]), 1);
                    console.log(`${released[i].fullName}, served ${released[i].policing.sentenceLength} days`);
                    this.onCareTakerSuccess(released[i]);
                }
                console.log("We wish them a lawfull and happy life onwards!");
            }
        }
    }

    function Education (name='Educational', type=TYPE.EDUCATION, properties, buildings=4, maxBuildings=8, maxPeoplePerBuilding=20) {
        Careplace.call(this, name, type, properties, buildings, maxBuildings, maxPeoplePerBuilding);

        //------------------//
        //  Default values  //
        //------------------//

        // Degrees
        this.degreeLength = 12;

        //--------------//
        //  Overwrites  //
        //--------------//

        this.onCareTakerAdded = (person) => {
            person.schooling.studying = true;
            person.schooling.facility = this;
            person.schooling.degreeProgress = 0;
            person.schooling.degreeLength = this.degreeLength;
        }

        this.onCareTakerRemoved = (person) => {
            person.schooling.studying = false;
            person.schooling.facility = null;
            person.schooling.degreeProgress = 0;
            person.schooling.degreeLength = 0;
        }

        this.onCareTakerSuccess = (person) => {
            person.schooling.studying = false;
            person.schooling.facility = null;
            person.schooling.degreeProgress = 0;
            person.schooling.degreeLength = 0;
        }

        this.onMonth = () => {
            var graduated = [];
            var progress = this.effectiveness / this.maxEffectiveness;
            for (var i=0, j=this.careTakers.length; i<j; i++) {
                this.careTakers[i].schooling.degreeProgress += progress;
                if (this.careTakers[i].schooling.degreeProgress >= this.careTakers[i].schooling.degreeLength) {
                    graduated.push(this.careTakers[i]);
                }
            }
            if (graduated.length > 0) {
                console.log("People has graduated with shiny degrees!");
                console.log("Graduates listed:");
                for (var i=0, j=graduated.length; i<j; i++) {
                    this.careTakers.splice(this.careTakers.indexOf(graduated[i]), 1);
                    console.log(`${graduated[i].fullName}, studied for ${graduated[i].schooling.degreeLength} months at ${this.name}`);
                    this.onCareTakerSuccess(graduated[i]);
                }
                console.log("We wish them a successful and happy life onwards!");
            }
        }
    }

    return {
        all:all,
        removeQueue:removeQueue,
        TYPE:TYPE,
        PROPERTIES:PROPERTIES,
        City:City,
        Person:Person,
        Housing:Housing,
        Industrial:Industrial,
        Commercial:Commercial,
        Medicinal:Medicinal,
        Policing:Policing,
        Education:Education
    };
}();