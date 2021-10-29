import Two from "two.js";

// Cleanup for Parcel
document.querySelectorAll("svg").forEach((element) => element.remove());

const two = new Two({
  fullscreen: true,
  autostart: true,
}).appendTo(document.body);

const circle1 = two.makeCircle(0, -30, 50);
const circle2 = two.makeCircle(30, 0, 50);
const circle3 = two.makeCircle(0, 30, 50);
const circle4 = two.makeCircle(-30, 0, 50);
const circles = [circle1, circle2, circle3, circle4];

circles.forEach((circle) => {
  circle.stroke = "transparent";
  circle.fill = "#00ffff";
  circle.linewidth = 2;
});

const circle = two.makeCircle(0, 0, 30);
circle.fill = "#ffdd00";
circle.linewidth = 3;

const group = two.makeGroup(...circles, circle);
group.translation.set(two.width / 2, two.height / 2);
group.stroke = "black";

let rotationSpeed = 0.001;
let step = 0;
two.bind("update", function () {
  group.rotation += rotationSpeed;
  rotationSpeed = rotationSpeed + rotationSpeed / 100;
  switch (step) {
    case 0:
      group.translation.set(
        two.width / 2 + rotationSpeed * 100,
        two.height / 2 + -rotationSpeed * 100
      );
      step = 1;
      break;
    case 1:
      group.translation.set(
        two.width / 2 + rotationSpeed * 100,
        two.height / 2 + rotationSpeed * 100
      );
      step = 2;
      break;
    case 2:
      group.translation.set(
        two.width / 2 + -rotationSpeed * 100,
        two.height / 2 + rotationSpeed * 100
      );
      step = 3;
      break;
    case 3:
      group.translation.set(
        two.width / 2 + -rotationSpeed * 100,
        two.height / 2 + -rotationSpeed * 100
      );
      step = 0;
      break;
  }
});
