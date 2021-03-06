import Phaser from "phaser";
import { getInitialColor, rotateColor } from "./color";

// Cleanup for Parcel
document.querySelectorAll("canvas").forEach((element) => element.remove());

const localStorage = window.localStorage;
const FPS = 60;
const config = {
  type: Phaser.AUTO,
  width: 600,
  height: 960,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
      fps: FPS,
    },
  },
  collider: {},
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  pixelArt: true,
  roundPixels: false,
  antialias: false,
  antialiasGL: false,
};

const SCROLL_SPEED = -120;
const PIPE_RATE = 3000; // milliseconds
const SPAWN_PIPES_AT = 600;
const GAP_SIZE = 160;

let timeFromLastPipe = 0;
const game = new Phaser.Game(config);
let score = 0;
let scoreText;
let hiscore = localStorage.getItem("hiscore") || 0;
let hiscoreText;
let gameRunning = true;
let goat;
let restartButton;
let pipePairs = [];
let ground;
let groundSprite;
let groundDummy;

function preload() {
  this.game.advancedTiming = true;
  this.load.image("bg", require("./img/bg.png"));
  this.load.image("ground", require("./img/ground.png"));
  this.load.image("goat", require("./img/goat.png"));
  this.load.image("goat-jump", require("./img/goat-jump.png"));
  this.load.image("pipe", require("./img/pipe.png"));
  this.load.image("pipe-end", require("./img/pipe-end.png"));
  this.load.image("restart", require("./img/restart.png"));
  this.load.script(
    "webfont",
    "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
  );
}

function createPipePair(x, gapHeight) {
  const groundHeight = 72;
  const pipeEndHeight = 32;
  const totalPipeHeight =
    config.height -
    pipeEndHeight -
    gapHeight -
    pipeEndHeight -
    groundHeight +
    1; // This 1 is needed for some reason to make the graphics pixel perfect
  const topPipeHeight = Math.floor(Math.random() * totalPipeHeight);
  const bottomPipeHeight = totalPipeHeight - topPipeHeight;
  const bottomY =
    config.height - pipeEndHeight - bottomPipeHeight - groundHeight;

  const topPipeEndSprite = this.physics.add.sprite(
    x,
    topPipeHeight,
    "pipe-end"
  );
  topPipeEndSprite.displayOriginX = 0;
  topPipeEndSprite.displayOriginY = 0;
  topPipeEndSprite.flipY = true;
  topPipeEndSprite.body.setAllowGravity(false);
  topPipeEndSprite.body.setImmovable(true);
  topPipeEndSprite.body.setVelocityX(SCROLL_SPEED);
  this.physics.add.overlap(goat, topPipeEndSprite);

  const topPipeSprite = this.add.tileSprite(x, 0, 64, topPipeHeight, "pipe");
  topPipeSprite.displayOriginX = 0;
  topPipeSprite.displayOriginY = 0;
  const topPipe = this.physics.add.existing(topPipeSprite);
  topPipe.body.setAllowGravity(false);
  topPipe.body.setImmovable(true);
  topPipe.body.setVelocityX(SCROLL_SPEED);
  this.physics.add.overlap(goat, topPipe);

  const bottomPipeEndSprite = this.physics.add.sprite(x, bottomY, "pipe-end");
  bottomPipeEndSprite.displayOriginX = 0;
  bottomPipeEndSprite.displayOriginY = 0;
  bottomPipeEndSprite.body.setAllowGravity(false);
  bottomPipeEndSprite.body.setImmovable(true);
  bottomPipeEndSprite.body.setVelocityX(SCROLL_SPEED);
  this.physics.add.overlap(goat, bottomPipeEndSprite);

  const bottomPipeSprite = this.add.tileSprite(
    x,
    bottomY + pipeEndHeight,
    64,
    bottomPipeHeight,
    "pipe"
  );
  bottomPipeSprite.displayOriginX = 0;
  bottomPipeSprite.displayOriginY = 0;
  const bottomPipe = this.physics.add.existing(bottomPipeSprite);
  bottomPipe.body.setAllowGravity(false);
  bottomPipe.body.setImmovable(true);
  bottomPipe.body.setVelocityX(SCROLL_SPEED);
  this.physics.add.overlap(goat, bottomPipe);

  let tint = getInitialColor();
  const changeColorInterval = setInterval(() => {
    tint = rotateColor(tint);
    topPipeEndSprite.tint = tint;
    topPipeSprite.tint = tint;
    bottomPipeEndSprite.tint = tint;
    bottomPipeSprite.tint = tint;
  }, 10);

  return {
    passed: false,
    getX: () => topPipe.x,
    remove: () => {
      topPipeEndSprite.destroy();
      topPipeSprite.destroy();
      bottomPipeEndSprite.destroy();
      bottomPipeSprite.destroy();
      clearInterval(changeColorInterval);
    },
    stop: () => {
      topPipeEndSprite.body.setVelocityX(0);
      topPipe.body.setVelocityX(0);
      bottomPipeEndSprite.body.setVelocityX(0);
      bottomPipe.body.setVelocityX(0);
    },
  };
}

