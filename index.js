// Example express application adding the parse-server module to expose Parse
// compatible API routes.

var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var path = require('path');

var databaseUri = process.env.DATABASE_URI || process.env.MONGODB_URI;

if (!databaseUri) {
  console.log('DATABASE_URI not specified, falling back to localhost.');
}

var api = new ParseServer({
  databaseURI: databaseUri || 'mongodb://docwhere:docwhere123@ds021712-a0.mlab.com:21712,ds021712-a1.mlab.com:21712/docwhereiosapp?replicaSet=rs-ds021712',
  cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
  appId: process.env.APP_ID || 'oMVo1jEWRESQK5KOytehjyHsyIrVMP6DPt2IEhDv',
  masterKey: process.env.MASTER_KEY || 'k9lsALW9y8KBUAXQzVOeHkfjo9JzP3VMC5UO57Is', //Add your master key here. Keep it secret!
  serverURL: process.env.SERVER_URL || 'https://docwhereiosapp.herokuapp.com',  // Don't forget to change to https if needed
  javascriptKey: process.env.JAVASCRIPT_KEY || '7bMusI2dAZ1hPJ8CzBdurpTOReWjk69vUXMZIW0w',  //** add this line no need to set values, they will be overwritten by heroku config vars
  // restAPIKey: process.env.REST_API_KEY || 'lKd6H8xoc49vIOwOTbR0eNX7Tyl9YihUmtbCFUgk', //** add this line
  // dotNetKey: process.env.DOT_NET_KEY || 'Nfop797wXab3EIFAA51WwRwUV0mgYIN9m5SVJ8KL', //** add this line
  clientKey: process.env.CLIENT_KEY || 'dGv1bVJTz0OIsP1BtFvVoZfFh1EMvUIJS7ohcMWx', //** add this line
});
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();
app.use(cors()); 

// Serve static assets from the /public folder
app.use('/public', express.static(path.join(__dirname, '/public')));

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {
  res.status(200).send('docwhere parse server running!');
});

// There will be a test page available on the /test path of your server url
// Remove this before launching your app
app.get('/test', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/test.html'));
});

var port = process.env.PORT || 1337;
var httpServer = require('http').createServer(app);
httpServer.listen(port, function() {
    console.log('parse-server-example running on port ' + port + '.');
});

// This will enable the Live Query real-time server
ParseServer.createLiveQueryServer(httpServer);
