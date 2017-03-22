Array.prototype.randomElement = function () {
    return this[Math.floor(Math.random() * this.length)]
}

function generate_barcode(barcode){
  // block sizes (width and height) in pixels
  var bw = 4;
  var bh = 2;

  // create canvas element based on number of columns and rows in barcode
  var canvas = document.createElement('canvas');
  canvas.width = bw * barcode['num_cols'];
  canvas.height = bh * barcode['num_rows'];
  document.getElementById('pdf_output').appendChild(canvas);
  var ctx = canvas.getContext('2d');
  // graph barcode elements
  var y = 0;
  // for each row
  for (var r = 0; r < barcode['num_rows']; ++r) {
    var x = 0;
    // for each column
    for (var c = 0; c < barcode['num_cols']; ++c) {
      if (barcode['bcode'][r][c] == 1) {
        ctx.fillRect(x, y, bw, bh);
      }
      x += bw;
    }
    y += bh;
  }
}

function generate_pdf(ofac, underage, futureIssuance, expired){
  var codes = {
    DAA: 'fullName',
    DAC: 'firstName',
    DAB: 'lastName',
    DAG: 'address',
    DAI: 'city',
    DAJ: 'state',
    DAK: 'postalCode',
    DAQ: 'licenseNumber',
    DAR: 'licenseClass',
    DAS: 'licenseRestrictions',
    DAT: 'licenseEndorsements',
    DBA: 'expirationDate',
    DBB: 'dateOfBirth',
    DBC: 'gender',
    DBD: 'issuanceDate',
    DAU: 'height'
  }

  if (ofac){
    var firstName = "ABDALLAH";
    var lastName = "FAYSAL";
  } else {
    var firstName = chance.first();
    var lastName = chance.last();
  }

  var current_year = parseInt(new Date().getFullYear());

  if (underage){
    var dob = chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year - 10, max: current_year}) })
  } else {
    var dob = chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year - 120, max: current_year - 21}) })
  }

  if (futureIssuance){
    var issuanceDate = chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year + 1, max: current_year + 50}) })
  } else {
    var issuanceDate = chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year - 10, max: current_year -1 }) })
  }

  if (expired){
    var expirationDate = chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year - 10, max: current_year - 1 }) })
  } else {
    var expirationDate = chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year + 1, max: current_year + 50}) })
  }

  var gender = chance.integer({min: 1, max: 2})
  var height = chance.integer({min: 501, max: 512})

  var fullName = lastName + ", " + firstName;
  var data_codes = {
    "firstName": firstName.toUpperCase(),
    "lastName": lastName.toUpperCase(),
    "fullName": fullName.toUpperCase(),
    "dateOfBirth": dob.split("/").join('').split(",").join(''),
    "address": chance.address().toUpperCase(),
    "city": chance.city().toUpperCase(),
    "state": chance.state().toUpperCase(),
    "country": 'US',
    "postalCode": chance.zip({plusfour: true}),
    "licenseNumber": lastName[0].toUpperCase() + chance.integer({min: 1000000000, max: 999999999999}),
    "licenseClass": ['A','B','C','E'].randomElement(),
    "licenseRestrictions": ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'S', 'T', 'X', 'Y', '1', '2', '3', '4', '5', '6', '7', 'NONE'].randomElement(),
    "licenseEndorsements": ['H', 'N', 'P', 'S', 'T', 'X', 'NONE'].randomElement(),
    "expirationDate": expirationDate.split("/").join('').split(",").join(''),
    "issuanceDate": issuanceDate.split("/").join('').split(",").join(''),
    "gender": gender,
    "height": height
  }

  var keys = Object.keys(codes);
  for (var i = 0; i < keys.length; i++){
    var lookup = keys[i];
    codes[lookup] = data_codes[codes[lookup]];
  }

  var data = '';
  for (var i = 0; i < keys.length; i++){
    var lookup = keys[i];
    if (i > 0){
      data += "\n";
    }
    data += lookup + codes[lookup];
  }
  data += " ZFZA\n";
  data += "ZFB\n";
  data += "ZFCT" + chance.integer({min: 100000000000, max: 900000000000}) + "\n";
  data += "ZFD\n";
  data += "ZFE" + chance.birthday({ string: true, american: true, day: chance.integer({min: 10, max: 28}), month: chance.integer({min: 9, max: 11}), year: chance.integer({min: current_year - 10, max: current_year}) }).split("/").join('-').split(",").join('-')

  var issuer = chance.integer({min: 100000, max: 900000})
  var version_number = '01'
  var subfile_number = '02'

  //setup initial ANSI string.
  var data_calculation = "@\n\rANSI " + issuer + version_number + subfile_number + "DL" + '00000000' + "ZF" + chance.integer({min: 100000, max: 900000}) + "DL";

  //data-length, first part is where the first part of the ID begins, second part is where it ends.
  var data_length = '' + data_calculation.length;
  while (data_length.length < 4){
    data_length = '0' + data_length;
  }

  var final_length = data_calculation.length + data.length;
  final_length = '' + final_length;
  while (final_length < 4){
    final_length = '0' + data_length;
  }
  data_length = data_length + final_length

  var data_final = "@\n\rANSI " + issuer + version_number + subfile_number + "DL" + data_length + "ZF" + chance.integer({min: 100000, max: 900000}) + "DL";
  data = data_final + data

  PDF417.init(data);
  var barcode = PDF417.getBarcodeArray();
  generate_barcode(barcode);
}

Pdf417 = (function(args){
  var ofac = args[0];
  var underage = args[1];
  var futureIssuance = args[2];
  var expired = args[3];
  generate_pdf(ofac, underage, futureIssuance, expired);
});
