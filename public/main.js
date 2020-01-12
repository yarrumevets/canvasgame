// Example Game.
import { game } from "/game.js";

// Setup the canvas.
game.init({
  fps: 100,
  mount: "game-root",
  width: 640,
  height: 480,
  backgroundColor: "blue"
});

// Load images from specific directory. /assets/images/~
const loadImagesPromise = game.loadImages({
  sprites: {
    player: "eraser.png",
    enemy: "box.png"
  },
  backgrounds: {
    grid: "grid.png"
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
    console.log(imageLoadResult);

    game.createEntity({
      name: "enemy",
      image: "enemy",
      xStart: game.width / 2 - 50,
      yStart: game.height / 2 - 50,
      width: 100,
      height: 100,
      xSpeed: 250,
      ySpeed: 100,
      xDir: 1,
      yDir: -1,
      visible: true,
      depth: 10
    });

    game.createEntity({
      name: "player",
      image: "player",
      xStart: game.width - 110,
      yStart: game.height - 110,
      width: 50,
      height: 80,
      xSpeed: 0,
      ySpeed: 0,
      xDir: 1,
      yDir: -1,
      visible: true,
      depth: 30
    });

    game.score = 0;

    game.mainGameLoop(() => {
      const entEnemy = game.entities.enemy;
      const entPlayer = game.entities.player;

      game.moveEntityBounce(entEnemy);
      game.moveEntityWithKeys(entPlayer);

      const collided = game.collisionDetectionRectRect(entEnemy, entPlayer);

      if (collided) {
        game.score++;
        entEnemy.x = entEnemy.xStart;
        entEnemy.y = entEnemy.yStart;
        entEnemy.xDir = Math.random() >= 0.5 ? 1 : -1;
        entEnemy.yDir = Math.random() >= 0.5 ? 1 : -1;
        entPlayer.x = entPlayer.xStart;
        entPlayer.y = entPlayer.yStart;
        entPlayer.xSpeed = 0;
        entPlayer.ySpeed = 0;
      }

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
// Custom functions.

// Player moves similar to the game Asteroids.
game.moveEntityWithKeys = e => {
  const xAccel = 5;
  const yAccel = 5;
  const l = game.isKeyPressed("LEFT");
  const r = game.isKeyPressed("RIGHT");
  const u = game.isKeyPressed("UP");
  const d = game.isKeyPressed("DOWN");
  if (l) {
    e.xSpeed -= xAccel;
  }
  if (u) {
    e.ySpeed -= yAccel;
  }
  if (r) {
    e.xSpeed += xAccel;
  }
  if (d) {
    e.ySpeed += yAccel;
  }
  // Decrease x/y speed when neither button is held for a given axis.
  if (!l && !r) {
    const sp = e.xSpeed;
    e.xSpeed = sp < 0 ? sp + 1 : sp > 0 ? sp - 1 : sp;
  }
  if (!u && !d) {
    const sp = e.ySpeed;
    e.ySpeed = sp < 0 ? sp + 1 : sp > 0 ? sp - 1 : sp;
  }
  e.x += e.xSpeed / game.fps;
  e.y += e.ySpeed / game.fps;
  if (e.x < -e.width) e.x = game.width;
  if (e.y < -e.height) e.y = game.height;
  if (e.x > game.width) e.x = -e.width;
  if (e.y > game.height) e.y = -e.height;
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
