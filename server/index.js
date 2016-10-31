var express       = require('express');
var app           = express();
var http          = require('http').Server(app);
var io            = require('socket.io')(http);
var socketioJwt   = require('socketio-jwt');
var _             = require('lodash');                // Awesome tool - multi use tool form variables
var jwt           = require('jsonwebtoken');
var cors          = require('cors');                  // Allow request from other websites
var bodyParser    = require('body-parser');           // Parse variables passed into req.body as an object
var uuid          = require('node-uuid');
var config        = require('./config');
var cardsArray    = null;
var users         = [{id: uuid.v1(), username: 'Rene', isOnline: false}];
var cardsSelected = [];
// Public Assets
// app.use(express.static(__dirname + '/public'));


// app.get('/', function(req, res){
//   res.sendFile(__dirname + '/templates/index.html');
// });
// app.get('/display', function(req, res){
//   res.sendFile(__dirname + '/templates/display.html');
// });
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.post('/user/create', function(req, res) {
  var userScheme = getUserScheme(req);
  if(userScheme.username === undefined){
    return res.status(401).send({message: "Please set user name"});
  }
  var user = _.find(users, userScheme.userSearch);
  if (user) {
    if(user.isOnline===true){
      return res.status(401).send({message: "User is already in the page.", user: user});
    }else{
      user.isOnline = true;
    }
  }else{
    user = { id: uuid.v1(), username: userScheme.username, isOnline: true };
  }
  users.push(user);
  res.status(201).send({
    id_token: createToken(user),
    username: userScheme.username
  });
});



http.listen(8888, function(){
  console.log('listening on *:8888');
  getCards();
});



//// With socket.io < 1.0 ////
// io.set('authorization', socketioJwt.authorize({
//   secret: config.secret,
//   handshake: true
// }));
//////////////////////////////
//// With socket.io >= 1.0 ////
io.use(socketioJwt.authorize({
  secret: config.secret,
  handshake: true
}));
///////////////////////////////
io.on('connection', function(socket){
  console.log('connected');
  console.log('socket.io connection established');
  var user = socket.decoded_token;
  console.log(user);
  socket.userid = user.id;
  socket.username = user.username;
  socket.emit('login', {numUsers: 1});
  socket.broadcast.emit('UserJoined', {username: socket.username, numUsers: 1});
  var userFromMemory = _.find(users, ['id', user.id]);
  if(userFromMemory === undefined){
    users.push({ id: user.id, username: user.username, isOnline: true });
  }

  socket.on('message', function(msg){
    io.emit('color', msg);
  });
  socket.on('SendMessage', function (msg) {
    console.log('noticed new message');
    console.log(msg);
    var parsedMsg = JSON.parse(msg);
    socket.emit('MessageReceived', parsedMsg.id); // Send message to sender
    socket.broadcast.emit('NewMessage', msg); // Send message to everyone BUT sender
  });
  socket.on('CardClicked', function (msg) {
    console.log('noticed new card click');
    console.log(msg);
    var parsedMsg = JSON.parse(msg);
    var card = _.find(cardsArray, ['id', parsedMsg.id]);
    var user = _.find(users, ['id', parsedMsg.userId]);
    var playerSelectedCards = cardsSelected[user.id];
    console.log(card);
    if(playerSelectedCards === undefined){
      playerSelectedCards = [];
      cardsSelected[user.id] = playerSelectedCards;
    }
    console.log(card);
    if(card.state === false && playerSelectedCards.length<2){
      card.state = true;
      card.userId = user.id;
      card.username = user.username;
      socket.emit('CardStatus', JSON.stringify(card)); // Send message to sender
      socket.broadcast.emit('CardStatus', JSON.stringify(card)); // Send message to everyone BUT sender

      playerSelectedCards.push(card);
      if(playerSelectedCards.length>=2){
        var cardOne = playerSelectedCards.pop();
        var cardTwo = playerSelectedCards.pop();
        if(cardOne.image != cardTwo.image ){
          cardOne.state = false;
          cardTwo.state = false;
          cardOne.userId = null;
          cardTwo.userId = null;
          cardOne.username = null;
          cardTwo.username = null;

        }else{
          cardOne.lock = true;
          cardTwo.lock = true;
        }
        setTimeout(function(){
          socket.emit('CardStatus', JSON.stringify(cardOne)); // Send message to sender
          socket.broadcast.emit('CardStatus', JSON.stringify(cardOne)); // Send message to everyone BUT sender
          socket.emit('CardStatus', JSON.stringify(cardTwo)); // Send message to sender
          socket.broadcast.emit('CardStatus', JSON.stringify(cardTwo)); // Send message to everyone BUT sender
        },1000);
        var somethingLeft = _.find(cardsArray, ['lock', false]);
        if(somethingLeft === undefined){
          setTimeout(function(){
            newGame();
          },5000);
        }
      }
    }
  });
  socket.on('CardNewGame', function (msg) {
    console.log('noticed new game');
    newGame();
  });
  socket.on('CardCurrentGame', function (msg) {
    socket.emit('CardNewGameReceived', cardsArray); // Send message to sender
  });
  socket.on('Logout', function (msg) {
    console.log('noticed Logout');
    var parsedMsg = JSON.parse(msg);
    notifyLogout(putUserOffline(parsedMsg.id));
  });
  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    console.log('noticed disconnect');
    console.log(socket.userid );
    notifyLogout(putUserOffline(socket.userid));
  });

  function notifyLogout(userFound){
    if(userFound !== false){
      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: 1
      });
    }
  }
  function newGame(){
    var cards = getCards();
    socket.emit('CardNewGameReceived', cards); // Send message to sender
    socket.broadcast.emit('CardNewGameReceived', cards); // Send message to everyone BUT sender
  }
});


function putUserOffline(id){
  var userFound = _.find(users, ['id',id]);
  console.log("PutUserOffLine");
  if(userFound !== undefined &&  userFound !== -1 ){
    userFound.isOnline = false;
    console.log(userFound);
    return userFound;
  }
  console.log(userFound);
  return false;
}

function getCards(){
  // if(!cardsArray){
  cardsSelected = [];
  cardsArray = [
    { id: uuid.v1(), image: "1",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "1",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "2",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "2",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "3",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "3",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "4",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "4",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "5",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "5",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "6",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "6",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "7",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "7",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "8",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "8",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "9",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "9",  userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "10", userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "10", userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "11", userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "11", userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "12", userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
    { id: uuid.v1(), image: "12", userId: null, username: null, datetime: null, state: false, lock: false, isLoading: false },
  ];
  // }
  cardsArray = _.shuffle(cardsArray);
  return cardsArray;
}

function createToken(user) {
  return jwt.sign(user, config.secret, { expiresIn: "10h" });
}

function getUserScheme(req) {

  var username;
  var type;
  var userSearch = {};
  // The POST contains a username and not an email
  if(req.body.username) {
    username = req.body.username;
    type = 'username';
    userSearch = { username: username };
  }

  return {
    username: username,
    type: type,
    userSearch: userSearch
  }
}