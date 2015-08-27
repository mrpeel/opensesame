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

describe("Test Maximum Password", function () {
    var passOff = new PassOff();
    var passwordUserName = "h8_PBg0(ikEXvA93@mPC";
    var password = "K7*Zf3$ke44hn%y)F8oi";
    var passwordType = "maximum-password";

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known maximum password", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when case is changed for name", function (done) {
        passOff.fullName = "jAnecITIzen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when case is changed for user name", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "JCitiZen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when case is changed for domain", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "TEST.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when domain starts with 'www.'", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "www.test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different maximum password when case is changed for pass phrase", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("qVUNRQ%FEEJu!naaIW0*", done);
    });

    it("should generate a different maximum password when full name is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("d7=kbVdMliTA2QiTZ2UY", done);
    });

    it("should generate a different maximum password when user name is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "citizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("AfKmZucx6^amQHXuCD7!", done);
    });

    it("should generate a different maximum password when domain is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "tes.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("j@OTSa&6IiPKmMg66q5[", done);
    });


    it("should generate known maximum password without a user name", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same maximum password when case is changed for name", function (done) {
        passOff.fullName = "jAnecITIzen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same maximum password when case is changed for domain", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "TEST.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same maximum password when domain starts with 'www.'", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "www.test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different maximum password when case is changed for pass phrase", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("C8,F#%RC&HZhODnaPpIV", done);
    });

    it("should generate a different maximum password when full name is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Eu(b1zF!birlY(AFoa9_", done);
    });

    it("should generate a different maximum password when domain is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "tes.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("qZMB0PRc1WWgIWCNbk5;", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});

describe("Test Long Password", function () {
    var passOff = new PassOff();
    var passwordUserName = "Towi6+KukuNuse";
    var password = "WiteYizdJodt1~";
    var passwordType = "long-password";


    beforeEach(JasminePromiseMatchers.install);


    it("should generate known maximum password", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when case is changed for name", function (done) {
        passOff.fullName = "jAnecITIzen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when case is changed for user name", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "JCitiZen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when case is changed for domain", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "TEST.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate same maximum password when domain starts with 'www.'", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "www.test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
    });

    it("should generate a different maximum password when case is changed for pass phrase", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Pice7/QunoRowz", done);
    });

    it("should generate a different maximum password when full name is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("BiwhNexyXoga8/", done);
    });

    it("should generate a different maximum password when user name is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "citizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Zesa6:ZoriHikq", done);
    });

    it("should generate a different maximum password when domain is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "tes.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("Saqu4=DapuJekk", done);
    });


    it("should generate known maximum password without a user name", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same maximum password when case is changed for name", function (done) {
        passOff.fullName = "jAnecITIzen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same maximum password when case is changed for domain", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "TEST.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate same maximum password when domain starts with 'www.'", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "www.test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith(password, done);
    });

    it("should generate a different maximum password when case is changed for pass phrase", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.userName = "";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("MoknNola8!Jomm", done);
    });

    it("should generate a different maximum password when full name is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("CokiZecu3]Polu", done);
    });

    it("should generate a different maximum password when domain is changed", function (done) {
        passOff.fullName = "Janeitizen";
        passOff.userName = "";
        passOff.passPhrase = "My Pass phrase";
        passOff.domainName = "tes.com";
        expect(passOff.generatePassword(passwordType)).toBeResolvedWith("BivvNalo3?Fudf", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);
});


/* ---------Address book sample -------------------

describe("Address Book", function () {
    var addressBook = new AddressBook();

    beforeEach(JasminePromiseMatchers.install);

    it("should resolve", function (done) {
        expect(addressBook.promiseMe()).toBeResolved(done);

    });

    it("should return result", function (done) {
        expect(addressBook.promiseMe()).toBeResolvedWith("result", done);

    });

    it("should reject", function (done) {
        expect(addressBook.rejectMe()).toBeRejected(done);
    });

    it("should reject with error", function (done) {
        expect(addressBook.rejectMe()).toBeRejectedWith("error", done);
    });

    afterEach(JasminePromiseMatchers.uninstall);

});

--------------------------------------*/



/*describe("Address Book", function () {
    var addressBook, thisContact;

    beforeEach(function () {
        addressBook = new AddressBook();
        thisContact = new Contact();
    });

    it("should be able to add a contact", function () {


        addressBook.addContact(thisContact);

        expect(addressBook.getContact(0)).toBe(thisContact);
    });

    it("should be able to delete a contact", function () {
        var addressBook = new AddressBook(),
            thisContact = new Contact();

        addressBook.addContact(thisContact);
        addressBook.deleteContact(0);

        expect(addressBook.getContact(0)).not.toBeDefined();

    });

});

describe("Async Address Book", function () {
    var addressBook = new AddressBook();

    beforeEach(function (done) {
        addressBook.getInitialContacts(function () {
            done();
        });
    });

    it("should grab initial contacts", function (done) {
        expect(addressBook.initialComplete).toBe(true);
        done();
    });


});*/
