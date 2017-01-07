/* global OpenSesame, TemporaryPhraseStore, describe, beforeEach, afterEach,
JasminePromiseMatchers, it, expect, runs, console */

describe('Test Open Sesame Missing Parameter Rejection', function() {
  let openSesame = new OpenSesame();
  let passwordType = 'maximum-password';

  beforeEach(JasminePromiseMatchers.install);


  it('should fail with no parameters specified', function(done) {
    expect(openSesame.generatePassword()).toBeRejected(done);
  });


  it('should fail with no pass phrase specified', function(done) {
    let userName = 'jane.citizen';
    let passPhrase = '';
    let domainName = 'test.com';
    let passwordType = 'answer';
    let vers = 1;
    let securityQuestion = 'why';

    let generatedPassword = openSesame.generatePassword(userName, passPhrase,
      domainName, passwordType, vers, securityQuestion);

    expect(generatedPassword).toBeRejected(done);
  });

  it('should fail with no domain specified', function(done) {
    openSesame.fullName = 'JaneCitizen';
    openSesame.passPhrase = 'My pass phrase';
    openSesame.domainName = '';
    openSesame.securityQuestion = 'why';
    expect(openSesame.generatePassword(passwordType)).toBeRejected(done);
  });

  it('answer type should fail with no question specified', function(done) {
    openSesame.fullName = 'JaneCitizen';
    openSesame.passPhrase = 'My pass phrase';
    openSesame.domainName = 'test.com';
    openSesame.securityQuestion = '';
    expect(openSesame.generatePassword('answer')).toBeRejected(done);
  });


  afterEach(JasminePromiseMatchers.uninstall);
});

describe('Test Maximum Passwords', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = 'h8_PBg0(ikEXvA93@mPC';
  let password = 'K7*Zf3$ke44hn%y)F8oi';
  let passwordType = 'maximum-password';
  let fullName = 'JaneCitizen';
  let userName = 'jcitizen';
  let passPhrase = 'My pass phrase';
  let domainName = 'test.com';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known password', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain starts with "www."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'www.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://www.' + domainName + '/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('i2?WPugak9Cmu&FkJXA@', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('f%hW1TBYaZQsRS9Vj@1=', done);
  });

  it('should generate a different password when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('MBaLdIZZQ!BCURcIno2?', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('W02ixFIwZIA0uvPDSM1%', done);
  });


  it('should generate known password without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain starts with "www."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'www.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://www.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('fjS*iSzTPQXlCBtM601;', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('dp#o7BBPRIRv#TgucM7_', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('cIF0Ge^jaIJC8sBFr41&', done);
  });

  afterEach(JasminePromiseMatchers.uninstall);
});

