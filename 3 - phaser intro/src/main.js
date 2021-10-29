import Phaser from "phaser";

// Cleanup for Parcel
document.querySelectorAll("canvas").forEach((element) => element.remove());

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 500 },
    },
  },
  scene: {
    preload: preload,
    create: create,
  },
};

const game = new Phaser.Game(config);

function preload() {
  this.load.image("bg", require("./img/bg.png"));
  this.load.image("logo", require("./img/logo.png"));
  this.load.image("particle", require("./img/particle.png"));
}

function create() {
  this.add.image(400, 300, "bg");

  const particles = this.add.particles("particle");

  const emitter = particles.createEmitter({
    speed: 400,
    scale: { start: 1, end: 0 },
    blendMode: "ADD",
    rotate: {
      onEmit: (particle) => {
        return 0;
      },
      onUpdate: (particle) => {
        return particle.angle + 1;
      },
    },
  });

  const logo = this.physics.add.image(400, 100, "logo");

  logo.setVelocity(100, 200);
  logo.setBounce(1, 1);
  logo.setCollideWorldBounds(true);

  emitter.startFollow(logo);
}
