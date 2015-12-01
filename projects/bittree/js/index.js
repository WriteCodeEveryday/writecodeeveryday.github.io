$(document).ready(function(){

  var start = Date.now();
  var width = window.innerWidth,
  height = window.innerHeight;



  var nodes = [];


  var links = [];


  var paint_enabled = true;
  var screenshot_seconds = 120;
  var original_force =  -150;
  var force_strength = original_force;
  var svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height).attr('style', 'background: white');

  var legendX = 0;
  var legendY = (9*height)/10;

  var legend_text = svg.append('text').text("Legend").attr('class', 'hl').style("font-size", "24px").style('fill', '#0a5e96').style('text-transform', 'uppercase').style('letter-spacing', '3px').attr("x", legendX).attr("y",legendY);
  legendY += height/40;
  var legend_input_nodes = svg.append('text').text("Input Nodes").style("font-size", "14px").style('fill', '#F64F53').attr("x", legendX).attr("y",legendY);
  legendY += height/40;
  var legend_output_nodes = svg.append('text').text("Output Nodes").style("font-size", "14px").style('fill', '#309793').attr("x", legendX).attr("y",legendY);
  legendY += height/40;
  var legend_dual_nodes = svg.append('text').text("Input/Output Nodes").style("font-size", "14px").style('fill', '#ffdd00').attr("x", legendX).attr("y",legendY);

  legendX = 0;
  legendY = height/30;
  var stats = svg.append('text').text("Stats").attr('class', 'hl').style("font-size", "24px").style('fill', '#0a5e96').style('text-transform', 'uppercase').style('letter-spacing', '3px').attr("x", legendX).attr("y",legendY);
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

  function existOrCreate(address1, address2, value1, value2) {
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

  function sendImage(img) {
    var myFirebaseRef = new Firebase("https://bitaddressstorage.firebaseio.com");
    myFirebaseRef.child("pictures").child(start.toString()).set({
      time: start.toString(),
      image: img
    },
    function(error) {
      if (error) {
        alert("Data could not be saved." + error);
      } else {
        location.reload();
      }
    });
  }
  function updateGraph(data) {
    if (paint_enabled)
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
      paintGraph();
    }

    if (largest_transaction_amount < totalAmount) {
      largest_transaction_amount = totalAmount;
      largest_transaction_id.text("LARGEST TRANSACTION: " + (largest_transaction_amount/ 100000000).toFixed(8) + " BTC");
    }

    nodes_text.text("NODES: " + nodes.length);
    links_text.text("LINKS: " + links.length);
    var time_in_seconds = (Date.now() - start)/1000;
    time_since_start.text("TIME: " + time_in_seconds + " seconds");
    force_text.text("FORCE:  " + force_strength);


    if (screenshot_seconds > 0 && time_in_seconds > screenshot_seconds) {
      stats.remove();
      nodes_text.remove();
      links_text.remove();
      force_text.remove();
      time_since_start.remove();
      largest_transaction_id.remove();


      legend_text.remove();
      legend_input_nodes.remove();
      legend_output_nodes.remove();
      legend_dual_nodes.remove();

      Pablo(".input").attr("fill", "#F64F53");
      Pablo(".output").attr("fill", "#309793");
      Pablo(".input_output").attr("fill", "#ffdd00");
      Pablo(".link").attr("stroke", "#0a5e96").attr("stroke-width", "1px");
      sendImage(Pablo("svg").dataUrl());
      start = Date.now();
    }
  }

  function connectionCount(input_node, nodes_list, links_list) {
    var connections = links_list.filter(function (el) {
      return el.source == input_node ||
      el.target == input_node;
    });
    nodes_list.splice(connections, 0);
    return connections;
  }

  function mostConnected() {
    var nodes_list = nodes.slice(0);
    var links_list = links.slice(0);

    var results = [];
    for (current_node of nodes_list) {
      var linked = connectionCount(current_node, nodes_list, links_list);
      var length = linked.length;
      if (length > 0)
      {
        results.push({current_node, length});
      }
    }
    return results;
  }

  function compare(a,b) {
    if (a.length > b.length)
      return -1;
    if (a.length < b.length)
      return 1;
    return 0;
  }

  function paintGraph() {
    var time_in_seconds = (Date.now() - start)/1000;
    if (screenshot_seconds > 0 &&  time_in_seconds > (screenshot_seconds - 5)) {
      width = window.innerWidth * 2;
      height = window.innerHeight * 2;
      force_strength = original_force * 2;
      paint_enabled = false;
    }
    else {
      width = window.innerWidth;
      height = window.innerHeight;
    }
    svg.attr('width', width).attr('height',height);
    force.size([width, height]);

    legendX = 0;
    legendY = (9*height)/10;

    legend_text.attr("x", legendX).attr("y",legendY);
    legendY += height/40;
    legend_input_nodes.attr("x", legendX).attr("y",legendY);
    legendY += height/40;
    legend_output_nodes.attr("x", legendX).attr("y",legendY);
    legendY += height/40;
    legend_dual_nodes.attr("x", legendX).attr("y",legendY);

    force.stop();
    link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
    link.enter().insert("line", ".node").attr("class", "link");
    link.exit().remove();

    node = node.data(force.nodes(), function(d) { return d.id;});
    node.enter().append("circle").attr("class", function(d) { return "node " + d.type; }).attr("r", 5);
    node.exit().remove();

    force.charge(force_strength/Math.log(nodes.length));
    zoom.scale(1/nodes.length);
    force.start();

    var connectionMap = mostConnected();
    connectionMap.sort(compare);
    //$('#primary').qrcode({text: "bitcoin:"+ connectionMap[0].current_node.id +"?amount=0.00000001"});
    //$('#secondary').qrcode({text: "bitcoin:"+ connectionMap[1].current_node.id +"?amount=0.00000001"});
  }

  //Blockchain.info
  var blockchain = new WebSocket("wss://ws.blockchain.info/inv");
  blockchain.onmessage = function(msg) {
   var json = JSON.parse(msg.data);
   if (json.op == "utx") {
     updateGraph(json);
   }
 };
 blockchain.onopen = function() {
   blockchain.send(JSON.stringify({
     "op":"unconfirmed_sub"
   }))
 }
});
