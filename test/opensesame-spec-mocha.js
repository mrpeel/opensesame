/* global  chai, mocha, chaiAsPromised, OpenSesame */

mocha.setup('bdd');
mocha.reporter('html');

const expect = chai.expect;

chai.use(chaiAsPromised);

let openSesame = new OpenSesame();
let tempPhraseStore = new TemporaryPhraseStore();
let tempPhraseStore2 = new TemporaryPhraseStore();


describe('Test Open Sesame helper functions', function() {
  it('should trim usernames', function() {
    expect(openSesame.prepareUserName(' neilkloot ')).to.equal('neilkloot');
  });

  it('should make usernames lower case', function() {
    expect(openSesame.prepareUserName('NeIlKloOT')).to.equal('neilkloot');
  });

  it('should trim and make usernames lower case', function() {
    expect(openSesame.prepareUserName('   NeIlKloOT ')).to.equal('neilkloot');
  });

  it('should make a domain lower case', function() {
    expect(openSesame.prepareDomain('TeST.Com')).to.equal('test.com');
  });

  it('should remove the "www." from a domain', function() {
    expect(openSesame.prepareDomain('www.test.com')).equal('test.com');
  });

  it('should remove the "www2." from a domain', function() {
    expect(openSesame.prepareDomain('www2.live.co.nz')).equal('live.co.nz');
  });


  it('should resolve a full URL to its base domain', function() {
    expect(openSesame
      .prepareDomain('https://www.test.com.au/subdir/somefile.html'))
      .equal('test.com.au');
  });

  it('should remove the "mail." from a domain', function() {
    expect(openSesame.prepareDomain('mail.google.com')).equal('google.com');
  });

  it('should remove the "accounts." from a domain',
    function() {
      expect(openSesame.prepareDomain('accounts.mydomain.com.au'))
        .equal('mydomain.com.au');
    });

  it('should convert a question to lower case', function() {
    expect(openSesame.prepareSecurityQuestion('This Is a Question'))
      .equal('this is a question');
  });

  it('should remove punctuation from a question', function() {
    expect(openSesame.prepareSecurityQuestion('This "is" a question?'))
      .equal('this is a question');
  });

  it('should remove multiple spacing from a question', function() {
    expect(openSesame.prepareSecurityQuestion('This   is a      question?'))
      .equal('this is a question');
  });

  it('should trim space from a question', function() {
    return expect(openSesame
      .prepareSecurityQuestion('     This is a question   '))
      .equal('this is a question');
  });
});

describe('Test Open Sesame Missing Parameter Rejection', function() {
  it('should fail with no parameters specified', function() {
    return expect(openSesame.generatePassword()).eventually.isRejected;
  });

  it('should fail with no pass phrase specified', function() {
    let userName = 'jane.citizen';
    let passPhrase = '';
    let domainName = 'test.com';
    let passwordType = 'answer';
    let vers = 1;
    let securityQuestion = 'why';

    return expect(openSesame.generatePassword(userName,
      passPhrase, domainName, passwordType, vers, securityQuestion))
      .eventually.isRejected;
  });

  it('should fail with no domain specified', function() {
    let userName = 'jane.citizen';
    let passPhrase = 'My pass phrase';
    let domainName = '';
    let passwordType = 'answer';
    let vers = 1;
    let securityQuestion = 'why';

    return expect(openSesame.generatePassword(userName,
      passPhrase, domainName, passwordType, vers, securityQuestion))
      .eventually.isRejected;
  });

  it('answer type should fail with no question specified', function() {
    let userName = 'jane.citizen';
    let passPhrase = 'My pass phrase';
    let domainName = 'test.com';
    let passwordType = 'answer';
    let vers = 1;
    let securityQuestion = 'why';

    return expect(openSesame.generatePassword(userName,
      passPhrase, domainName, passwordType, vers, securityQuestion))
      .eventually.isRejected;
  });
});


