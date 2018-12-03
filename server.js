//Find a way to disregard upper or lowercase differences in answers
//Clear other player's answer once they press submit again


var https = require('https'); // Use https library
var fs = require('fs'); // Use socket.io's file system library
var url = require('url'); // Use url library


var options = { // Key and certificate for https, saved in root folder
  key: fs.readFileSync('my-key.pem'),
  cert: fs.readFileSync('my-cert.pem')
};

var httpServer = https.createServer(options, requestHandler); // Create instance of https server
httpServer.listen(8085); // Listen on port
console.log('Server listening on port 8084');


function requestHandler(req, res) { // Direct client visits to pages

  var parsedUrl = url.parse(req.url);
  console.log("The Request is: " + parsedUrl.pathname);

  fs.readFile(__dirname + parsedUrl.pathname, // Read in the file they requested
    // Callback function, called when reading is complete
    function(err, data) {
      // if there is an error
      if (err) {
        res.writeHead(500);
        return res.end('Error loading ' + parsedUrl.pathname);
      }
      // Otherwise, send the data, the contents of the file
      res.writeHead(200);
      res.end(data);
    }
  );
  console.log("Got a request " + req.url);

}


// WebSocket Portion
// WebSockets work with the HTTP server
var io = require('socket.io').listen(httpServer);
let player1Answer;
let player2Answer;
let tryAgainInstructions = "Try Again!";
let youMatchedInstructions = "You Matched! 🎉🎉🎉"
let player1Attempts = 0;
let player2Attempts = 0;



// Register a callback function to run when we have an individual connection
// This is run for each individual user that connects
io.sockets.on('connection',
  // We are given a websocket object in our function
  function(socket) {

    console.log("We have a new client: " + socket.id);

    // TODO: Keep track of users in socket rooms using IDs?
    socket.on('connect', function(data) {
      console.log("New connection" + socket.id);
      // console.log(data);
      // store into global variable?
    });


    // Receive player 2's answer
    socket.on('player1Answer',
      // Run this function when a message is sent
      function(data) {
        player1Answer = data;
        console.log("player1Answer: " + player1Answer);
        //-player1Attempt.number
        player1Attempts = ++player1Attempts;
        console.log("player1Attempts :" + player1Attempts);

        //Store both in a global variable

        //call checkAnswer function
        checkAnswers();
      }
    );

    // Receive player 2's answer
    socket.on('player2Answer',
      // Run this function when a message is sent
      function(data) {
        player2Answer = data;
        console.log("player2Answer: " + player2Answer);
        //-player1Attempt.number
        player2Attempts = ++player2Attempts;
        console.log("player2Attempts :" + player2Attempts);

        //Store both in a global variable

        //call checkAnswer function
        checkAnswers();
      }
    );

    //IF PLAYER1 AND PLAYER2 ATTEMPT NUMBER IS THE SAME
    //IF THEIR ANSWERS ARE DIFFERENT

    function checkAnswers() {
      console.log("checkAnswers function ran");

      let answers = [player1Answer, player2Answer]

      // io.broadcast('test', answers)


        if (player1Attempts == 1 && player2Attempts == 1) {
          if (player1Answer != player2Answer) {
            console.log("1 out of 3: Answers don't match");
            io.sockets.emit('tryAgain', "1 out of 3 Tries");
            shareAnswers();

          } else if (player1Answer == player2Answer) {
            console.log("1 out of 3: Answers match");
            io.sockets.emit('youMatched', youMatchedInstructions);
            shareAnswers();

          }
        }

        if (player1Attempts == 2 && player2Attempts == 2) {
          if (player1Answer != player2Answer) {
            console.log("2 out of 3: Answers don't match");
            io.sockets.emit('tryAgain', "2 out of 3 Tries");
            shareAnswers();

          } else if (player1Answer == player2Answer) {
            console.log("2 out of 3: Answers match");
            io.sockets.emit('youMatched', youMatchedInstructions);
            shareAnswers();

          }
        }


        if (player1Attempts == 3 && player2Attempts == 3) {
          if (player1Answer != player2Answer) {
            console.log("3 out of 3: Answers don't match");

            io.sockets.emit('tryAgain', "3 out of 3 Tries");
            shareAnswers();

          } else if (player1Answer == player2Answer) {
            console.log("3 out of 3: Answers match");
            io.sockets.emit('youMatched', youMatchedInstructions);
            shareAnswers();

          }
        }

      }



    function shareAnswers() {

      console.log("shareAnswers function happened");


      //io.sockets.emit is the command that will actually emit to everyone.
      io.sockets.emit('shareAnswers', {
        player1Submission: player1Answer,
        player2Submission: player2Answer
      });

      //Old attempt to emit that required two different emit messages
      // socket.broadcast.emit('shareAnswers', {
      //   player1Submission: player1Answer,
      //   player2Submission: player2Answer
      // });
      //
      // socket.emit('shareAnswers', {
      //   player1Submission: player1Answer,
      //   player2Submission: player2Answer
      // });

      console.log("shareAnswers emit happened");

    }


    socket.on('disconnect', function() {
      console.log("Client has disconnected");
    });
  }
);
