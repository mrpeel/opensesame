/*global PassOff, describe, beforeEach, afterEach, JasminePromiseMatchers, it, expect */

describe("Test PassOff Missing Parameter Rejection", function () {
    var passOff = new PassOff();
    var passwordType = "maximum-password";

    beforeEach(JasminePromiseMatchers.install);


    it("should fail with no parameters specified", function (done) {
        expect(passOff.generatePassword(passwordType)).toBeRejected(done);

    });


    it("should fail with no name specified", function (done) {
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        passOff.securityQuestion = "why";
        expect(passOff.generatePassword(passwordType)).toBeRejected(done);
    });

    it("should fail with no pass phrase specified", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.passPhrase = "";
        passOff.domainName = "test.com";
        passOff.securityQuestion = "why";
        expect(passOff.generatePassword(passwordType)).toBeRejected(done);
    });

    it("should fail with no domain specified", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "";
        passOff.securityQuestion = "why";
        expect(passOff.generatePassword(passwordType)).toBeRejected(done);
    });

    it("answer type should fail with no question specified", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        passOff.securityQuestion = "";
        expect(passOff.generatePassword("answer")).toBeRejected(done);
    });


    afterEach(JasminePromiseMatchers.uninstall);
});

describe("Test Maximum Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "h8_PBg0(ikEXvA93@mPC";
    var password = "K7*Zf3$ke44hn%y)F8oi";
    var passwordType = "maximum-password";
    var fullName = "JaneCitizen";
    var userName = "jcitizen";
    var passPhrase = "My pass phrase";
    var domainName = "test.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known password", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("i2?WPugak9Cmu&FkJXA@", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("f%hW1TBYaZQsRS9Vj@1=", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("MBaLdIZZQ!BCURcIno2?", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("W02ixFIwZIA0uvPDSM1%", done);
    });


    it("should generate known password without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("fjS*iSzTPQXlCBtM601;", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("dp#o7BBPRIRv#TgucM7_", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("cIF0Ge^jaIJC8sBFr41&", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});

describe("Test Long Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "Bafe5+CenoCebw";
    var password = "Jume3+HayuKisj";
    var passwordType = "long-password";
    var fullName = "JimiHendrix";
    var userName = "jmhendrix";
    var passPhrase = "I see you down on the street, oh foxy";
    var domainName = "hendrix.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known password", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("DobiQage8[Geta", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Zuts2(FejiNiqe", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("FafuVaroJoto3+", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("VaznZahe4,Peky", done);
    });


    it("should generate known password without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("YilrRijs1^Cepi", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Banh6*BowzJuse", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("RojaWete9'Bikc", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Medium Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "GanLun3%";
    var password = "Hah6+Tut";
    var passwordType = "medium-password";
    var fullName = "JohnKennedy";
    var userName = "jfk";
    var passPhrase = "Ask not wht Pass Off can do for you";
    var domainName = "grassyknoll.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known password", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Fuy7-Jik", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Tuv2!Viz", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("GitFiw3!", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Saf4=Cak", done);
    });


    it("should generate known password without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Pid5%Jur", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("DogGum2+", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("QohPij9&", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Basic Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "GQa39nHD";
    var password = "nrs30XCj";
    var passwordType = "basic-password";
    var fullName = "BobMarley";
    var userName = "bobm";
    var passPhrase = "Get up Stand Up";
    var domainName = "bobmarley.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known password", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Lou6YeJ2", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Jo25Mes9", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("eF16jhd0", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("lce94fme", done);
    });


    it("should generate known password without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("rpX1xIf8", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("YC71beD8", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("DOB5bqU4", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});



describe("Test Short Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "Riz4";
    var password = "Sez8";
    var passwordType = "short-password";
    var fullName = "Quantic";
    var userName = "quantic";
    var passPhrase = "Infinite rwgression";
    var domainName = "soulorchestra.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known password", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Siv1", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Qew4", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Puc3", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Geq7", done);
    });


    it("should generate known password without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Kep5", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Car1", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Ger9", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Four Digit Pin", function () {
    var passOff = new PassOff();
    var passwordUserName = "6997";
    var password = "2902";
    var passwordType = "pin";
    var fullName = "TylerDurden";
    var userName = "tdurden";
    var passPhrase = "The first rule of PassO ff is there is no Pass Off";
    var domainName = "fightclub.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known PIN", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("0466", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("8751", done);
    });

    it("should generate a different PIN when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("6539", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("2462", done);
    });


    it("should generate known PIN without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same PIN when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same PIN when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same PIN when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("1368", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("2435", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("0780", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Six Digit Pin", function () {
    var passOff = new PassOff();
    var passwordUserName = "110723";
    var password = "243550";
    var passwordType = "pin-6";
    var fullName = "MrRobot";
    var userName = "elliot";
    var passPhrase = "Evil Corp must die";
    var domainName = "fsociety.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known PIN", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same PIN when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("614542", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("850669", done);
    });

    it("should generate a different PIN when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("889590", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("091960", done);
    });


    it("should generate known PIN without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same PIN when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same PIN when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same PIN when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("667535", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("506462", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("658916", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test User Name", function () {
    var passOff = new PassOff();
    var passwordUserName = "xillosuse";
    var password = "243550";
    var passwordType = "login";
    var fullName = "HumptyDumpty";
    var userName = "";
    var passPhrase = "I sat ont he wall and had a GREAT fall";
    var domainName = "nurseryrhymes.com";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same user name when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });


    it("should generate same user name when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same user name when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different user name when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("tiphixuvu", done);
    });

    it("should generate a different user name when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("bibpoyebu", done);
    });

    it("should generate a different user name when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("cokqumugo", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Security Answers", function () {
    var passOff = new PassOff();
    var passwordUserName = "bev natyolede loru";
    var password = "kez gelwomaqe buhi";
    var passwordType = "answer";
    var fullName = "KruderAndDorfmeister";
    var userName = "kandd";
    var passPhrase = "Bugpowder dust";
    var domainName = "kanddsessions.com";
    var secQuestion = "What is your mother's maiden name?";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known answer", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when case is changed for name", function (done) {
        passOff.fullName = fullName.toUpperCase();
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when case is changed for user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.toUpperCase();
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.securityQuestion = secQuestion;
        passOff.domainName = domainName.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when question case is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when question punctuation is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = "'What' is your mothers maiden name";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same answer when question spacing is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = "What  is your mother's maiden   name ?";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different answer when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("bicg hoc vajwibu cun", done);
    });

    it("should generate a different answer when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("jix titqenufa xomu", done);
    });

    it("should generate a different answer when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("wof fiqwawuve potu", done);
    });

    it("should generate a different answer when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("rucf vud giqmaqa baj", done);
    });

    it("should generate a different answer when question is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion.substring(8);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("fe gohdo bol xuzapya", done);
    });


    it("should generate known answer without a user name", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same answer when case is changed for name", function (done) {
        passOff.fullName = fullName.toLowerCase();
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same answer when case is changed for domain", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.toUpperCase();
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same answer when domain starts with 'www.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www." + domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same answer when question case is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion.toUpperCase();
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same answer when question punctuation is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = "'What' is your mothers maiden name";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same answer when question spacing is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = "What  is your mother's maiden   name ?";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different answer when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("duk sarnuhuwe ciwe", done);
    });

    it("should generate a different answer when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("lovk vec nolveme roh", done);
    });

    it("should generate a different answer when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("zorc voc bijjole wuw", done);
    });

    it("should generate a different answer when question is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion.substring(8);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("li cetqe hiz nivumci", done);
    });


    afterEach(JasminePromiseMatchers.uninstall);
});
