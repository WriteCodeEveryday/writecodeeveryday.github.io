var animate = window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  window.mozRequestAnimationFrame ||
  function(callback) { window.setTimeout(callback, 1000/60) };

var dimension = [window.innerWidth, window.innerHeight];
var canvas = document.createElement('canvas');
var width = dimension[0];
var height = dimension[1];
canvas.width = width;
canvas.height = height;
var context = canvas.getContext('2d');

var bitfinex_price = 0;
var bitfinex_volume = 0;
var bitstamp_price = 0;
var bitstamp_volume = 0;
var coinbase_price = 0;
var coinbase_volume = 0;
var blockchain_volume= 0;
var blockexplorer_volume = 0;
var biteasy_volume = 0;
var missed_transactions = 0;


var fps = {
  startTime : 0,
  frameNumber : 0,
  getFPS : function(){
    this.frameNumber++;
    var d = new Date().getTime(),
      currentTime = ( d - this.startTime ) / 1000,
      result = Math.floor( ( this.frameNumber / currentTime ) );

    if( currentTime > 1 ){
      this.startTime = new Date().getTime();
      this.frameNumber = 0;
    }
    return result;

  } 
};

function Paddle(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
  this.x_speed = 0;
  this.y_speed = 0;
}

Paddle.prototype.render = function() {
  context.fillStyle = "#F64F53";
  context.fillRect(this.x, this.y, this.width, this.height);
};

function Computer() {
  this.paddle = new Paddle(width - 20, height/2 - 50, 10, 100);
}

Computer.prototype.update = function(ball)
{
  if (ball != null)
  {
    this.paddle.y = this.paddle.y + 0.5 * (ball.y - 50 - this.paddle.y)
  }
}

Computer.prototype.render = function() {
  this.paddle.render();
};

function Ball(x, y, price, amount, api) {
  this.x = x;
  this.y = y;
  this.price = price;
  this.amount = Math.abs(amount);
  this.api = api;
  this.x_speed = Math.min(Math.max(this.amount * 4, 1), 5);
  this.y_speed = Math.log(1 + this.amount);
  this.radius = 15;
}

Ball.prototype.render = function() {
  context.beginPath();
  context.fillStyle = "#309793";
  context.arc(this.x, this.y, this.radius * Math.log(1 + this.amount), 2 * Math.PI, false);
  context.fill();
  context.closePath();

  context.font="12px Georgia";
  var golden_ratio = (this.radius * Math.log(1 + this.amount) * 1.5)
  var golden_ratiox = (this.radius * Math.log(1 + this.amount) * 0.5)
  context.fillText(this.amount + "BTC (" + this.api + ")",this.x - golden_ratiox, this.y - golden_ratio);
};

Ball.prototype.update = function(paddle) {
  this.x += this.x_speed;
  this.y += this.y_speed;

  if (this.x > width)
  {
    missed_transactions++;
  }

  var top_x = this.x - 5;
  var top_y = this.y - 5;
  var bottom_x = this.x + 5;
  var bottom_y = this.y + 5;

  if(this.y - 5 < 0) { // hitting the bottom wall
    this.y = 5;
    this.y_speed = -this.y_speed;
  } else if(this.y + 5 > height) { // hitting the top wall
    this.y = 595;
    this.y_speed = -this.y_speed;
  }

  if((top_x < (paddle.x + paddle.width) && bottom_x > paddle.x && top_y < (paddle.y + paddle.height) && bottom_y > paddle.y) || this.x > width) {
    // hit the paddle
    //console.log("["+this.amount+"BTC @ $"+this.price+"] => "+this.api);
    if (this.api == "Bitfinex")
    {
      bitfinex_price = this.price;
      bitfinex_volume += this.amount;
    }
    else if (this.api == "Coinbase")
    {
      coinbase_price = this.price;
      coinbase_volume += parseFloat(this.amount);
    }
    else if (this.api == "Bitstamp")
    {
      bitstamp_price = this.price;
      bitstamp_volume += this.amount;
    }
    else if (this.api == "Blockchain.info")
    {
      blockchain_volume += this.amount;
    }
    else if (this.api == "Biteasy.com")
    {
      biteasy_volume += this.amount;
    }
    else if (this.api == "Blockexplorer.com")
    {
      blockexplorer_volume += this.amount;
    }

    if (balls.length > 0)
    {
      var first  = balls[0];
      var second = getMax(balls);
      balls[balls.indexOf(second)] = first;
      balls[0] = second;
    }
    balls.splice(0,1);
  }
};

var computer = new Computer();
var balls = [];

window.onload = function() {
  document.body.appendChild(canvas);
  animate(step);
};

function getMax(balls){
  var maxBall = balls[0];
  for (ball of balls) {
    if (ball.x > maxBall.x)
    {
      maxBall = ball;
    }
  }
  return maxBall;
}

var update = function() {
  for (ball of balls) {
    ball.update(computer.paddle);
  }
  if (balls.length > 0)
  {
    computer.update(getMax(balls));
  }
};

