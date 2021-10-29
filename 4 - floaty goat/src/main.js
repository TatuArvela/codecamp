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
      gravity: { y: 500 },
    },
  },
  collider: {},
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
};

const game = new Phaser.Game(config);
let goat;
let pipePairs = [];
let groundSprite;
let framesUntilPipe = 100;

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

  const topPipeEnd = this.add.sprite(x, topPipeHeight, "pipe-end");
  topPipeEnd.displayOriginX = 0;
  topPipeEnd.displayOriginY = 0;
  topPipeEnd.flipY = true;

  const topPipe = this.add.tileSprite(x, 0, 64, topPipeHeight, "pipe");
  topPipe.displayOriginX = 0;
  topPipe.displayOriginY = 0;

  const bottomPipeHeight = totalPipeHeight - topPipeHeight;

  const bottomY =
    config.height - pipeEndHeight - bottomPipeHeight - groundHeight;

  const bottomPipeEnd = this.add.sprite(x, bottomY, "pipe-end");
  bottomPipeEnd.displayOriginX = 0;
  bottomPipeEnd.displayOriginY = 0;

  const bottomPipe = this.add.tileSprite(
    x,
    bottomY + pipeEndHeight,
    64,
    bottomPipeHeight,
    "pipe"
  );
  bottomPipe.displayOriginX = 0;
  bottomPipe.displayOriginY = 0;

  return {
    getX: () => topPipe.x,
    setX: (x) => {
      topPipeEnd.setX(x);
      topPipe.setX(x);
      bottomPipeEnd.setX(x);
      bottomPipe.setX(x);
    },
  };

  // const pipeGroup = this.add.physics.container(x, bottomY, [
  //   topPipeEnd,
  //   topPipe,
  //   bottomPipeEnd,
  //   bottomPipe,
  // ]);
  //
  // return pipeGroup;
}

function create() {
  const bg = this.add.image(0, 0, "bg");
  bg.displayOriginX = 0;
  bg.displayOriginY = 0;

  goat = this.physics.add.sprite(config.width / 4, config.height / 3, "goat");
  goat.setVelocity(0, 100);
  goat.setBounce(1, 1);
  goat.setCollideWorldBounds(true);

  groundSprite = this.add.tileSprite(
    0,
    config.height - 36,
    config.width * 2,
    72,
    "ground"
  );
  const ground = this.physics.add.existing(groundSprite, true);

  pipePairs.push(createPipePair.bind(this)(1200, 100));

  this.physics.add.collider(goat, ground);
  //this.physics.add.collider(goat, pipe);
}

function update() {
  if (goat.body.velocity.y < 0) {
    goat.setTexture("goat-jump");
  } else {
    goat.setTexture("goat");
  }

  framesUntilPipe--;
  if (framesUntilPipe === 0) {
    pipePairs.push(createPipePair.bind(this)(1200, 100));
    framesUntilPipe = 100;
  }

  pipePairs.forEach((pipePair) => pipePair.setX(pipePair.getX() - 5));
  groundSprite.tilePositionX += 5;
}
