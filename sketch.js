/*
----- Coding Tutorial by Patt Vira ----- 
Name: Interactive Bridge w Bouncing Balls (matter.js + ml5.js)
Video Tutorial: https://youtu.be/K7b5MEhPCuo

Connect with Patt: @pattvira
https://www.pattvira.com/
----------------------------------------
*/

let handPose;
let video;
let hands = [];

// Open bucket
let bucket = {
  x: 540,   // left edge
  y: 360,   // top of bucket
  w: 80,    // width of bucket
  h: 120,   // height of bucket
  thickness: 10
};

let score = 0;              // number of balls entered
let gameDuration = 30;      // seconds
let startTime;              // when game starts
let targetScore = 40;       // balls needed to win
let gameOver = false;       // game over flag

// Start message
let showStartMessage = true;
let startMessageDuration = 3000; // 3 seconds
let startMessageTime;

const THUMB_TIP = 4;
const INDEX_FINGER_TIP = 8;

// Matter.js 
const {Engine, Body, Bodies, Composite, Composites, Constraint, Vector} = Matter;
let engine;
let bridge; 
let num = 10; 
let radius = 10; 
let length = 25;
let circles = [];

let colorPalette = ["#abcd5e", "#14976b", "#2b67af", "#62b6de", "#f589a3", "#ef562f", "#fc8405", "#f9d531"]; 

function preload() {
  // Load the handPose model
  handPose = ml5.handPose({maxHands: 1, flipped: true});
}

function setup() {
  createCanvas(640, 480);

  // Video setup
  video = createCapture(VIDEO, {flipped: true});
  video.size(640, 480);
  video.hide();

  handPose.detectStart(video, gotHands);

  engine = Engine.create();
  bridge = new Bridge(num, radius, length);

  // Start message timer
  startMessageTime = millis();
}

function draw() {
  background(220);
  Engine.update(engine);

  // 1️⃣ Show start message first
  if (showStartMessage) {
    fill(0);
    textSize(28);
    textAlign(CENTER, CENTER);
    text("Enter 40 balls, Game Start!", width / 2, height / 2);

    if (millis() - startMessageTime > startMessageDuration) {
      showStartMessage = false;
      startTime = millis(); // start game timer
    }
    return; // skip rest of draw until message disappears
  }

  // 2️⃣ Draw webcam first
  image(video, 0, 0, width, height);

  // 3️⃣ Spawn circles if game is not over
  if (!gameOver && random() < 0.1) {
    circles.push(new Circle());
  }

  // 4️⃣ Update and display circles
  for (let i = circles.length - 1; i >= 0; i--) {
    circles[i].checkDone();
    circles[i].display();
    let pos = circles[i].body.position;

    // Check if ball is inside bucket
    if (
      pos.x > bucket.x &&
      pos.x < bucket.x + bucket.w &&
      pos.y > bucket.y &&
      pos.y < bucket.y + bucket.h
    ) {
      score++;
      circles[i].removeCircle();
      circles.splice(i, 1);
      continue;
    }

    if (circles[i].done) {
      circles[i].removeCircle();
      circles.splice(i, 1);
    }
  }

  // 5️⃣ Draw bridge + fingers
  if (hands.length > 0) {
    let thumb = hands[0].keypoints[THUMB_TIP];
    let index = hands[0].keypoints[INDEX_FINGER_TIP];
    fill(0, 255, 0);
    noStroke();
    circle(thumb.x, thumb.y, 10);
    circle(index.x, index.y, 10);

    bridge.bodies[0].position.x = thumb.x;
    bridge.bodies[0].position.y = thumb.y;
    bridge.bodies[bridge.bodies.length - 1].position.x = index.x;
    bridge.bodies[bridge.bodies.length - 1].position.y = index.y;
    bridge.display();
  }

  // 6️⃣ Draw open bucket (U-shape)
  stroke('blue');
  strokeWeight(bucket.thickness);
  noFill();
  line(bucket.x, bucket.y, bucket.x, bucket.y + bucket.h);           // left
  line(bucket.x + bucket.w, bucket.y, bucket.x + bucket.w, bucket.y + bucket.h); // right
  line(bucket.x, bucket.y + bucket.h, bucket.x + bucket.w, bucket.y + bucket.h); // bottom

  // 7️⃣ Timer and score
  let elapsed = int((millis() - startTime) / 1000);
  let remaining = max(0, gameDuration - elapsed);

  fill(0);
  noStroke();
  textSize(24);
  text("Score: " + score, 20, 40);
  text("Time: " + remaining, 20, 70);

  // 8️⃣ Check game over
  if (!gameOver && remaining <= 0) {
    gameOver = true;
  }

  // 9️⃣ Display win/lose after game over
  if (gameOver) {
    textSize(32);
    fill(score >= targetScore ? 'green' : 'red');
    textAlign(CENTER, CENTER);
    if (score >= targetScore) {
      text("You Win!", width / 2, height / 2);
    } else {
      text("You Lose!", width / 2, height / 2);
    }
    textSize(24);
    text("Final Score: " + score, width / 2, height / 2 + 50);
  }
}

// HandPose callback
function gotHands(results) {
  hands = results;
}