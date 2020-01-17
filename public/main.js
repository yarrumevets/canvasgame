// Example Game.
import { Game } from "./game.js";

const game = new Game({
  fps: 30,
  mount: "game-root",
  width: 640,
  height: 480,
  backgroundColor: "blue"
});

// Load images from specific directory. /assets/images/~
const loadImagesPromise = game.loadImages({
  sprites: {
    carRed: "car-red.png",
    carPink: "car-pink.png",
    carYellow: "car-yellow.png",
    carPurple: "car-purple.png",
    ball: "ball.png"
  },
  backgrounds: {
    grid: "field1.png"
  }
});

game.backgroundImage = "grid";

game.addText({
  name: "score",
  x: 80,
  y: 70,
  default: "Score: 0",
  fontSize: 40,
  fontFamily: "Verdana",
  color: "red"
});
game.addText({
  name: "inputKeys",
  x: 80,
  y: 120,
  default: "[---]",
  fontSize: 15,
  fontFamily: "Verdana",
  color: "#000"
});

loadImagesPromise
  .then(imageLoadResult => {
    game.score = 0;

    // create entities here.
    game.createBallEntity("ball", 50, 100, 160, "ball");
    game.createCarEntity("player", 50, 100, 100, 100, "carPink");
    game.createCarEntity("enemy", 50, 100, 500, 300, "carYellow");

    game.mainGameLoop(() => {
      // move entities and handle collisions
      game.entities.ball.move();
      // game.entities.enemy.rotate(0.1); // rotate the enemy car endlessly.
      game.moveCarWithStupidAI(game.entities.enemy);
      game.moveEntityWithKeys(game.entities.player);

      game.texts.score.text = "Score: " + game.score;
      // show which keys are being pressed.
      let keyDisplayText = "Keys: ";
      for (const p in game.keyStates) {
        keyDisplayText += " " + game.config.keyCodeToName[p];
      }
      game.texts.inputKeys.text = keyDisplayText;
    });
  })
  .catch(console.error);

// <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>
//                                Custom functions.
// <><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><><>

// Player moves similar to the game Asteroids.
game.moveEntityWithKeys = e => {
  const maxSpeed = 300;
  const accel = 10;
  const l = game.isKeyPressed("LEFT");
  const r = game.isKeyPressed("RIGHT");
  const u = game.isKeyPressed("UP");
  const d = game.isKeyPressed("DOWN");

  // !! Arbitrary turning angle. !! FPS will affect turning radius.
  const maxTurnSpeed = 0.1;
  // Turning speed decreases as speed decreases, giving the illusion that
  // the cars' turning is tied to its forward motion.
  const turnSpeed = maxTurnSpeed * (e.speed / maxSpeed);

  // Key-input change properties.
  const rev = e.speed < 0 ? -1 : 1;
  if (l && e.speed != 0) {
    e.rotate(-turnSpeed * rev);
  }
  if (u) {
    e.speed += accel;
    if (e.speed < 0) {
      // add a bit more speed if going forward from reverse.
      e.speed += accel;
    }
  }
  if (r && e.speed != 0) {
    e.rotate(turnSpeed * rev);
  }
  if (d) {
    e.speed -= accel;
    if (e.speed > 0) {
      // add a little more power to reverse if still going forward.
      e.speed -= accel / 2;
    }
  }

  // Limit speed.
  if (e.speed < -maxSpeed) e.speed = -maxSpeed;
  else if (e.speed > maxSpeed) e.speed = maxSpeed;

  // Decrease speed when neither button is held for a given axis.
  if (!u && !d) {
    const sp = e.speed;
    e.speed = sp < 0 ? sp + 1 : sp > 0 ? sp - 1 : sp;
  }

  // Handle interaction with canvas borders (wrap-around).
  if (e.x < -e.width) e.x = game.width;
  if (e.y < -e.height) e.y = game.height;
  if (e.x > game.width) e.x = -e.width;
  if (e.y > game.height) e.y = -e.height;

  // Move the entity.
  e.move();
};