var ui = function() {
  var initialWidth = width / 50;
  var initialHeight = height / 30;
  var temp = initialWidth;
  var temp2 = initialHeight

  context.fillStyle = "#0a5e96";
  context.font="18px Georgia";
  context.fillText("Exchanges", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14px Georgia";
  context.fillText("Bitfinex -> $" + bitfinex_price + " [" + bitfinex_volume.toFixed(4) + " BTC]", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14p Georgia";
  context.fillText("Bitstamp -> $" + bitstamp_price + " [" + bitstamp_volume.toFixed(4) + " BTC]", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14px Georgia";
  context.fillText("Coinbase -> $" + coinbase_price + " [" + coinbase_volume.toFixed(4) + " BTC]", initialWidth, initialHeight);
  initialHeight += temp2;

  initialWidth += (width / 3) - temp * 2;
  initialHeight = temp2;
  context.font="18px Georgia";
  context.fillText("Block Explorers (UN TX)", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14px Georgia";
  context.fillText("Blockchain.info -> [" + blockchain_volume.toFixed(4) + " BTC]", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14p Georgia";
  context.fillText("Blockexplorer.com -> [" + blockexplorer_volume.toFixed(4) + " BTC]", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14px Georgia";
  context.fillText("BitEasy.com -> [" + biteasy_volume.toFixed(4) + " BTC]", initialWidth, initialHeight);
  initialHeight += temp2;

  initialWidth += (width / 3) - temp;
  initialHeight = temp2;
  context.font="18px Georgia";
  context.fillText("Stats", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14px Georgia";
  context.fillText("Frames Per Second -> [" + fps.getFPS() + "]", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14p Georgia";
  context.fillText("Missed Transactions -> [" + missed_transactions + "]", initialWidth, initialHeight);
  initialHeight += temp2;

  context.font="14p Georgia";
  var ratio = (bitfinex_volume + bitstamp_volume +  coinbase_volume) / Math.floor(blockchain_volume, Math.floor(blockexplorer_volume, biteasy_volume));
  context.fillText("Exchange/Transaction Volume -> [" + (ratio * 100).toFixed(2) + "%]", initialWidth, initialHeight);
  initialHeight += temp2;
}

var render = function() {
  context.fillStyle = "#FFFFFF";
  context.fillRect(0, 0, width, height);

  for (ball of balls) {
    ball.render();
  }
  computer.render();
  ui();
};

var step = function() {
  update();
  render();
  animate(step);
};

//Bitfinex
var bitfinex = new WebSocket("wss://api2.bitfinex.com:3000/ws");
bitfinex.onmessage = function(msg) {
  var json = JSON.parse(msg.data);
  if (json[1] != "hb" && json.length > 2)
  {
    balls.push(new Ball(0, Math.random() * height, json[3], json[4], "Bitfinex"));
  }
};
bitfinex.onopen = function()
{
  bitfinex.send(JSON.stringify({
    "event": "subscribe",
    "channel": "trades",
    "pair": "BTCUSD"
  }))
}

//Bitstamp
var pusher = new Pusher("de504dc5763aeef9ff52");
var chan = pusher.subscribe('live_trades');
pusher.bind('trade',
  function(data) {
    balls.push(new Ball(0, Math.random() * height, data.price, data.amount, "Bitstamp"));
  }
);

//Coinbase
var coinbase = new WebSocket("wss://ws-feed.exchange.coinbase.com");
coinbase.onmessage = function(msg) {
  var json = JSON.parse(msg.data);
  if (json.type == "match")
  {
    balls.push(new Ball(0, Math.random() * height, json.price, json.size, "Coinbase"));
  }
};
coinbase.onopen = function()
{
  coinbase.send(JSON.stringify({
    "type": "subscribe",
    "product_id": "BTC-USD"
  }))
}

//Blockchain.info
var blockchain = new WebSocket("wss://ws.blockchain.info/inv");
blockchain.onmessage = function(msg) {
  var json = JSON.parse(msg.data);
  if (json.op == "utx")
  {
    var total_value = 0;
    for (output of json.x.out) {
      total_value += output.value;
    }
    total_value = total_value / 100000000;
    balls.push(new Ball(0, Math.random() * height, "NA", total_value, "Blockchain.info"));
  }
};
blockchain.onopen = function()
{
  blockchain.send(JSON.stringify({
    "op":"unconfirmed_sub"
  }))
}

//Biteasy.com
var biteasy = new WebSocket("wss://ws.biteasy.com/blockchain/v1");
biteasy.onmessage = function(msg) {
  var json = JSON.parse(msg.data);
  if (json.event == "transactions:create")
  {
    balls.push(new Ball(0, Math.random() * height, "NA", json.data.outputs_value / 100000000, "Biteasy.com"));
  }
};
biteasy.onopen = function()
{
  biteasy.send(JSON.stringify({
    "event": "transactions:create"
  }))
}


//Blockexplorer.com
var blockexplorer = io("https://blockexplorer.com/");
blockexplorer.on('connect', function() {
  blockexplorer.emit('subscribe', "inv");
})
blockexplorer.on("tx", function(data) {
  balls.push(new Ball(0, Math.random() * height, "NA", data.valueOut, "Blockexplorer.com"));
})



