/*global PassOff, TemporaryPhraseStore, describe, beforeEach, afterEach, JasminePromiseMatchers, it, expect, runs, console */

describe("Test Open Sesame Missing Parameter Rejection", function () {
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

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://www." + domainName + "/wtf.html";
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

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://www." + domainName + "/intothebowels/downthere/wtf.html";
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
    var passwordUserName = "JukuBacqMawu0_";
    var password = "Yusa1-JuroWuds";
    var passwordType = "long-password";
    var fullName = "JimiHendrix";
    var userName = "jmhendrix";
    var passPhrase = "I see you down on the street, oh foxy";
    var domainName = "hendrix.com.au";

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

    it("should generate same password when domain starts with 'mail.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "mail." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://mail." + domainName + "/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Bopy3?WajnTado", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Qale1[CucuZiqb", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("CujeXeylMelz2;", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("HobnBahlGega4,", done);
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

    it("should generate same password when domain starts with 'mail.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "mail." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://mail." + domainName + "/intothebowels/downthere/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("FihaGiju3;Toci", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("YoloMasiPoqa2[", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Gixo1!XopbYubq", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Medium Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "HayXuj4$";
    var password = "Yun5%Mux";
    var passwordType = "medium-password";
    var fullName = "JohnKennedy";
    var userName = "jfk";
    var passPhrase = "Ask not wht Pass Off can do for you";
    var domainName = "grassyknoll.co.nz";

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

    it("should generate same password when domain starts with 'double.barell.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "double.barell." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://double.barell." + domainName + "/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Yeq5&Tul", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Haj8=Nun", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("QisHac6'", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Mer9(Zic", done);
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

    it("should generate same password when domain starts with 'double.barell.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "double.barell." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://double.barell." + domainName + "/intothebowels/downthere/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("KuhSat3.", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Was8%Zec", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("NerFol8?", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Basic Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "iMr42cpW";
    var password = "Gd11gls8";
    var passwordType = "basic-password";
    var fullName = "BobMarley";
    var userName = "bobm";
    var passPhrase = "Get up Stand Up";
    var domainName = "bobmarley.org.tw";

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

    it("should generate same password when domain starts with 'accounts.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "accounts." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://accounts." + domainName + "/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("pR15qGC2", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("maw6yDE2", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Qp67wNf0", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Msm77bDg", done);
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

    it("should generate same password when domain starts with 'accounts.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "accounts." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://accounts." + domainName + "/intothebowels/downthere/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("ls19hhn3", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("OME4cLd9", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("dy40iwK2", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});



describe("Test Short Passwords", function () {
    var passOff = new PassOff();
    var passwordUserName = "Tob1";
    var password = "Kej5";
    var passwordType = "short-password";
    var fullName = "Quantic";
    var userName = "quantic";
    var passPhrase = "Infinite rwgression";
    var domainName = "soulorchestra.io";

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

    it("should generate same password when domain starts with 'login.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "login." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://login." + domainName + "/stuff/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Miv9", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Jen9", done);
    });

    it("should generate a different password when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Lac8", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Hut5", done);
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

    it("should generate same password when domain starts with 'login.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "login." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://login." + domainName + "/intothebowels/downthere/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different password when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Gut4", done);
    });

    it("should generate a different password when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Nac5", done);
    });

    it("should generate a different password when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Cap7", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Four Digit Pin", function () {
    var passOff = new PassOff();
    var passwordUserName = "1759";
    var password = "6843";
    var passwordType = "pin";
    var fullName = "TylerDurden";
    var userName = "tdurden";
    var passPhrase = "The first rule of Pass Off is there is no Pass Off";
    var domainName = "fightclub.edu.ca";

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

    it("should generate same PIN when domain starts with 'www2.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www2." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://www2." + domainName + "/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("6083", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("3611", done);
    });

    it("should generate a different PIN when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("1898", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("0978", done);
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

    it("should generate same PIN when domain starts with 'www2.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "www2." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://www2." + domainName + "/intothebowels/downthere/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("8584", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("3233", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("5600", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Six Digit Pin", function () {
    var passOff = new PassOff();
    var passwordUserName = "684466";
    var password = "998384";
    var passwordType = "pin-6";
    var fullName = "MrRobot";
    var userName = "elliot";
    var passPhrase = "Evil Corp must die";
    var domainName = "fsociety.co.uk";

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

    it("should generate same PIN when domain starts with 'account.login.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "account.login." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://account.login." + domainName + "/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("240985", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("886527", done);
    });

    it("should generate a different PIN when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("971333", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("212147", done);
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

    it("should generate same PIN when domain starts with 'account.login.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "account.login." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "http://account.login." + domainName + "/intothebowels/downthere/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different PIN when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase.toUpperCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("053243", done);
    });

    it("should generate a different PIN when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("446552", done);
    });

    it("should generate a different PIN when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("767092", done);
    });
    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test User Name", function () {
    var passOff = new PassOff();
    var passwordUserName = "fixyijata";
    var password = "243550";
    var passwordType = "login";
    var fullName = "HumptyDumpty";
    var userName = "";
    var passPhrase = "I sat on the wall and had a GREAT fall";
    var domainName = "nurseryrhymes.com.au";

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

    it("should generate same user name when domain starts with 'wwwotherstuff.'", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "wwwotherstuff." + domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://wwwotherstuff." + domainName + "/wtf.html";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different user name when case is changed for pass phrase", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase.toLowerCase();
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("sitteyeja", done);
    });

    it("should generate a different user name when full name is changed", function (done) {
        passOff.fullName = fullName.substring(1);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("weykoqufo", done);
    });

    it("should generate a different user name when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("gabhuziwe", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Security Answers", function () {
    var passOff = new PassOff();
    var passwordUserName = "hu yifse ciq kujurba";
    var password = "ceh qisyezoda wolu";
    var passwordType = "answer";
    var fullName = "KruderAndDorfmeister";
    var userName = "kandd";
    var passPhrase = "Bugpowder dust";
    var domainName = "kanddsessions.cool";
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

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://www." + domainName + "/wtf.html";
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
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("lu lunlo piz zizovwu", done);
    });

    it("should generate a different answer when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("mo paltu kib cazojbe", done);
    });

    it("should generate a different answer when user name is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName.substring(2);
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("va sobsu qoj narixqe", done);
    });

    it("should generate a different answer when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(3);
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("qujl fav yenvoju gah", done);
    });

    it("should generate a different answer when question is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = userName;
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion.substring(8);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("si culni tob lugorju", done);
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

    it("should generate same password when domain has full URL", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = "https://www." + domainName + "/wtf.html";
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
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("devk zap kuhsici ber", done);
    });

    it("should generate a different answer when full name is changed", function (done) {
        passOff.fullName = fullName.substring(4);
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("dusb cir retzagi meq", done);
    });

    it("should generate a different answer when domain is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName.substring(1);
        passOff.securityQuestion = secQuestion;
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("tibr vut mufwuju yoz", done);
    });

    it("should generate a different answer when question is changed", function (done) {
        passOff.fullName = fullName;
        passOff.userName = "";
        passOff.passPhrase = passPhrase;
        passOff.domainName = domainName;
        passOff.securityQuestion = secQuestion.substring(8);
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("pucp zuy vopjova met", done);
    });


    afterEach(JasminePromiseMatchers.uninstall);
});


describe("Test Open Sesame Temporary Phrase Store", function () {
    var encDataHolder, ivHolder;

    //beforeEach(JasminePromiseMatchers.install);


    it("should fail when attempting to encrypt empty pass phrase", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();
        expect(tempPhraseStore.encryptPhrase("", "")).toBeRejected(done);

    });

    it("should fail when attempting to decrypt empty encypted data", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();
        expect(tempPhraseStore.decryptPhrase("Thr", "JohnSmith")).toBeRejected(done);
    });

    it("should successfully encrypt phrase and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        return tempPhraseStore.encryptPhrase("A special pass phrase", "JohnSmith")
            .then(function (val) {
                expect(val).toEqual("Success");
                expect(tempPhraseStore.encData).toBeDefined();
                done();
            });


    });

    it("should produce different encrypted data for the same phrase and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();
        tempPhraseStore.encryptPhrase("A special pass phrase with some Punctuation!?", "Jane Citizen")
            .then(function (val) {
                encDataHolder = tempPhraseStore.encData.ciphertext;
                ivHolder = tempPhraseStore.encData.iv;
                return true;
            })
            .then(function (val) {
                return tempPhraseStore.encryptPhrase("A special pass phrase with some Punctuation!?", "Jane Citizen");
            })
            .then(function (val) {
                expect(tempPhraseStore.encData.ciphertext).not.toEqual(encDataHolder);
                expect(tempPhraseStore.encData.iv).not.toEqual(ivHolder);
                done();
            });
    });

    it("should successfully decrypt the phrase using the first three characters and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();
        tempPhraseStore.encryptPhrase("aP2 with Some Special Stuff", "KruderAndDorfmeister")
            .then(function (val) {

                expect(tempPhraseStore.decryptPhrase("aP2", "KruderAndDorfmeister")).toBeResolvedWith("aP2 with Some Special Stuff", done);
            });
    });

    it("should successfully decrypt a phrase with special characters using the first three characters and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("Ihëart årt and £$¢!", "HumptyDumpty")
            .then(function (val) {
                expect(tempPhraseStore.decryptPhrase("Ihë", "HumptyDumpty")).toBeResolvedWith("Ihëart årt and £$¢!", done);
            });

    });

    it("should fail to decrypt the phrase using the first two characters and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("Here is a special [phrase]", "MrRobot")
            .then(function (val) {
                expect(tempPhraseStore.decryptPhrase("He", "MrRobot")).toBeRejected(done);
            });
    });

    it("should remove encrypted data after failing to decrypt the phrase using the first two characters and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("Here is a special [phrase]", "MrRobot")
            .then(function (val) {
                return tempPhraseStore.decryptPhrase("He", "MrRobot");
            })
            .catch(function (err) {
                expect(tempPhraseStore.encData).not.toBeDefined();
                done();
            });
    });

    it("should fail to decrypt the phrase using the wrong case for the first three characters and name and encrypted data should be removed", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("This is a pass phrase", "TylerDurden")
            .then(function (val) {
                expect(tempPhraseStore.decryptPhrase("tHI", "TylerDurden")).toBeRejected(done);
            });
    });

    it("should remove encrypted data after failing to decrypt the phrase using the wrong case for the first three characters and name", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("This is a pass phrase", "TylerDurden")
            .then(function (val) {
                return tempPhraseStore.decryptPhrase("tHI", "TylerDurden");
            })
            .catch(function (err) {
                expect(tempPhraseStore.encData).not.toBeDefined();
                done();
            });
    });

    it("should clear encrypted data and hash when the clearStore method is called", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("This is a pass phrase", "TylerDurden")
            .then(function (val) {
                tempPhraseStore.clearStore();
                expect(tempPhraseStore.encData).not.toBeDefined();
                done();
            });
    });

    it("should allow encrypted data and hash to be passed in and a succsefull decryption to occur", function (done) {
        var tempPhraseStore = new TemporaryPhraseStore();
        var tempPhraseStore2 = new TemporaryPhraseStore();

        tempPhraseStore.encryptPhrase("This is a pass phrase", "TylerDurden")
            .then(function (val) {
                tempPhraseStore2.storeValues(tempPhraseStore.threeCharHash, tempPhraseStore.encData);
                expect(tempPhraseStore2.decryptPhrase("Thi", "TylerDurden")).toBeResolvedWith("This is a pass phrase", done);
            });
    });


    //afterEach(JasminePromiseMatchers.uninstall);
});
