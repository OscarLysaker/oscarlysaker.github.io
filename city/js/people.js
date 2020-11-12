//#######################//
//##|   People Data   |##//
//#######################//

var peopleHealth = function () {

    //---------------//
    //   Illnesses   //
    //---------------//

    var illness = function () {

        var SEVERITY = {
            MILD : 'mild',
            MODERATE : 'moderate',
            SEVERE : 'severe',
            CRITICAL : 'critical'
        }

        var TYPE = {
            SYMPTOM : 'symptom',
            INFECTION : 'infection',
            DISEASE : 'disease',
            INJURY : 'injury',
            DISABILITY : 'disability',
            DISORDER : 'disorder',
            SYNDROME : 'syndrome'
        }

        var ID = {
            COUGH : 'cough',
            FEVER : 'fever',
            INFLUENZA : 'influenza',
            CANCER : 'cancer',
            HEART_ATTACK : 'heart-attack',
            BROKEN_BONE : 'broken-bone',
            CONCUSSION : 'concussion',
            DEAFNESS : 'deafness',
            BLINDNESS : 'blindness',
            DEPRESSION : 'depression',
            SCHIZOPHRENIA : 'schizophrenia'
        }

        function Stage (label, maxDays, severity=SEVERITY.MILD, morbidity=0.0, canWork=true, workEffectiveness=1.0, cureable=true, cureableModifier=1.0, needsCare=false, healthEffect=1.0, motivationEffect=1.0, transmissibility=0.0) {
            this.label = label;
            this.maxDays = maxDays;
            this.severity = severity;
            this.morbidity = morbidity;
            this.canWork = canWork;
            this.workEffectiveness = workEffectiveness;
            this.cureable = cureable;
            this.cureableModifier = cureableModifier;
            this.needsCare = needsCare;
            this.healthEffect = healthEffect;
            this.motivationEffect = motivationEffect;
            this.transmissibility = transmissibility;
        }

        function Illness (id=ID.COUGH, type=TYPE.SYMPTOM, stages=[]) {
            this.id = id;
            this.type = type;
            this.stages = stages;

            // Default values
            this.currentStageIndex = 0;
            this.currentStage = () => this.stages[this.currentStageIndex];
            this.maxDays = () => {
                var value = 0;
                for (var i=0, j=this.stages.length; i<j; i++) value += this.stages[i].maxDays;
                return value;
            }

            this.addStage = function (stage) { this.stages.push(stage); }

            this.willDie = false;
            this.willDieCalc = () => {
                this.willDie = Math.random() < this.currentStage().morbidity;
            }

            this.onCured = () => {}

            this.nextStage = () => {
                this.currentStageIndex++;
                if (this.currentStageIndex == this.stages.length) this.onCured();
            }
        }

        function getIllness (id) {
            var temp = new Illness(id);
            switch (id) {
                case ID.COUGH:
                    temp.type = TYPE.SYMPTOM;
                    temp.addStage(new Stage("soar throat", 2, SEVERITY.MILD, 0.0, true, 1.0, true, 1.0, false, 0.9, 0.9, 0.0));
                    break;
                case ID.FEVER:
                    temp.type = TYPE.SYMPTOM;
                    temp.addStage(new Stage("warm", 3, SEVERITY.MILD, 0.0, true, 1.0, true, 1.0, false, 0.8, 0.9, 0.0));
                    break;
                case ID.INFLUENZA:
                    temp.type = TYPE.INFECTION;
                    temp.addStage(new Stage("unwell", 1, SEVERITY.MILD, 0.0, true, 0.8, false, 0.0, false, 0.9, 0.9, 0.3));
                    temp.addStage(new Stage("sick", 5, SEVERITY.MODERATE, 0.05, false, 0.0, true, 0.6, false, 0.6, 0.7, 0.0));
                    temp.addStage(new Stage("recovering", 2, SEVERITY.MILD, 0.0, true, 0.9, true, 0.9, false, 0.8, 0.9, 0.0));
                    break;
                case ID.CANCER:
                    temp.type = TYPE.DISEASE;
                    temp.addStage(new Stage("concerned", 5, SEVERITY.MODERATE, 0.1, true, 1.0, false, 0.0, false, 0.9, 0.7, 0.0));
                    temp.addStage(new Stage("treatment", 300, SEVERITY.SEVERE, 0.7, false, 0.0, true, 0.1, true, 0.2, 0.2, 0.0));
                    temp.addStage(new Stage("recovering", 60, SEVERITY.MODERATE, 0.05, true, 0.9, true, 0.9, true, 0.7, 0.9, 0.0));
                    break;
                case ID.HEART_ATTACK:
                    temp.type = TYPE.DISEASE;
                    temp.addStage(new Stage("collapse", 1, SEVERITY.CRITICAL, 0.5, false, 0.0, false, 0.0, true, 0.2, 0.2, 0.0));
                    temp.addStage(new Stage("treatment", 4, SEVERITY.SEVERE, 0.2, false, 0.0, true, 0.8, true, 0.5, 0.5, 0.0));
                    temp.addStage(new Stage("recovering", 2, SEVERITY.MILD, 0.0, false, 0.0, true, 1.0, false, 0.7, 0.8, 0.0));
                    break;
                case ID.BROKEN_BONE:
                    temp.type = TYPE.INJURY;
                    temp.addStage(new Stage("injury", 1, SEVERITY.MODERATE, 0.01, false, 0.0, false, 0.0, true, 0.4, 0.6, 0.0));
                    temp.addStage(new Stage("treatment", 3, SEVERITY.MILD, 0.0, false, 0.0, false, 0.0, true, 0.7, 0.8, 0.0));
                    temp.addStage(new Stage("healing", 30, SEVERITY.MILD, 0.0, true, 0.6, true, 0.9, false, 0.8, 0.9, 0.0));
                    break;
                case ID.CONCUSSION:
                    temp.type = TYPE.INJURY;
                    temp.addStage(new Stage("injury", 1, SEVERITY.CRITICAL, 0.15, false, 0.0, false, 0.0, true, 0.2, 0.2, 0.0));
                    temp.addStage(new Stage("treatment", 4, SEVERITY.MODERATE, 0.05, false, 0.0, true, 0.3, true, 0.4, 0.6, 0.0));
                    temp.addStage(new Stage("healing", 5, SEVERITY.MILD, 0.0, true, 0.4, true, 1.0, false, 0.7, 0.9, 0.0));
                    break;
                case ID.DEAFNESS:
                    temp.type = TYPE.DISABILITY;
                    temp.addStage(new Stage("deaf", -1, SEVERITY.MILD, 0.0, true, 0.9, false, 0.0, false, 1.0, 0.9, 0.0));
                    break;
                case ID.BLINDNESS:
                    temp.type = TYPE.DISABILITY;
                    temp.addStage(new Stage("blind", -1, SEVERITY.MILD, 0.0, true, 0.7, false, 0.0, false, 1.0, 0.9, 0.0));
                    break;
                case ID.DEPRESSION:
                    temp.type = TYPE.DISORDER;
                    temp.addStage(new Stage("depressed", 120, SEVERITY.MODERATE, 0.05, true, 0.7, true, 0.5, false, 0.8, 0.3, 0.0));
                    break;
                case ID.SCHIZOPHRENIA:
                    temp.type = TYPE.DISORDER;
                    temp.addStage(new Stage("schizophrenia", -1, SEVERITY.MODERATE, 0.15, true, 0.5, false, 0.0, false, 0.8, 0.7, 0.0));
                    break;
                default:
                    temp = null;
            }
            return temp;
        }

        return {
            SEVERITY:SEVERITY,
            TYPE:TYPE,
            ID:ID,
            getIllness:getIllness
        };
    }();

    //------------//
    //   Traits   //
    //------------//

    var traits = function () {

        var list = [];

        

        return{

        };
    }();

    return {
        illness:illness
    };
}();

