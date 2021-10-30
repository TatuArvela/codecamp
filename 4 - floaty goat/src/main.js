import Phaser from "phaser";
import { getInitialColor, rotateColor } from "./color";

// Cleanup for Parcel
document.querySelectorAll("canvas").forEach((element) => element.remove());

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1200 },
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

const SCROLL_SPEED = -200;
const FRAMES_UNTIL_PIPE = 120;
const SPAWN_PIPES_AT = 1024;
const GAP_SIZE = 160;

let framesUntilPipe = FRAMES_UNTIL_PIPE;
const game = new Phaser.Game(config);
let score = 0;
let scoreText;
let gameRunning = true;
let goat;
let ground;
let restartButton;
let pipePairs = [];
let groundSprite;

function preload() {
  this.load.image("bg", require("./img/bg.png"));
  this.load.image("ground", require("./img/ground.png"));
  this.load.image("goat", require("./img/goat.png"));
  this.load.image("goat-jump", require("./img/goat-jump.png"));
  this.load.image("pipe", require("./img/pipe.png"));
  this.load.image("pipe-end", require("./img/pipe-end.png"));
  this.load.image("restart", require("./img/restart.png"));
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
  bg.displayOriginX = 0;
  bg.displayOriginY = 0;

  scoreText = this.add.text(24, 24, "Score: 0", {
    fontSize: "32px",
    fontFamily: '"Press Start 2P", sans-serif',
    fill: "#fff",
    stroke: "#000",
    strokeThickness: 8,
    strokeStyle: "solid",
  });
  scoreText.depth = 3;

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

  this.add.text(
    20,
    config.height - 32,
    "Floaty Goat / Made at Nitor Code Camp 2021 / Tatu Arvela",
    {
      fontSize: "16px",
      fontFamily: '"Press Start 2P", sans-serif',
      fill: "#a17c7c",
    }
  );

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
  score = newScore;
  scoreText.setText("Score: " + score);
}

function update() {
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
      endGame();
    }

    framesUntilPipe--;
    if (framesUntilPipe === 0) {
      pipePairs.push(createPipePair.bind(this)(SPAWN_PIPES_AT, GAP_SIZE));
      framesUntilPipe = FRAMES_UNTIL_PIPE;
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

    groundSprite.tilePositionX -= SCROLL_SPEED / 60;
  }
}