describe('Test Long Passwords', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = 'JukuBacqMawu0_';
  let password = 'Yusa1-JuroWuds';
  let passwordType = 'long-password';
  let fullName = 'JimiHendrix';
  let userName = 'jmhendrix';
  let passPhrase = 'I see you down on the street, oh foxy';
  let domainName = 'hendrix.com.au';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known password', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain starts with "mail."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'mail.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://mail.' + domainName + '/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Bopy3?WajnTado', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Qale1[CucuZiqb', done);
  });

  it('should generate a different password when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('CujeXeylMelz2;', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('HobnBahlGega4,', done);
  });


  it('should generate known password without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain starts with "mail."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'mail.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://mail.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('FihaGiju3;Toci', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('YoloMasiPoqa2[', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Gixo1!XopbYubq', done);
  });

  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Medium Passwords', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = 'HayXuj4$';
  let password = 'Yun5%Mux';
  let passwordType = 'medium-password';
  let fullName = 'JohnKennedy';
  let userName = 'jfk';
  let passPhrase = 'Ask not wht Pass Off can do for you';
  let domainName = 'grassyknoll.co.nz';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known password', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain starts with "double.barell."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'double.barell.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://double.barell.' + domainName + '/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Yeq5&Tul', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Haj8=Nun', done);
  });

  it('should generate a different password when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('QisHac6\'', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Mer9(Zic', done);
  });


  it('should generate known password without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain starts with "double.barell."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'double.barell.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://double.barell.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('KuhSat3.', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Was8%Zec', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('NerFol8?', done);
  });

  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Basic Passwords', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = 'iMr42cpW';
  let password = 'Gd11gls8';
  let passwordType = 'basic-password';
  let fullName = 'BobMarley';
  let userName = 'bobm';
  let passPhrase = 'Get up Stand Up';
  let domainName = 'bobmarley.org.tw';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known password', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain starts with "accounts."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'accounts.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://accounts.' + domainName + '/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('pR15qGC2', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('maw6yDE2', done);
  });

  it('should generate a different password when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Qp67wNf0', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Msm77bDg', done);
  });


  it('should generate known password without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain starts with "accounts."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'accounts.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://accounts.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('ls19hhn3', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('OME4cLd9', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('dy40iwK2', done);
  });
  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Short Passwords', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = 'Tob1';
  let password = 'Kej5';
  let passwordType = 'short-password';
  let fullName = 'Quantic';
  let userName = 'quantic';
  let passPhrase = 'Infinite rwgression';
  let domainName = 'soulorchestra.io';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known password', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain starts with "login."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'login.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://login.' + domainName + '/stuff/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Miv9', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Jen9', done);
  });

  it('should generate a different password when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Lac8', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Hut5', done);
  });


  it('should generate known password without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain starts with "login."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'login.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://login.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different password when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Gut4', done);
  });

  it('should generate a different password when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Nac5', done);
  });

  it('should generate a different password when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('Cap7', done);
  });
  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Four Digit Pin', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = '1759';
  let password = '6843';
  let passwordType = 'pin';
  let fullName = 'TylerDurden';
  let userName = 'tdurden';
  let passPhrase = 'The first rule of Pass Off is there is no Pass Off';
  let domainName = 'fightclub.edu.ca';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known PIN', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when domain starts with "www2."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'www2.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://www2.' + domainName + '/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different PIN when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('6083', done);
  });

  it('should generate a different PIN when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('3611', done);
  });

  it('should generate a different PIN when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('1898', done);
  });

  it('should generate a different PIN when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('0978', done);
  });


  it('should generate known PIN without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same PIN when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same PIN when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same PIN when domain starts with "www2."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'www2.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://www2.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different PIN when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('8584', done);
  });

  it('should generate a different PIN when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('3233', done);
  });

  it('should generate a different PIN when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('5600', done);
  });
  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Six Digit Pin', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = '684466';
  let password = '998384';
  let passwordType = 'pin-6';
  let fullName = 'MrRobot';
  let userName = 'elliot';
  let passPhrase = 'Evil Corp must die';
  let domainName = 'fsociety.co.uk';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known PIN', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same PIN when domain starts with "account.login."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'account.login.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://account.login.' + domainName + '/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different PIN when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('240985', done);
  });

  it('should generate a different PIN when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(1);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('886527', done);
  });

  it('should generate a different PIN when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('971333', done);
  });

  it('should generate a different PIN when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('212147', done);
  });


  it('should generate known PIN without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same PIN when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same PIN when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same PIN when domain starts with "account.login."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'account.login.' + domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'http://account.login.' + domainName + '/intothebowels/downthere/wtf.html';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different PIN when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('053243', done);
  });

  it('should generate a different PIN when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('446552', done);
  });

  it('should generate a different PIN when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('767092', done);
  });
  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Security Answers', function() {
  let openSesame = new OpenSesame();
  let passwordUserName = 'hu yifse ciq kujurba';
  let password = 'ceh qisyezoda wolu';
  let passwordType = 'answer';
  let fullName = 'KruderAndDorfmeister';
  let userName = 'kandd';
  let passPhrase = 'Bugpowder dust';
  let domainName = 'kanddsessions.cool';
  let secQuestion = 'What is your mother\'s maiden name?';

  beforeEach(JasminePromiseMatchers.install);


  it('should generate known answer', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when case is changed for name', function(done) {
    openSesame.fullName = fullName.toUpperCase();
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when case is changed for user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.toUpperCase();
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.securityQuestion = secQuestion;
    openSesame.domainName = domainName.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when domain starts with "www."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'www.' + domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://www.' + domainName + '/wtf.html';
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when question case is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when question punctuation is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = '"What" is your mothers maiden name';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate same answer when question spacing is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = 'What  is your mother\'s maiden   name ?';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(passwordUserName, done);
  });

  it('should generate a different answer when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase.toLowerCase();
    openSesame.domainName = domainName;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('lu lunlo piz zizovwu', done);
  });

  it('should generate a different answer when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('mo paltu kib cazojbe', done);
  });

  it('should generate a different answer when user name is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName.substring(2);
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('va sobsu qoj narixqe', done);
  });

  it('should generate a different answer when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(3);
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('qujl fav yenvoju gah', done);
  });

  it('should generate a different answer when question is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = userName;
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion.substring(8);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('si culni tob lugorju', done);
  });


  it('should generate known answer without a user name', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same answer when case is changed for name', function(done) {
    openSesame.fullName = fullName.toLowerCase();
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same answer when case is changed for domain', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.toUpperCase();
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same answer when domain starts with "www."', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'www.' + domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same password when domain has full URL', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = 'https://www.' + domainName + '/wtf.html';
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same answer when question case is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion.toUpperCase();
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same answer when question punctuation is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = '"What" is your mothers maiden name';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate same answer when question spacing is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = 'What  is your mother\'s maiden   name ?';
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith(password, done);
  });

  it('should generate a different answer when case is changed for pass phrase', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase.toUpperCase();
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('devk zap kuhsici ber', done);
  });

  it('should generate a different answer when full name is changed', function(done) {
    openSesame.fullName = fullName.substring(4);
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('dusb cir retzagi meq', done);
  });

  it('should generate a different answer when domain is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName.substring(1);
    openSesame.securityQuestion = secQuestion;
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('tibr vut mufwuju yoz', done);
  });

  it('should generate a different answer when question is changed', function(done) {
    openSesame.fullName = fullName;
    openSesame.userName = '';
    openSesame.passPhrase = passPhrase;
    openSesame.domainName = domainName;
    openSesame.securityQuestion = secQuestion.substring(8);
    expect(openSesame.generatePassword(passwordType)).toBeResolvedWith('pucp zuy vopjova met', done);
  });


  afterEach(JasminePromiseMatchers.uninstall);
});