function initGoat() {
  goat = this.physics.add.sprite(config.width / 4, config.height / 3, "goat");
  goat.body.setSize(48, 48);
  goat.depth = 2;
  goat.body.mass = 1000;
  goat.setCollideWorldBounds(true);
  this.physics.add.collider(goat, ground);
}

function create() {
  const bg = this.add.image(0, 0, "bg");
  bg.setDisplaySize(config.width, config.height);
  bg.displayOriginX = 0;
  bg.displayOriginY = 0;

  // This is a bit silly, I wonder if arcade physics provides anything else I could use on each update
  groundDummy = this.physics.add.sprite(0, config.height, "ground");
  groundDummy.body.setVelocityX(SCROLL_SPEED);

  groundSprite = this.add.tileSprite(
    0,
    config.height - 36,
    config.width * 2,
    72,
    "ground"
  );
  ground = this.physics.add.existing(groundSprite, true);

  initGoat.bind(this)();

  restartButton = this.add.image(
    config.width / 2,
    config.height / 2,
    "restart"
  );
  restartButton.depth = 4;
  restartButton.visible = false;

  WebFont.load({
    google: {
      families: ["Press Start 2P"],
    },
    active: () => {
      scoreText = this.add.text(24, 24, "Score: " + score, {
        fontSize: "28px",
        fontFamily: '"Press Start 2P", sans-serif',
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 8,
        strokeStyle: "solid",
      });
      scoreText.depth = 3;

      hiscoreText = this.add.text(24, 74, "Hiscore: " + hiscore, {
        fontSize: "28px",
        fontFamily: '"Press Start 2P", sans-serif',
        fill: "#fff",
        stroke: "#000",
        strokeThickness: 8,
        strokeStyle: "solid",
      });
      hiscoreText.depth = 3;

      this.add.text(20, config.height - 42, "Floaty Goat", {
        fontSize: "11px",
        fontFamily: '"Press Start 2P", sans-serif',
        fill: "#a17c7c",
      });
      this.add.text(
        20,
        config.height - 22,
        "Made at Nitor Code Camp 2021 / Tatu Arvela",
        {
          fontSize: "11px",
          fontFamily: '"Press Start 2P", sans-serif',
          fill: "#a17c7c",
        }
      );
    },
  });

  this.input.on("pointerup", () => {
    if (gameRunning) {
      goat.body.setVelocityY(-350);
    } else {
      restartGame.bind(this)();
    }
  });
  this.input.keyboard.on("keydown-SPACE", () => {
    if (gameRunning) {
      goat.body.setVelocityY(-350);
    } else {
      restartGame.bind(this)();
    }
  });
  this.input.keyboard.on("keydown-R", () => restartGame.bind(this)());
}

function endGame() {
  goat.angle = 45;
  stopAllPipes();
  gameRunning = false;
  restartButton.visible = true;
}

function restartGame() {
  restartButton.visible = false;
  setScore(0);
  goat.body.destroy();
  goat.destroy();
  initGoat.bind(this)();
  pipePairs.forEach((pipe) => pipe.remove());
  pipePairs = [];
  gameRunning = true;
}

function stopAllPipes() {
  pipePairs.forEach((pipe) => {
    pipe.stop();
  });
}

function setScore(newScore) {
  if (newScore > hiscore) {
    hiscore = newScore;
    localStorage.setItem("hiscore", hiscore);
  }
  score = newScore;
  hiscoreText?.setText("Hiscore: " + hiscore);
  scoreText?.setText("Score: " + score);
}

function update(time, delta) {
  if (gameRunning) {
    if (goat.body.velocity.y < 0) {
      goat.setTexture("goat-jump");
      goat.angle = -15;
    } else {
      goat.setTexture("goat");
      if (goat.body.velocity.y > 200) {
        goat.angle = 15;
      } else {
        goat.angle = 0;
      }
    }

    if (!goat.body.touching.none) {
      return endGame();
    }

    timeFromLastPipe += delta;
    if (timeFromLastPipe >= PIPE_RATE) {
      timeFromLastPipe = 0;
      pipePairs.push(createPipePair.bind(this)(SPAWN_PIPES_AT, GAP_SIZE));
    }

    pipePairs.forEach((pipe, index) => {
      if (!pipe.passed && pipe.getX() < goat.x) {
        pipe.passed = true;
        setScore(score + 1);
      }
      if (pipe.getX() < -64) {
        pipe.remove();
        pipePairs.splice(index, 1);
      }
    });

    groundSprite.tilePositionX = -groundDummy.x;
  }
}
