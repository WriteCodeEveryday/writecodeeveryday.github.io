var express = require('express')
var app = express();

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public/assets'));

var views_dir = __dirname + '/public/views/';

app.get('/', function (req, res) {
  res.sendFile(views_dir + 'home.html');
});

app.get('/unconfirmed', function (req, res) {
  res.sendFile(views_dir + 'index.html');
});

app.get('/gallery', function (req, res) {
  res.sendFile(views_dir + 'gallery.html');
})

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'))
})
