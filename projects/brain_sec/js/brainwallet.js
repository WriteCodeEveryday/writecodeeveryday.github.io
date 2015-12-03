  var gen_from = 'pass';
  var gen_compressed = false;
  var gen_eckey = null;
  var gen_pt = null;
  var gen_ps_reset = false;
  var TIMEOUT = 600;
  var timeout = null;

  var PUBLIC_KEY_VERSION = 0;
  var PRIVATE_KEY_VERSION = 0x80;
  var ADDRESS_URL_PREFIX = 'http://blockchain.info'

  encode_length = function(len) {
    if (len < 0x80)
      return [len];
    else if (len < 255)
      return [0x80|1, len];
    else
      return [0x80|2, len >> 8, len & 0xff];
  }

  encode_id = function(id, s) {
    var len = encode_length(s.length);
    return [id].concat(len).concat(s);
  }

  encode_integer = function(s) {
    if (typeof s == 'number')
      s = [s];
    return encode_id(0x02, s);
  }

  encode_octet_string = function(s)  {
    return encode_id(0x04, s);
  }

  encode_constructed = function(tag, s) {
    return encode_id(0xa0 + tag, s);
  }

  encode_bitstring = function(s) {
    return encode_id(0x03, s);
  }

  encode_sequence = function() {
    sequence = [];
    for (var i = 0; i < arguments.length; i++)
      sequence = sequence.concat(arguments[i]);
    return encode_id(0x30, sequence);
  }


  function getEncoded(pt, compressed) {
    var x = pt.getX().toBigInteger();
    var y = pt.getY().toBigInteger();
    var enc = integerToBytes(x, 32);
    if (compressed) {
     if (y.isEven()) {
       enc.unshift(0x02);
     } else {
       enc.unshift(0x03);
     }
   } else {
     enc.unshift(0x04);
     enc = enc.concat(integerToBytes(y, 32));
   }
   return enc;
 }


 function getDER(eckey, compressed) {
  var curve = getSECCurveByName("secp256k1");
  var _p = curve.getCurve().getQ().toByteArrayUnsigned();
  var _r = curve.getN().toByteArrayUnsigned();
  var encoded_oid = [0x06, 0x07, 0x2A, 0x86, 0x48, 0xCE, 0x3D, 0x01, 0x01];

  var secret = integerToBytes(eckey.priv, 32);
  var encoded_gxgy = getEncoded(curve.getG(), compressed);
  var encoded_pub = getEncoded(gen_pt, compressed);

  return encode_sequence(
    encode_integer(1),
    encode_octet_string(secret),
    encode_constructed(0,
      encode_sequence(
        encode_integer(1),
        encode_sequence(
                        encoded_oid, //encode_oid(*(1, 2, 840, 10045, 1, 1)), //TODO
                        encode_integer([0].concat(_p))
                        ),
        encode_sequence(
          encode_octet_string([0]),
          encode_octet_string([7])
          ),
        encode_octet_string(encoded_gxgy),
        encode_integer([0].concat(_r)),
        encode_integer(1)
        )
      ),
    encode_constructed(1, 
      encode_bitstring([0].concat(encoded_pub))
      )
    );
}

function pad(str, len, ch) {
  padding = '';
  for (var i = 0; i < len - str.length; i++) {
    padding += ch;
  }
  return padding + str;
}

function setErrorState(field, err, msg) {
  var group = field.closest('.controls').parent();
  if (err) {
    group.addClass('has-error');
    group.attr('title',msg);
  } else {
    group.removeClass('has-error');
    group.attr('title','');
  }
}


function getAddressURL(addr) {
  if (ADDRESS_URL_PREFIX.indexOf('explorer.dot-bit.org')>=0 )
    return ADDRESS_URL_PREFIX+'/a/'+addr;
  else if (ADDRESS_URL_PREFIX.indexOf('address.dws')>=0 )
    return ADDRESS_URL_PREFIX+ "?" + addr;
  else if (ADDRESS_URL_PREFIX.indexOf('chainbrowser.com')>=0 )
    return ADDRESS_URL_PREFIX+'/address/'+addr+'/';
  else
    return ADDRESS_URL_PREFIX+'/address/'+addr;
}

function gen_update(str) {
  var returns = [];
  var eckey = gen_eckey;
  var compressed = gen_compressed;

  var hash_str = pad(str, 64, '0');
  var hash = Crypto.util.hexToBytes(hash_str);

  var hash160 = eckey.getPubKeyHash();

  var h160 = Crypto.util.bytesToHex(hash160);

  var addr = new Bitcoin.Address(hash160);
  addr.version = PUBLIC_KEY_VERSION;
  //$('#addr').val(addr);

  var payload = hash;

  if (compressed)
    payload.push(0x01);

  var sec = new Bitcoin.Address(payload);
  sec.version = PRIVATE_KEY_VERSION;
  //$('#sec').val(sec);

  returns["pub"] = addr.toString();
  returns["priv"] = sec.toString();
  return returns;

}

function generate(hash) {
  var hash_str = pad(hash, 64, '0');
  var hash = Crypto.util.hexToBytes(hash_str);
  eckey = new Bitcoin.ECKey(hash);
  gen_eckey = eckey;

  try {
    var curve = getSECCurveByName("secp256k1");
    gen_pt = curve.getG().multiply(eckey.priv);
    gen_eckey.pub = getEncoded(gen_pt, gen_compressed);
    gen_eckey.pubKeyHash = Bitcoin.Util.sha256ripe160(gen_eckey.pub);
  } catch (err) {
    console.info(err);
    return;
  }
  return gen_update(hash);
}

function generateBrainWalletFromHash(txt)
{
  var returns = [];
  returns["password"] = txt;
  var hash = Crypto.SHA256(txt, { asBytes: true });
  returns["result"] = generate(Crypto.util.bytesToHex(hash));
  return returns;
} 
