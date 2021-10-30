import Phaser from "phaser";

// Cleanup for Parcel
document.querySelectorAll("canvas").forEach((element) => element.remove());

const config = {
  type: Phaser.AUTO,
  width: 1024,
  height: 768,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 1000 },
    },
  },
  collider: {},
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const SCROLL_SPEED = -200;
const FRAMES_UNTIL_PIPE = 100;

let framesUntilPipe = FRAMES_UNTIL_PIPE;
const game = new Phaser.Game(config);
let score = 0;
let scoreText;
let gameRunning = true;
let goat;
let pipePairs = [];
let groundSprite;

function preload() {
  this.load.image("bg", require("./img/bg.png"));
  this.load.image("ground", require("./img/ground.png"));
  this.load.image("goat", require("./img/goat.png"));
  this.load.image("goat-jump", require("./img/goat-jump.png"));
  this.load.image("pipe", require("./img/pipe.png"));
  this.load.image("pipe-end", require("./img/pipe-end.png"));
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

  return {
    passed: false,
    getX: () => topPipe.x,
    remove: () => {
      topPipeEndSprite.destroy();
      topPipeSprite.destroy();
      bottomPipeEndSprite.destroy();
      bottomPipeSprite.destroy();
    },
    stop: () => {
      topPipeEndSprite.body.setVelocityX(0);
      topPipe.body.setVelocityX(0);
      bottomPipeEndSprite.body.setVelocityX(0);
      bottomPipe.body.setVelocityX(0);
    },
  };
}

function create() {
  const bg = this.add.image(0, 0, "bg");
  bg.displayOriginX = 0;
  bg.displayOriginY = 0;

  scoreText = this.add.text(16, 16, "Score: 0", {
    fontSize: "32px",
    fontFamily: "sans-serif",
    fill: "#000",
  });
  scoreText.depth = 3;

  goat = this.physics.add.sprite(config.width / 4, config.height / 3, "goat");
  goat.depth = 2;
  goat.body.mass = 1000;
  goat.setCollideWorldBounds(true);

  groundSprite = this.add.tileSprite(
    0,
    config.height - 36,
    config.width * 2,
    72,
    "ground"
  );
  const ground = this.physics.add.existing(groundSprite, true);

  this.add.text(16, config.height - 40, "Floaty Goat", {
    fontSize: "24px",
    fontFamily: "sans-serif",
    fill: "#000",
  });

  this.physics.add.collider(goat, ground);

  this.input.on("pointerup", function () {
    if (gameRunning) {
      goat.body.setVelocityY(-350);
    }
  });
}

function stopAllPipes() {
  pipePairs.forEach((pipe) => {
    pipe.stop();
  });
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
      goat.angle = 45;
      stopAllPipes();
      gameRunning = false;
    }

    framesUntilPipe--;
    if (framesUntilPipe === 0) {
      pipePairs.push(createPipePair.bind(this)(1200, 200));
      framesUntilPipe = FRAMES_UNTIL_PIPE;
    }

    pipePairs.forEach((pipe, index) => {
      if (!pipe.passed && pipe.getX() < goat.x) {
        pipe.passed = true;
        score++;
        scoreText.setText("Score: " + score);
      }
      if (pipe.getX() < -64) {
        pipe.remove();
        pipePairs.splice(index, 1);
      }
    });

    groundSprite.tilePositionX -= SCROLL_SPEED / 60;
  }
}