describe('Test Open Sesame Temporary Phrase Store', function() {
  let encDataHolder,
    ivHolder;

  //beforeEach(JasminePromiseMatchers.install);


  it('should fail when attempting to encrypt empty pass phrase', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();
    expect(tempPhraseStore.encryptPhrase('', '')).toBeRejected(done);

  });

  it('should fail when attempting to decrypt empty encypted data', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();
    expect(tempPhraseStore.decryptPhrase('Thr', 'JohnSmith')).toBeRejected(done);
  });

  it('should successfully encrypt phrase and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    return tempPhraseStore.encryptPhrase('A special pass phrase', 'JohnSmith')
      .then(function(val) {
        expect(val).toEqual('Success');
        expect(tempPhraseStore.encData).toBeDefined();
        done();
      });


  });

  it('should produce different encrypted data for the same phrase and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();
    tempPhraseStore.encryptPhrase('A special pass phrase with some Punctuation!?', 'Jane Citizen')
      .then(function(val) {
        encDataHolder = tempPhraseStore.encData.ciphertext;
        ivHolder = tempPhraseStore.encData.iv;
        return true;
      })
      .then(function(val) {
        return tempPhraseStore.encryptPhrase('A special pass phrase with some Punctuation!?', 'Jane Citizen');
      })
      .then(function(val) {
        expect(tempPhraseStore.encData.ciphertext).not.toEqual(encDataHolder);
        expect(tempPhraseStore.encData.iv).not.toEqual(ivHolder);
        done();
      });
  });

  it('should successfully decrypt the phrase using the first three characters and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();
    tempPhraseStore.encryptPhrase('aP2 with Some Special Stuff', 'KruderAndDorfmeister')
      .then(function(val) {

        expect(tempPhraseStore.decryptPhrase('aP2', 'KruderAndDorfmeister')).toBeResolvedWith('aP2 with Some Special Stuff', done);
      });
  });

  it('should successfully decrypt a phrase with special characters using the first three characters and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('Ihëart årt and £$¢!', 'HumptyDumpty')
      .then(function(val) {
        expect(tempPhraseStore.decryptPhrase('Ihë', 'HumptyDumpty')).toBeResolvedWith('Ihëart årt and £$¢!', done);
      });

  });

  it('should fail to decrypt the phrase using the first two characters and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('Here is a special [phrase]', 'MrRobot')
      .then(function(val) {
        expect(tempPhraseStore.decryptPhrase('He', 'MrRobot')).toBeRejected(done);
      });
  });

  it('should remove encrypted data after failing to decrypt the phrase using the first two characters and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('Here is a special [phrase]', 'MrRobot')
      .then(function(val) {
        return tempPhraseStore.decryptPhrase('He', 'MrRobot');
      })
      .catch(function(err) {
        expect(tempPhraseStore.encData).not.toBeDefined();
        done();
      });
  });

  it('should fail to decrypt the phrase using the wrong case for the first three characters and name and encrypted data should be removed', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('This is a pass phrase', 'TylerDurden')
      .then(function(val) {
        expect(tempPhraseStore.decryptPhrase('tHI', 'TylerDurden')).toBeRejected(done);
      });
  });

  it('should remove encrypted data after failing to decrypt the phrase using the wrong case for the first three characters and name', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('This is a pass phrase', 'TylerDurden')
      .then(function(val) {
        return tempPhraseStore.decryptPhrase('tHI', 'TylerDurden');
      })
      .catch(function(err) {
        expect(tempPhraseStore.encData).not.toBeDefined();
        done();
      });
  });

  it('should clear encrypted data and hash when the clearStore method is called', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('This is a pass phrase', 'TylerDurden')
      .then(function(val) {
        tempPhraseStore.clearStore();
        expect(tempPhraseStore.encData).not.toBeDefined();
        done();
      });
  });

  it('should allow encrypted data and hash to be passed in and a succsefull decryption to occur', function(done) {
    let tempPhraseStore = new TemporaryPhraseStore();
    let tempPhraseStore2 = new TemporaryPhraseStore();

    tempPhraseStore.encryptPhrase('This is a pass phrase', 'TylerDurden')
      .then(function(val) {
        tempPhraseStore2.storeValues(tempPhraseStore.threeCharHash, tempPhraseStore.encData);
        expect(tempPhraseStore2.decryptPhrase('Thi', 'TylerDurden')).toBeResolvedWith('This is a pass phrase', done);
      });
  });


// afterEach(JasminePromiseMatchers.uninstall);
});