var peoplePersona = function () {

    //------------//
    //   GENDER   //
    //------------//

    var GENDER = { MALE : 'male', FEMALE : 'female' }

    //---------//
    //   AGE   //
    //---------//

    var ageStages = [
        {min:-1, max:1, label:"infant"},
        {min:1, max:3, label:"toddler"},
        {min:3, max:10, label:"child"},
        {min:10, max:13, label:"preadolescent"},
        {min:13, max:20, label:"adolescent"},
        {min:20, max:30, label:"young adult"},
        {min:30, max:45, label:"adult"},
        {min:45, max:64, label:"middle age"},
        {min:64, max:-1, label:"old"}
    ]

    function getAgeStageLabel (age) {
        for (var i=0, j=ageStages.length; i<j; i++) {
            var ageStage = ageStages[i];
            if ((ageStage.min == -1 || age > ageStage.min) && (ageStage.min == -1 || age < ageStage.max)) {
                return ageStage.label;
            }
        }
    }

    //-----------//
    //   NAMES   //
    //-----------//

    var firstNames = {
        male : ["Alex", "Alan", "George", "Nick", "Joe", "Felix", "Thomas", "Michael", "Lucas", "Joseph", "Daniel", "Julian", "James", "William", "Matthew", "Anthony", "Leo", "Asher", "Elias", "Ezekiel", "Nolan", "Aaron", "Evan", "Nicholas", "Dominic", "Damian", "Nathaniel", "Zachary", "Ashton", "Carlos", "Max", "Gavin", "Kevin", "Milo", "Rhett", "Elliot"],
        female : ["Jane", "Olivia", "Victoria", "Sophia", "Leah", "Ella", "Caroline", "Anna", "Ruby", "Addison", "Alice", "Natalia", "Arya", "Rylee", "Clara", "Josephine", "Melanie", "Margaret", "Katherine", "Kylie", "Taylor", "Brianna", "Melody", "Molly", "Julia", "Juliana", "Teagan", "Kayla", "Trinity", "Olive", "Nicole", "Ruth", "Selena", "Laila"]
    }

    var lastNames = ["Harris", "Conan", "Smith", "Johnson", "Clinton", "Walters", "Chapman", "Adams", "Stewart", "Robinson", "Wilson", "Miller", "Anderson", "Watson", "Cooper", "Owens", "Garner", "Sanchez", "Bates"];

    function Persona (firstName, lastName, gender) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.gender = gender;
    }

    function getRandomFirstName (gender=null) {
        if (gender == null) gender = (Math.random() > 0.5) ? GENDER.FEMALE : GENDER.MALE;
        var nameList = (gender == GENDER.FEMALE) ? firstNames.female : firstNames.male;
        return nameList[Math.floor(Math.random() * (nameList.length - 1))];
    }

    function getRandomLastName () {
        return lastNames[Math.floor(Math.random() * (lastNames.length - 1))];
    }

    function getRandomPersona () {
        var gender = (Math.random() > 0.5) ? GENDER.FEMALE : GENDER.MALE;
        return new Persona(getRandomFirstName(gender), getRandomLastName(), gender);
    }

    return {
        // Gender
        GENDER:GENDER,

        // Age
        ageStages:ageStages,
        getAgeStageLabel:getAgeStageLabel,

        // Persona
        Persona:Persona,
        getRandomPersona:getRandomPersona
    };
}();