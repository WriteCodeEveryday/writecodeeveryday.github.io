// Define the dimensions of the visualization. We're using
// a size that's convenient for displaying the graphic on
// http://jsDataV.is

var start = Date.now();
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


var force_strength = -100;
var svg = d3.select('body').append('svg')
          .attr('width', width)
          .attr('height', height);

var legendX = 0;
var legendY = (9*height)/10;

var legend_text = svg.append('text').text("Legend").style("font-size", "18px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var legend_input_nodes = svg.append('text').text("Input Nodes").style("font-size", "14px").style('fill', '#F64F53').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var legend_output_nodes = svg.append('text').text("Output Nodes").style("font-size", "14px").style('fill', '#309793').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var legend_dual_nodes = svg.append('text').text("Input/Output Nodes").style("font-size", "14px").style('fill', '#ffdd00').attr("x", legendX).attr("y",legendY);

legendX = 0;
legendY = height/30;
var stats = svg.append('text').text("Stats").style("font-size", "18px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var nodes_text = svg.append('text').style("font-size", "14px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var links_text = svg.append('text').style("font-size", "14px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var force_text = svg.append('text').style("font-size", "14px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var time_since_start = svg.append('text').style("font-size", "14px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
legendY += height/40;
var largest_transaction_id = svg.append('text').style("font-size", "14px").style('fill', '#0a5e96').attr("x", legendX).attr("y",legendY);
var largest_transaction_amount = 0;


var zoom = d3.behavior.zoom();
svg.call(zoom);

var force = d3.layout.force()
  .size([width, height])
  .nodes(nodes)
  .links(links)
  .charge(force_strength)
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

    if (nodes[i].id === address2) {
      address2index = i;
    }
  }

  if (address1index == -1)
  {
    address1index = nodes.length;

    nodes.push({id: address1, value: value1, x: Math.random()*width, y: Math.random()*height, type: "input"});
  }
  else
  {
    if (nodes[address1index].type != "input")
    {
      nodes[address1index].type = "input_output";
    }
  }

  if (address2index == -1)
  {
    address2index = nodes.length;
    nodes.push({id: address2, value: value2,x: Math.random()*width, y: Math.random()*height, type: "output"});
  }
   else
  {
    if (nodes[address2index].type != "output")
    {
      nodes[address2index].type = "input_output";
    }
  }

  links.push({ source: nodes[address1index], target: nodes[address2index] });
}

function updateGraph(data)
{
  var ins = data.x.inputs
  var out = data.x.out
  var totalAmount = 0;
  for (input of ins) {
    totalAmount += input.prev_out.value;
    for (output of out) {
      existOrCreate(input.prev_out.addr, output.addr, input.prev_out.value, output.value);
    }
  }
  nodes_text.text("NODES: " + nodes.length);
  links_text.text("LINKS: " + links.length);
  if (largest_transaction_amount < totalAmount)
  {
    largest_transaction_amount = totalAmount;
    largest_transaction_id.text("LARGEST TRANSACTION: " + (largest_transaction_amount/ 100000000).toFixed(8) + " BTC [" + data.x.hash + "]");
    console.log(data.x.hash);
  }
  paintGraph();
}

function paintGraph()
{
  width = window.innerWidth;
  height = window.innerHeight;
  svg.attr('width', width).attr('height',height);
  force.size([width, height]);
  force.stop();

  link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
  link.enter().insert("line", ".node").attr("class", "link");
  link.exit().remove();

  node = node.data(force.nodes(), function(d) { return d.id;});
  node.enter().append("circle").attr("class", function(d) { return "node " + d.type; }).attr("r", 1);
  node.exit().remove();

  force.charge(force_strength/Math.log(nodes.length));
  zoom.scale(1/nodes.length);
  force.start();

  time_since_start.text("TIME: " + (Date.now() - start)/1000 + " seconds");
  force_text.text("FORCE:  " + force_strength);
}

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