describe('Test Password Generation', function() {
  let userName = 'jane.citizen';
  let passPhrase = 'My pass phrase';
  let domainName = 'test.com';
  let vers = 1;
  let passwordCombinations = [{
    passwordType: 'maximum-password',
    result: 'I$6s^9I!Blu&80YjgTjs',
  },
    {
      passwordType: 'long-password',
      result: 'Vp2*^9I!Blu&80',
    },
    {
      passwordType: 'medium-password',
      result: '^$6sN9I!',
    },
    {
      passwordType: 'basic-password',
      result: 'mER2QAcB',
    },
    {
      passwordType: 'short-password',
      result: 'mPR7QA',
    },
    {
      passwordType: 'pin',
      result: '5227',
    },
    {
      passwordType: 'pin-6',
      result: '522737',
    },
    {
      passwordType: 'answer',
      securityQuestion: 'Mother\'s maaiden name',
      result: 'xgy xt xmfgw bug',
    },
  ];

  passwordCombinations.forEach(function(passwordDetails) {
    let result = passwordDetails.result;
    let passwordType = passwordDetails.passwordType;
    let securityQuestion = null;
    if (passwordType === 'answer') {
      securityQuestion = passwordDetails.securityQuestion;
    }

    it(passwordType + ' should generate known password', function() {
      return expect(openSesame.generatePassword(userName,
        passPhrase, domainName, passwordType, vers, securityQuestion))
        .eventually.to.equal(result);
    });

    it(passwordType +
    ' should generate same password when case is changed for user name',
      function() {
        return expect(openSesame.generatePassword(userName.toUpperCase(),
          passPhrase, domainName, passwordType, vers, securityQuestion))
          .eventually.to.equal(result);
      });

    it(passwordType +
    ' should generate same password when case is changed for domain',
      function() {
        return expect(openSesame.generatePassword(userName,
          passPhrase, domainName.toUpperCase(), passwordType, vers,
          securityQuestion))
          .eventually.to.equal(result);
      });

    it(passwordType +
    ' should generate same password when domain starts with "www."',
      function() {
        return expect(openSesame.generatePassword(userName,
          passPhrase, ('www.' + domainName), passwordType, vers,
          securityQuestion))
          .eventually.to.equal(result);
      });

    it(passwordType +
      ' should generate same password when domain has full URL', function() {
        return expect(openSesame.generatePassword(userName, passPhrase,
          ('https://www.' + domainName + '/wtf.html'), passwordType, vers,
          securityQuestion))
          .eventually.to.equal(result);
      });

    it(passwordType +
    ' should generate different password when case is changed for pass phrase',
      function() {
        return expect(openSesame.generatePassword(userName,
          passPhrase.toUpperCase(), domainName, passwordType, vers,
          securityQuestion))
          .eventually.not.equal(result);
      });

    it(passwordType +
    ' should generate different password when password version is changed',
      function() {
        return expect(openSesame.generatePassword(userName, passPhrase,
          domainName, passwordType, vers + 7, securityQuestion))
          .eventually.not.equal(result);
      });

    it(passwordType +
    ' should generate a different password when user name is changed',
      function() {
        return expect(openSesame.generatePassword(userName.substring(2),
          passPhrase, domainName, passwordType, vers, securityQuestion))
          .eventually.not.equal(result);
      });

    it(passwordType +
    ' should generate a different password when domain is changed',
      function() {
        return expect(openSesame.generatePassword(userName,
          passPhrase, domainName.substring(3), passwordType, vers,
          securityQuestion))
          .eventually.not.equal(result);
      });

    if (passwordType === 'answer') {
      it(passwordType +
      ' should generate the same password when case is changedin question',
        function() {
          return expect(openSesame.generatePassword(userName,
            passPhrase, domainName, passwordType, vers,
            securityQuestion.toUpperCase()))
            .eventually.to.equal(result);
        });

      it(passwordType +
        ' should generate the same password when punctuation is changed ' +
        'in question', function() {
          return expect(openSesame.generatePassword(userName,
            passPhrase, domainName, passwordType, vers,
            '#' + securityQuestion + '.?'))
            .eventually.to.equal(result);
        });

      it(passwordType + ' should generate the same password when when ' +
        'multiple spacing in question', function() {
          return expect(openSesame.generatePassword(userName,
            passPhrase, domainName, passwordType, vers,
            securityQuestion.replace(' ', '  ')))
            .eventually.to.equal(result);
        });

      it(passwordType + ' should generate the same password extra space at ' +
        'the beggining and end of question', function() {
          return expect(openSesame.generatePassword(userName,
            passPhrase, domainName, passwordType, vers,
            '  ' + securityQuestion + ' '))
            .eventually.to.equal(result);
        });
    }
  });
});


