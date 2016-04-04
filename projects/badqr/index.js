$(document).ready(function(){
	function updatePrice(){
		$.get("https://api.bitcoinaverage.com/ticker/global/USD/").done(function(data){
			price = data["ask"]
			price = (price/9.99)
			$("#usd_stolen").text("$"+price.toFixed(2));
		});
	}
	updatePrice();
	setInterval(updatePrice, 30 * 1000);

	$("#address").on('change',function(){
		generateQRCode();
	});

	$("#amount").on('change',function(){
		generateQRCode();
	});

	$("#social").on('change',function(){
		generateQRCode();
	});

	$("#generate_picture").click(function(){
		generatePicture();
	});

	function generateQRCode(){
		var address = $("#address").val()
		var amount = $("#amount").val()
		var engineer = $("#social").prop( "checked" )

		var expires = new Date();
		expires.setDate(expires.getDate() + 5);    

		if (engineer){
			$("#qr_code_select").html('<div style="width:100%;background-color:#2e5785">'
																	+'<img style="width:50%;margin-top:1px;margin-left:1px;margin-bottom:1px" src="https://chart.googleapis.com/chart?&chs=250x250&cht=qr&chl=bitcoin:' + address +'?amount=' + amount + '" < img naptha_cursor="text">'
																	+'<img style="width:30%;float:right;margin-right:10%;margin-top:5%" src="https://www.coinbase.com/assets/logos/logo-inverse@2x-75f3440fe0fcb1029a67d5f5be8c6a70f022bc90ee6e38c7c791d7f2729dc985.png"></img>'
																	+'<span style="width:50%;position:absolute;color:white;margin-top:15%;text-align:center">Coinbase Promotion Code</span>'
																	+'<span style="width:50%;position:absolute;color:white;margin-top:20%;text-align:center">Value: 1 BTC</span>'
																	+'<span style="width:50%;position:absolute;color:white;margin-top:35%;text-align:center">Redeem inside Coinbase Wallet</span>'
																	+'<span style="width:50%;position:absolute;color:white;margin-top:40%;text-align:center">Expires: ' + expires.toDateString() +'</span></div>')
		}
		else {
			$("#qr_code_select").html('<div style="width:100%"><img style="width:100%" src="https://chart.googleapis.com/chart?chs=250x250&cht=qr&chl=bitcoin:' + address +'?amount=' + amount + '" < img naptha_cursor="text"></div>')
		}
	}

	function generatePicture(){
		
	}
});