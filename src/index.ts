import chroma, { rgb } from 'chroma-js';

// Selectors
const colors = document.querySelectorAll('.color') as NodeListOf<HTMLElement>;
const generateButton = document.querySelector('.panel__button--generate') as HTMLButtonElement;
const sliders = document.querySelectorAll('input[type="range"]') as NodeListOf<HTMLElement>;
const colorHex = document.querySelectorAll('.color__header') as NodeListOf<HTMLElement>;

/**
 * Generates random hex value for color
 */
function generateHexCode(): string {
  const hexColor = chroma.random().hex();
  return hexColor;
}

/**
 * Set hex values as background color to color divs and names
 */
function randomColors() {
  colors.forEach((colorDiv, index) => {
    const constrolButtons = colorDiv.children[1].querySelectorAll('.color__button') as NodeListOf<HTMLElement>;
    const hexText = colorDiv.firstElementChild as HTMLElement;
    const randomColor = generateHexCode();

    // Change background to generated color
    colorDiv.style.backgroundColor = randomColor;

    // Change name to generated color
    hexText.innerText = randomColor;

    // Adjust the color of text and icons to be more visible
    checkContrast(randomColor, hexText, constrolButtons);

    // Initialise sliders
    const hueSlider = colorDiv.querySelector('.hue-input') as HTMLInputElement;
    const brightnessSlider = colorDiv.querySelector('.bright-input') as HTMLInputElement;
    const saturationSlider = colorDiv.querySelector('.sat-input') as HTMLInputElement;
    initialiseSliders(randomColor, hueSlider, brightnessSlider, saturationSlider);
  });
}

/**
 * Checks how bright or dark the color is and adjust the color of text and buttons accordingly
 */
function checkContrast(hex: string, text: HTMLElement, buttons: NodeListOf<HTMLElement>) {
  const luminance = chroma(hex).luminance();
  const color = luminance > 0.5 ? 'var(--black)' : 'var(--white)';
  text.style.color = color;
  buttons.forEach((button) => (button.style.fill = color));
}

/**
 * Set correct values for color sliders
 */
function initialiseSliders(
  color: string,
  hue: HTMLInputElement,
  brightness: HTMLInputElement,
  saturation: HTMLInputElement
) {
  // Get least and most saturated color value
  const noSaturation = chroma(color).set('hsl.s', 0);
  const fullSaturation = chroma(color).set('hsl.s', 1);
  const scaleSaturation = chroma.scale([noSaturation, color, fullSaturation]);

  // Get middle brightness because black is least bright and white is most bright of the color
  const midBrightness = chroma(color).set('hsl.l', 0.5);
  const scaleBrightness = chroma.scale(['black', midBrightness, 'white']);

  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSaturation(0).hex()}, ${scaleSaturation(
    1
  ).hex()})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBrightness(0).hex()},${scaleBrightness(
    0.5
  ).hex()}, ${scaleBrightness(1).hex()})`;
  hue.style.backgroundImage = `linear-gradient(to right, #FF0000, #FFFF00, #00FF00, #00FFFF, #0000FF, #FF00FF, #FF0000)`;
}

randomColors();

// Events
generateButton.addEventListener('click', () => {
  randomColors();
});
