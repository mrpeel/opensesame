function AddressBook() {
    this.contacts = [];
    this.initialComplete = false;

}

AddressBook.prototype.getInitialContacts = function (cb) {
    var self = this;

    setTimeout(function () {
        self.initialComplete = true;
        if (cb) {
            return cb();
        }
    }, 3);

}

AddressBook.prototype.addContact = function (contact) {
    this.contacts.push(contact);
}

AddressBook.prototype.getContact = function (index) {
    return this.contacts[index];
}

AddressBook.prototype.deleteContact = function (index) {
    this.contacts.splice(index, 1);
}

AddressBook.prototype.promiseMe = function () {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            resolve("result");
        }, 2000);
    });
}

AddressBook.prototype.rejectMe = function () {
    return new Promise(function (resolve, reject) {
        setTimeout(function () {
            reject("error");
        }, 2000);
    });
}