// Move the entity around like a pong ball.
game.moveEntityBounce = e => {
  e.x += (e.xSpeed / game.fps) * e.xDir;
  e.y += (e.ySpeed / game.fps) * e.yDir;
  const xLimit = game.width - e.width;
  if (e.x > xLimit) {
    e.x = xLimit - (e.x - xLimit);
    e.xDir *= -1;
  } else if (e.x < 0) {
    e.x = -e.x;
    e.xDir *= -1;
  }
  const yLimit = game.height - e.height;
  if (e.y > yLimit) {
    e.y = yLimit - (e.y - yLimit);
    e.yDir *= -1;
  } else if (e.y < 0) {
    e.y = -e.y;
    e.yDir *= -1;
  }
};

// Stupid car AI
game.moveCarWithStupidAI = e => {
  const maxSpeed = 300;
  const accel = 10;

  // represents actual left,right,up,down keys.
  let l, r, u, d;

  // Logic to fake user input.
  if (!e.ai) {
    e.ai = {
      accelTime: 0,
      turnTime: 0,
      keysPressed: { l: false, r: false, u: false, d: false }
    };
  }

  if (e.ai.accelTime <= 0) {
    // randomly set time (in frames) to maintain this button state for movement.
    e.ai.accelTime = Math.random() > 0.5 ? 30 : 100;
    // randomly choose a new key state:
    if (Math.random() > 0.5) {
      e.ai.keysPressed.u = true;
      e.ai.keysPressed.d = false;
    } else {
      e.ai.keysPressed.d = true;
      e.ai.keysPressed.u = false;
    }
    // 20% chance of no u-d keys pressed.
    if (Math.random() > 0.8) {
      e.ai.keysPressed.u = false;
      e.ai.keysPressed.d = false;
    }
  } else e.ai.accelTime--;

  if (e.ai.turnTime <= 0) {
    // randomly set time (in frames) to maintain this button state for turning.
    e.ai.turnTime = Math.random() > 0.5 ? 50 : 110;
    // randomly choose a new key state:
    if (Math.random() > 0.5) {
      e.ai.keysPressed.l = true;
      e.ai.keysPressed.r = false;
    } else {
      e.ai.keysPressed.r = true;
      e.ai.keysPressed.l = false;
    }
    // 30% chance of no l-r keys pressed.
    if (Math.random() > 0.7) {
      e.ai.keysPressed.r = false;
      e.ai.keysPressed.l = false;
    }
  } else e.ai.turnTime--;

  l = e.ai.keysPressed.l;
  r = e.ai.keysPressed.r;
  u = e.ai.keysPressed.u;
  d = e.ai.keysPressed.d;

  // !! Arbitrary turning angle. !! FPS will affect turning radius.
  const maxTurnSpeed = 0.1;
  // Turning speed decreases as speed decreases, giving the illusion that
  // the cars' turning is tied to its forward motion.
  const turnSpeed = maxTurnSpeed * (e.speed / maxSpeed);

  // Key-input change properties.
  const rev = e.speed < 0 ? -1 : 1;
  if (l && e.speed != 0) {
    e.rotate(-turnSpeed * rev);
  }
  if (u) {
    e.speed += accel;
    if (e.speed < 0) {
      // add a bit more speed if going forward from reverse.
      e.speed += accel;
    }
  }
  if (r && e.speed != 0) {
    e.rotate(turnSpeed * rev);
  }
  if (d) {
    e.speed -= accel;
    if (e.speed > 0) {
      // add a little more power to reverse if still going forward.
      e.speed -= accel / 2;
    }
  }

  // Limit speed.
  if (e.speed < -maxSpeed) e.speed = -maxSpeed;
  else if (e.speed > maxSpeed) e.speed = maxSpeed;

  // Decrease speed when neither button is held for a given axis.
  if (!u && !d) {
    const sp = e.speed;
    e.speed = sp < 0 ? sp + 1 : sp > 0 ? sp - 1 : sp;
  }

  // Handle interaction with canvas borders (wrap-around).
  if (e.x < -e.width) e.x = game.width;
  if (e.y < -e.height) e.y = game.height;
  if (e.x > game.width) e.x = -e.width;
  if (e.y > game.height) e.y = -e.height;

  // Move the entity.
  e.move();
};
