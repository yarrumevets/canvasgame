export const game = {
  config: {
    defaultFont: "sans-serif",
    keyCodeToName: {
      //Mac
      91: "COMMAND-LEFT",
      93: "COMMAND-RIGHT",
      18: "OPTION",
      8: "BACKSPACE",
      13: "ENTER",
      // Other
      9: "TAB",
      17: "CTRL",
      20: "CAPS",
      37: "LEFT",
      38: "UP",
      39: "RIGHT",
      40: "DOWN",
      32: "SPACE",
      16: "SHIFT", // left &/or right.
      49: "1",
      50: "2",
      51: "3",
      52: "4",
      53: "5",
      54: "6",
      55: "7",
      56: "8",
      57: "9",
      65: "A",
      66: "B",
      67: "C",
      68: "D",
      69: "E",
      70: "F",
      71: "G",
      72: "H",
      73: "I",
      74: "J",
      75: "K",
      76: "L",
      77: "M",
      78: "N",
      79: "O",
      80: "P",
      81: "Q",
      82: "R",
      83: "S",
      84: "T",
      85: "U",
      86: "V",
      87: "W",
      88: "X",
      89: "Y",
      90: "Z"
    },
    keyNameToCode: {
      //Mac
      "COMMAND-LEFT": 91,
      "COMMAND-RIGHT": 93,
      OPTION: 18,
      BACKSPACE: 8,
      ENTER: 13,
      // Other
      TAB: 9,
      CTRL: 17,
      CAPS: 20,
      LEFT: 37,
      UP: 38,
      RIGHT: 39,
      DOWN: 40,
      SPACE: 32,
      SHIFT: 16, // left &/or right.
      "1": 49,
      "2": 50,
      "3": 51,
      "4": 52,
      "5": 53,
      "6": 54,
      "7": 55,
      "8": 56,
      "9": 57,
      A: 65,
      B: 66,
      C: 67,
      D: 68,
      E: 69,
      F: 70,
      G: 71,
      H: 72,
      I: 73,
      J: 74,
      K: 75,
      L: 76,
      M: 77,
      N: 78,
      O: 79,
      P: 80,
      Q: 81,
      R: 82,
      S: 83,
      T: 84,
      U: 85,
      V: 86,
      W: 87,
      X: 88,
      Y: 89,
      Z: 90
    }
  },
  fps: 30,
  canvas: null,
  width: null,
  height: null,
  ctx: null,
  keyStates: {},
  isKeyPressed(keyName) {
    const keyCode = this.config.keyNameToCode[keyName];
    if (keyCode && this.keyStates[keyCode]) {
      return true;
    }
    return false;
  },
  // This is the loading screen color and background if no background image set.
  backgroundColor: "#000",
  images: {
    sprites: {},
    backgrounds: {}
  },
  entities: {},
  backgroundImage: null,
  gameInterval: null,
  kill() {
    clearInterval(this.gameInterval);
  },
  texts: {},
  addText(args) {
    this.texts[args.name] = {
      text: args.default,
      x: args.x,
      y: args.y,
      fontSize: args.fontSize,
      fontFamily: args.fontFamily,
      color: args.color
    };
  },
  init(args) {
    if (!args.mount || !args.width || !args.height) {
      throw "Foobar!";
    }
    if (args.fps && !isNaN(args.fps)) {
      this.fps = args.fps;
    }
    this.frameRate = 1000 / this.fps; // fps -to-> ms between frames.
    const mountEl = document.getElementById(args.mount);
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d");
    this.width = args.width;
    this.height = args.height;
    this.canvas.setAttribute("width", this.width);
    this.canvas.setAttribute("height", this.height);
    this.backgroundColor = args.backgroundColor;
    mountEl.appendChild(this.canvas);
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.fillRect(0, 0, this.width, this.height);
    document.getElementById("game-kill-switch").onclick = () => {
      this.kill();
    };
    //Get keys press/release
    document.onkeydown = function(e) {
      game.keyStates[e.keyCode] = true;
    };
    document.onkeyup = function(e) {
      delete game.keyStates[e.keyCode];
    };
    this.ctx.textBaseline = "top"; // position text from top-left like images.
  },
  createEntity(args) {
    this.entities[args.name] = {};
    const e = this.entities[args.name];
    e.image = this.images.sprites[args.image];
    e.x = e.xStart = args.xStart;
    e.y = e.yStart = args.yStart;
    e.width = args.width;
    e.height = args.height;
    e.visible = args.visible;
    e.xSpeed = args.xSpeed;
    e.ySpeed = args.ySpeed;
    e.xDir = args.xDir;
    e.yDir = args.yDir;
    e.depth = args.depth;
  },

  loadImages(args) {
    const spriteImages = args.sprites;
    const backgroundImages = args.backgrounds;
    const loadImagesFrom = (srcArr, path, dest) => {
      Object.keys(srcArr).forEach(i => {
        dest[i] = new Image();
        dest[i].src = path + srcArr[i];
      });
    };

    loadImagesFrom(
      spriteImages,
      "/assets/images/sprites/",
      this.images.sprites
    );
    loadImagesFrom(
      backgroundImages,
      "/assets/images/backgrounds/",
      this.images.backgrounds
    );

    const promise = new Promise((resolve, reject) => {
      let allImagesLoaded = true;
      const maxTime = 5000; // ms.
      let count = 0;
      const delay = 10;
      const countBy = parseInt(maxTime / delay);
      const interval = setInterval(() => {
        allImagesLoaded = true;
        const s = this.images.sprites;
        Object.keys(s).forEach(spr => {
          if (!s[spr].complete) allImagesLoaded = false;
        });
        const b = this.images.backgrounds;
        Object.keys(b).forEach(spr => {
          if (!b[spr].complete) allImagesLoaded = false;
        });
        if (allImagesLoaded) {
          clearInterval(interval);
          resolve("All images loaded.");
        } else if (count >= maxTime) {
          clearInterval(interval);
          reject(
            "game.loadImages(): Image load timeout (" +
              maxTime +
              "ms) exceeded."
          );
        }
        count += countBy;
      }, 5);
    });
    return promise;
  },

  collisionDetectionRectRect(a, b) {
    const aRight = a.x + a.width;
    const bRight = b.x + b.width;
    if (aRight < b.x || bRight < a.x) return false;
    const aBottom = a.y + a.height;
    const bBottom = b.y + b.height;
    if (aBottom < b.y || bBottom < a.y) return false;
    return true;
  },

  drawFrame() {
    // draw background
    if (this.backgroundImage)
      this.ctx.drawImage(
        this.images.backgrounds[this.backgroundImage],
        0,
        0,
        this.width,
        this.height
      );
    else {
      this.ctx.fillStyle = this.backgroundColor;
      this.ctx.fillRect(0, 0, this.width, this.height);
    }

    // Sort entities by depth.
    const sortedIndex = Object.keys(this.entities).sort((a, b) => {
      a = this.entities[a].depth;
      b = this.entities[b].depth;
      return a < b ? -1 : 1;
    });

    // Draw entities in order of depth.
    sortedIndex.forEach(i => {
      const e = this.entities[i];
      if (e.visible) {
        this.ctx.drawImage(e.image, e.x, e.y, e.width, e.height);
      }
    });

    // Draw text.
    Object.keys(this.texts).forEach(t => {
      const txt = this.texts[t];
      this.ctx.fillStyle = txt.color || "#000"; // alt: ctx.strokeStyle
      this.ctx.font =
        txt.fontSize + "px " + txt.fontFamily || this.config.defaultFont;
      this.ctx.fillText(txt.text, txt.x, txt.y); // alt: ctx.strokeText
    });
  },

  mainGameLoop(mainGameLogicCB) {
    let t = Date.now();
    const cb = mainGameLogicCB.bind(this);
    this.gameInterval = setInterval(() => {
      cb();
      while (Date.now() - t < this.frameRate) {}
      this.drawFrame();
      t = Date.now();
    }, 0);
  }
};
