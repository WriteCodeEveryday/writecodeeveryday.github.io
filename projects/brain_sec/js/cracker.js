$(document).ready( function() {

  if (!window.Worker) {
    alert("Your browser does not support workers. Program terminated");
    var derp = generateBrainWalletFromHash("abc123");
    var derp2 = "https://api.blockcypher.com/v1/btc/main/addrs/<address>/balance"
  }
  else {
    var raw_data = [];
    var cracker_worker = new Worker("js/simple_worker.js");
    $.getJSON("https://api.github.com/repos/AtheistOfFail/atheistoffail.github.io/git/trees/old_branch?recursive=1", function(data){
      var tree = data.tree;
      for (file of tree) {
        if (file.path.indexOf("/Passwords/") > -1){
          var text_value = file.path.split("/Passwords/")[1];
          $("#file_list").append(
            $("<button/>",{"type": "button", "class" : "btn btn-primary target_text", "text" :  text_value, "url": file.url})
            );
        }
      }
    });

    $("#file_list").on('click', ".target_text", function() {
      $.getJSON($(this).attr("url"), function(data) {
        raw_data = atob(data.content).split("\n");
        cracker_worker.postMessage([raw_data]);
        $("#single_account").text("RUNNING " + raw_data.length + " WALLETS");
        $("#all_accounts").text("RUNNING " + raw_data.length + " WALLETS");
        $("#all_balance").text("RUNNING " + raw_data.length + " WALLETS");
      });
    });

    function showData(data){
      var highest_received = Math.max.apply(Math,data.map(function(o){return o.received;}))
      var total_received = 0;
      var total_active = 0;
      data.forEach(function (single_data, i) {
        total_received += single_data.received;
        total_active += single_data.balance;
      });
      highest_received = highest_received/100000000;
      total_received = total_received/100000000;
      total_active = total_active/100000000;

      $("#single_account").text(highest_received + " BTC");
      $("#all_accounts").text(total_received + " BTC");
      $("#all_balance").text(total_active + " BTC");
    }

    cracker_worker.onmessage = function(e) {
      showData(e.data);
    }
  }
});