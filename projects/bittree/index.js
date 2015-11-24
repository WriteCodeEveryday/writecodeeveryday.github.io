// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

var width = window.innerWidth,
  height = window.innerHeight;

// Define the data for the example. In general, a force layout
// requires two data arrays. The first array, here named `nodes`,
// contains the object that are the focal point of the visualization.
// The second array, called `links` below, identifies all the links
// between the nodes. (The more mathematical term is "edges.")

// For the simplest possible example we only define two nodes. As
// far as D3 is concerned, nodes are arbitrary objects. Normally the
// objects wouldn't be initialized with `x` and `y` properties like
// we're doing below. When those properties are present, they tell
// D3 where to place the nodes before the force layout starts its
// magic. More typically, they're left out of the nodes and D3 picks
// random locations for each node. We're defining them here so we can
// get a consistent application of the layout which lets us see the
// effects of different properties.

/*
var nodes = [
  { x:   width/3, y: height/2 },
  { x: 2*width/3, y: height/2 }
];*/

var nodes = [];

// The `links` array contains objects with a `source` and a `target`
// property. The values of those properties are the indices in
// the `nodes` array of the two endpoints of the link.

/*
var links = [
  { source: 0, target: 1 }
]; */
var links = [];


var svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height);

var zoom = d3.behavior.zoom()

var force = d3.layout.force()
  .size([width, height])
  .nodes(nodes)
  .links(links)
  .charge(-20)
  .on("tick", tick);;

force.linkDistance(width/nodes.length);

var link = svg.selectAll('.link')
  .data(links)
  .enter().append('line')
  .attr('class', 'link');

var node = svg.selectAll('.node')
  .data(nodes)
  .enter().append('circle')
  .attr('class', 'node');

function tick() {
  force.linkDistance(width/nodes.length);
  
  node.attr('r', 5)
  .attr('cx', function(d) { return d.x; })
  .attr('cy', function(d) { return d.y; });

  link.attr('x1', function(d) { return d.source.x; })
  .attr('y1', function(d) { return d.source.y; })
  .attr('x2', function(d) { return d.target.x; })
  .attr('y2', function(d) { return d.target.y; });
}

force.start();

function existOrCreate(address1, address2, value1, value2)
{
  var address1index = -1;
  var address2index = -1;

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].id === address1) {
      address1index = i;
    }
  }

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].id === address2) {
      address2index = i;
    }
  }

  if (address1index == -1)
  {
    address1index = nodes.length;
    nodes.push({id: address1, value: value1, x: Math.random() * width, y: Math.random() * height, type: "input"});
  }

  if (address2index == -1)
  {
    address2index = nodes.length;
    nodes.push({id: address2, value: value2, x: Math.random() * width, y: Math.random() * height, type: "output"});
  }

  links.push({ source: nodes[address1index], target: nodes[address2index] });
}

function updateGraph(data)
{
  var ins = data.x.inputs
  for (input of ins) {
    var out = data.x.out
    for (output of out) {
      existOrCreate(input.prev_out.addr, output.addr, input.prev_out.value, output.value);
    }
  }
}

function paintGraph()
{
  link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
  link.enter().insert("line", ".node").attr("class", "link");
  link.exit().remove();

  node = node.data(force.nodes(), function(d) { return d.id;});
  node.enter().append("circle").attr("class", function(d) { return "node " + d.type; }).attr("r", 5);
  node.exit().remove();

  force.start();
  zoom.scale(nodes.length);
}

setInterval(paintGraph, 1000/30);

//Blockchain.info
var blockchain = new WebSocket("wss://ws.blockchain.info/inv");
blockchain.onmessage = function(msg) {
  var json = JSON.parse(msg.data);
  if (json.op == "utx")
  {
    updateGraph(json);
  }
};
blockchain.onopen = function()
{
  blockchain.send(JSON.stringify({
    "op":"unconfirmed_sub"
  }))
}



// By the time you've read this far in the code, the force
// layout has undoubtedly finished its work. Unless something
// went horribly wrong, you should see two light grey circles
// connected by a single dark grey line. If you have a screen
// ruler (such as [xScope](http://xscopeapp.com) handy, measure
// the distance between the centers of the two circles. It
// should be somewhere close to the `linkDistance` parameter we
// set way up in the beginning (480 pixels). That, in the most
// basic of all nutshells, is what a force layout does. We
// tell it how far apart we want connected nodes to be, and
// the layout keeps moving the nodes around until they get
// reasonably close to that value.

// Of course, there's quite a bit more than that going on
// under the hood. We'll take a closer look starting with
// the next example.