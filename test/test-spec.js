/*global PassOff, TemporaryPhraseStore, describe, beforeEach, afterEach, JasminePromiseMatchers, it, expect, runs */

describe("Test Open Sesame Temporary Phrase Store", function () {
    var tempPhraseStore = new TemporaryPhraseStore();
    var encDataHolder, ivHolder;

    //beforeEach(JasminePromiseMatchers.install);



    it("should successfully encrypt phrase and name", function (done) {

        return tempPhraseStore.encryptPhrase("A special pass phrase", "JohnSmith")
            .then(function (val) {
                expect(val).toEqual("Success");
                expect(tempPhraseStore.encData).toBeDefined();
                done();
            });

    });

});
