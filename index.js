const express = require('express')
const app = express()

const mosca = require('mosca');
require('dotenv').config()
var settings = {
  port: parseInt(process.env.MQTT_PORT),
};

var server = new mosca.Server(settings);
server.attachHttpServer(app);
app.listen(process.env.SERVER_PORT, ()=>console.log("Web socket server is running at port", process.env.SERVER_PORT));

// Accepts the connection if the username and password are valid
var authenticate = function(client, username, password, callback) {
  var authorized = (username === 'admin' && password.toString() === 'root');
  if (authorized) client.user = username;
  callback(null, authorized);
}

// In this case the client authorized as alice can publish to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizePublish = function(client, topic, payload, callback) {
  callback(null, client.user == topic.split('/')[1]);
}

// In this case the client authorized as alice can subscribe to /users/alice taking
// the username from the topic and verifing it is the same of the authorized user
var authorizeSubscribe = function(client, topic, callback) {
  callback(null, client.user == topic.split('/')[1]);
}



server.on('clientConnected', function(client) {
  console.log('client connected', client.id);
});

// fired when a message is received
server.on('published', function(packet, client) {
  console.log('Published', packet.payload.toString());
});

server.on('ready', setup);

// fired when the mqtt server is ready
function setup() {
  server.authenticate = authenticate;
  server.authorizePublish = authorizePublish;
  server.authorizeSubscribe = authorizeSubscribe;
  console.log('Mosca server is up and running at', process.env.MQTT_PORT);
}

// Express Routes
app.get('/', (req, res) => res.send('MQTT Brooker'));
app.use(express.static('public'))