describe('Test Open Sesame Temporary Phrase Store', function() {
  let encDataHolder;
  let ivHolder;

  it('should fail when attempting to encrypt empty pass phrase', function() {
    return expect(tempPhraseStore.encryptPhrase('', ''))
      .eventually.isRejected;
  });

  it('should fail when attempting to decrypt empty encypted data', function() {
    return expect(tempPhraseStore.decryptPhrase('Thr', 'JohnSmith'))
      .eventually.isRejected;
  });

  it('should successfully encrypt phrase and user name', function(done) {
    tempPhraseStore.encryptPhrase('A special pass phrase', 'JohnSmith')
      .then(function(val) {
        expect(val).to.equal('Success');
        expect(tempPhraseStore.encData).to.exist;
        done();
      });
  });

  it('should produce different encrypted data for the same phrase and user' +
    ' name', function(done) {
      tempPhraseStore
        .encryptPhrase('A special pass phrase with some Punctuation!?',
          'Jane Citizen')
        .then(function(val) {
          encDataHolder = tempPhraseStore.encData.ciphertext;
          ivHolder = tempPhraseStore.encData.iv;
          return true;
        })
        .then(function() {
          return tempPhraseStore
            .encryptPhrase('A special pass phrase with some Punctuation!?',
              'Jane Citizen');
        })
        .then(function(val) {
          expect(tempPhraseStore.encData.ciphertext)
            .to.not.equal(encDataHolder);
          expect(tempPhraseStore.encData.iv)
            .to.not.equal(ivHolder);
          done();
        });
    });

  it('should successfully decrypt the phrase using the first three' +
    ' characters and user name', function(done) {
      let plainText = 'aP2 with Some Special Stuff';
      let userName = 'KruderAndDorfmeister';

      tempPhraseStore.encryptPhrase(plainText,
        userName)
        .then(function(val) {
          expect(tempPhraseStore.decryptPhrase(plainText.substring(0, 3),
            userName))
            .eventually.to.equal(plainText);
          done();
        });
    });

  it('should successfully decrypt a phrase with special characters' +
    ' using the first three characters and user name', function(done) {
      let plainText = 'Ihëart årt and £$¢!';
      let userName = 'HumptyDumpty';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          expect(tempPhraseStore.decryptPhrase(plainText.substring(0, 3),
            userName))
            .eventually.to.equal(plainText);
          done();
        });
    });

  it('should fail to decrypt the phrase using the first two' +
    ' characters and user name', function() {
      let plainText = 'Here is a special [phrase]';
      let userName = 'MrRobot';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          return expect(tempPhraseStore.decryptPhrase(plainText.substring(0, 2),
            userName)).eventually.isRejected;
        }).catch(function(err) {});
    });

  it('should remove encrypted data after failing to decrypt the phrase' +
    ' using the first two characters and user name', function(done) {
      let plainText = 'Here is a special [phrase]';
      let userName = 'MrRobot';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          return tempPhraseStore.decryptPhrase('He', userName);
        })
        .catch(function(err) {
          expect(tempPhraseStore.encData).to.be.undefined;
          done();
        });
    });

  it('should fail to decrypt the phrase using the wrong case for the' +
  ' first three characters and user name and encrypted data should be removed',
    function() {
      let plainText = 'This is a pass phrase';
      let userName = 'TylerDurden';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          return expect(tempPhraseStore.decryptPhrase(plainText.toLowerCase(),
            userName)).eventually.isRejected;
        });
    });

  it('should remove encrypted data after failing to decrypt the phrase using' +
  ' the wrong case for the first three characters and user name',
    function(done) {
      let plainText = 'This is a pass phrase';
      let userName = 'TylerDurden';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          return tempPhraseStore.decryptPhrase(plainText.substring(0, 2)
            .toUpperCase(), 'TylerDurden');
        })
        .catch(function(err) {
          expect(tempPhraseStore.encData).to.be.undefined;
          done();
        });
    });

  it('should clear encrypted data and hash when the clearStore method is' +
    ' called', function(done) {
      let plainText = 'This is a pass phrase';
      let userName = 'TylerDurden';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          tempPhraseStore.clearStore();
          expect(tempPhraseStore.encData).to.be.undefined;
          done();
        });
    });

  it('should allow encrypted data and hash to be passed in and a successfull ' +
    ' decryption to occur', function() {
      let plainText = 'This is a pass phrase';
      let userName = 'TylerDurden';

      tempPhraseStore.encryptPhrase(plainText, userName)
        .then(function(val) {
          tempPhraseStore2.storeValues(tempPhraseStore.threeCharHash,
            tempPhraseStore.encData);
          return expect(tempPhraseStore2.decryptPhrase('Thi', 'TylerDurden'))
            .eventually.to.equal(plainText);
        });
    });
});
