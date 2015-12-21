/* US Passport
- The Place of Birth (if in the United States) will be in the form "State, U.S.A." - (not seen)
- The Authority will specify the city of the passport office (New Orleans is one possibility (not seen)
- Passport numbers are 9 digits with no letters (confirmed - handled)
- There is no personal number (confirmed - handled)
- Type, Code, and Passport No. are on the same line. (not seen)
- Sex and Place of birth are on the same line. (not seen)
- Date of issue and Authority are on the same line. (not seen)
*/

function checkDigit(line){
	var factorization = [1,3,7]
	var encoding = {
		"<":0,
		"0":0,
		"1":1,
		"2":2,
		"3":3,
		"4":4,
		"5":5,
		"6":6,
		"7":7,
		"8":8,
		"9":9,
		"A":10,
		"B":11,
		"C":12,
		"D":13,
		"E":14,
		"F":15,
		"G":16,
		"H":17,
		"I":18,
		"J":19,
		"K":20,
		"L":21,
		"M":22,
		"N":23,
		"O":24,
		"P":25,
		"Q":26,
		"R":27,
		"S":28,
		"T":29,
		"U":30,
		"V":31,
		"W":32,
		"X":33,
		"Y":34,
		"Z":35
	}
	var checkTotal = 0
	for (var i = 0, len = line.length; i < len; i++) {
		var current = factorization.pop()
		factorization.unshift(current)
	checkTotal += (encoding[line[i]] * current)
	}
	checkTotal = checkTotal % 10;
	return checkTotal
}

function parseSecondLine(target, secondLine){
	target["CRC"] = {}
	var passportNumber = secondLine.substring(0,9);
	var passportCheckNumber = secondLine.substring(9,10);
	if (checkDigit(passportNumber) != passportCheckNumber){
		target["CRC"]["NUM"] = "Passport Number Does Not Match CRC";
	}
	target["passport"]["passportNumber"] = passportNumber;

	var nationality = secondLine.substring(10, 13);
	var dob = secondLine.substring(13,19);
	var dobCheckNumber = secondLine.substring(19,20);
	if (checkDigit(dob) != dobCheckNumber){
		target["CRC"]["DOB"]  = "Date Of Birth Does Not Match CRC";
	}
	target["personal"]["nationality"] = nationality;
	target["personal"]["dob"] = dob;

	var sex = secondLine.substring(20, 21)
	var passportExpiration = secondLine.substring(21,27);
	var passportExpirationCheckNumber = secondLine.substring(27,28);
	if (checkDigit(passportExpiration) != passportExpirationCheckNumber){
		target["CRC"]["EXP"] = "Passport Expiration Does Not Match CRC";
	}
	target["personal"]["sex"] = sex
	target["passport"]["passportExpiration"] = passportExpiration;

	var personalNumber = secondLine.substring(28, 42);
	var personalNumberCheckNumber = secondLine.substring(42, 43);
	if (checkDigit(passportExpiration) != passportExpirationCheckNumber){
		target["CRC"]["PER"]  = "Personal Number Does Not Match CRC";
	}
	if (target["passport"]["issuanceCountry"] != "USA"){
		target["personal"]["personalNumber"] = personalNumber;
	}

	var finalCheckNumber = secondLine.substring(43, 44);
	var finalCRC = secondLine.substring(0, 10) + secondLine.substring(13, 20) + secondLine.substring(21, 43);
	if (checkDigit(finalCRC) != finalCheckNumber){
		target["CRC"]["FIN"]  = "Final Check Failed";
	}

	if (Object.keys(target["CRC"]).length == 0){
		//CRC not required
		delete target["CRC"];
	}
}

function parseFirstLine(target, firstLine){
	var passportStyle = firstLine.substring(0,2);
	var nameUnparsed = firstLine.substring(2);

	if (passportStyle.substring(0,1)=="P"){
		var type = passportStyle.substring(1,2);
		if(type != "<"){
			target["passport"]["document"]="Passport"
			target["passport"]["document-type"]=type
		}
		else{
			target["passport"]["document"]="Passport"
			target["passport"]["document-type"]="Unknown"
		}
	}

	var nameFirstPortion = nameUnparsed.split("<<")[0];
	var issuedCountry = nameFirstPortion.substring(0,3);
	var lastNames = nameFirstPortion.substring(3);
	target["passport"]["issuanceCountry"] = issuedCountry;
	target["personal"]["lastName"] = lastNames.split("<").join(" ");
	var nameSecondPortion = nameUnparsed.split("<<")[1];
	target["personal"]["firstName"] = nameSecondPortion.split("<").join(" ").trim();
}
function extractFields(target, firstLine, secondLine){
	parseFirstLine(target, firstLine)
	parseSecondLine(target, secondLine)
}

Passport = (function(args) {
	var pssprt = {};
	var firstLine = args[0];
	var secondLine = args[1];

	if (!firstLine || !secondLine || !firstLine.length == 44 || !secondLine.length == 44){
		pssprt["error"] = "Something is not right"
		return
	}

	pssprt["passport"] = {}
	pssprt["personal"] = {}
	extractFields(pssprt, firstLine, secondLine);
	return pssprt;
});