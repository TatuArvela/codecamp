const floor = 0;
const ceil = 255;
const colorStep = 5;

const asHexNumber = (r, g, b) => {
  const rString = r.toString(16).padStart(2, "0");
  const gString = g.toString(16).padStart(2, "0");
  const bString = b.toString(16).padStart(2, "0");
  const hexString = `0x${rString}${gString}${bString}`;
  return parseInt(hexString);
};

const asNumberTriplet = (number) => {
  const string = number.toString(16).padStart(6, "0");
  const r = parseInt(string.substring(0, 2), 16);
  const g = parseInt(string.substring(2, 4), 16);
  const b = parseInt(string.substring(4, 6), 16);
  return [r, g, b];
};

export const getInitialColor = () => asHexNumber(ceil, ceil, floor);

export const rotateColor = (previousColor) => {
  const [r, g, b] = asNumberTriplet(previousColor);

  if (r >= floor && g === ceil && b < ceil) {
    return asHexNumber(r - colorStep, g, b + colorStep);
  }

  if (r < ceil && g >= floor && b === ceil) {
    return asHexNumber(r + colorStep, g - colorStep, b);
  }

  if (r === ceil && g < ceil && b >= floor) {
    return asHexNumber(r, g + colorStep, b - colorStep);
  }

  return previousColor;
};
