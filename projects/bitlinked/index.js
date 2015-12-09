$(document).ready(function(){

  var start = Date.now();
  var width = window.innerWidth,
  height = window.innerHeight;

  var max_block = 0;
  var current_block = 0;
  var mining_rewards = false;

  var nodes = [];
  var links = [];


  var screenshot_seconds = 120;
  var original_force =  -150;
  var force_strength = original_force;
  var svg = d3.select('body').append('svg')
  .attr('width', width)
  .attr('height', height).attr('style', 'background: white');


  var legendX = 0;
  var legendY = (9*height)/10;

  var legend_block = svg.append('text').text("Block: ").attr('class', 'hl').style("font-size", "20px").style('fill', '#0a5e96').style('text-transform', 'uppercase').style('letter-spacing', '3px').attr("x", legendX).attr("y",legendY);
  legendY += height/40;
  var legend_time = svg.append('text').text("Time: ").attr('class', 'hl').style("font-size", "20px").style('fill', '#0a5e96').style('text-transform', 'uppercase').style('letter-spacing', '3px').attr("x", legendX).attr("y",legendY);
  legendY += height/40;
  
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

  function updateGraph(data) {
    var ins;
    var out;
    var input_address;
    var output_address;
    var transactions = data.transactions
    for (trans of transactions) {
      var ins = trans.inputs
      var out = trans.outputs
      for (input of ins) {
        for (output of out) {
          for (out_address of output["addresses"])
          {
            if (input.hasOwnProperty("coinbase")) {
              if (mining_rewards){
                input_address = "mining_rewards";
                output_address = out_address;
                existOrCreate(input_address, output_address, input.amount, output.amount);
              }
            }
            else {
              for (inp_address of input["addresses"])
              {
                input_address = inp_address;
                output_address = out_address;
                existOrCreate(input_address, output_address, input.amount, output.amount);
              }
            }
          }
        }
      }
    }
    paintGraph();
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
    width = (window.innerWidth > width ?  window.innerWidth : width);
    height = (window.innerHeight > height ?  window.innerHeight : height);
    
    svg.attr('width', width).attr('height',height);
    force.size([width, height]);

    force.stop();
    link = link.data(force.links(), function(d) { return d.source.id + "-" + d.target.id; });
    link.enter().insert("line", ".node").attr("class", "link");
    link.exit().remove();

    node = node.data(force.nodes(), function(d) { return d.id;});
    node.enter().append("circle").attr("class", function(d) { return "node " + d.type; }).attr("r", 5);
    node.exit().remove();

    force.charge(force_strength/Math.log(nodes.length));
    //zoom.scale(1/nodes.length);
    force.start();

    //var connectionMap = mostConnected();
    //connectionMap.sort(compare);
    //$('#primary').qrcode({text: "bitcoin:"+ connectionMap[0].current_node.id +"?amount=0.00000001"});
    //$('#secondary').qrcode({text: "bitcoin:"+ connectionMap[1].current_node.id +"?amount=0.00000001"});
  }

 function executeProgram(){
  if (max_block <= current_block){
    $.get( "https://bitcoin.toshi.io/api/v0/blocks/latest", function( data ) {
      max_block = data.height;
    });
  } else {
    var temp = current_block;
    current_block += 1;
    $.get( "https://bitcoin.toshi.io/api/v0/blocks/"+ temp+"/transactions", function( data ) {
      updateGraph(data);
      legend_block.text("Block: " + temp);
      legend_time.text("Time: " + data.time);
    });
  }
 }

 $( document ).on( "mousemove", function( event ) {
    legendX = event.pageX - event.pageX/2;
    legendY = event.pageY;
    legend_block.attr("x", legendX).attr("y",legendY);
    legendY += 40;
    legend_time.attr("x", legendX).attr("y",legendY);
  });

  $('html').bind('mousewheel DOMMouseScroll', function (e) {
    var delta = (e.originalEvent.wheelDelta || -e.originalEvent.detail);
    if (delta == 0) {
      height += 20;
      width += 40;
    }
  });

 $("#start").click(function(){
  current_block = parseInt($("#height").val());
  mining_rewards = $("#reward").is(':checked');
  setInterval(executeProgram, (1000/$("#bpm").val()));
  $("#controls").hide();
 });
});
