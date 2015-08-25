/*global PassOff, describe, beforeEach, afterEach, JasminePromiseMatchers, it, expect */

describe("Test PassOff Missing Parameter Rejection", function () {
    var passOff = new PassOff();

    beforeEach(JasminePromiseMatchers.install);


    it("should fail with no parameters specified", function (done) {
        expect(passOff.generatePassword("long-password")).toBeRejected(done);

    });


    it("should fail with no name specified", function (done) {
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        passOff.securityQuestion = "why";
        expect(passOff.generatePassword("long-password")).toBeRejected(done);
    });

    it("should fail with no pass phrase specified", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.passPhrase = "";
        passOff.domainName = "test.com";
        passOff.securityQuestion = "why";
        expect(passOff.generatePassword("long-password")).toBeRejected(done);
    });

    it("should fail with no domain specified", function (done) {
        passOff.fullName = "JaneCitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "";
        passOff.securityQuestion = "why";
        expect(passOff.generatePassword("long-password")).toBeRejected(done);
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

    beforeEach(JasminePromiseMatchers.install);


    it("should generate known maximum password", function (done) {
        passOff.fullName = "janecitizen";
        passOff.userName = "jcitizen";
        passOff.passPhrase = "My pass phrase";
        passOff.domainName = "test.com";
        expect(passOff.generatePassword("maximum-password")).toBeResolvedWith("h8_PBg0(ikEXvA93@mPC", done);

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
