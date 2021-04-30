import chroma from 'chroma-js';

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
  colors.forEach((current, index) => {
    const constrolButtons = current.children[1].querySelectorAll('.color__button') as NodeListOf<HTMLElement>;
    const hexText = current.firstElementChild as HTMLElement;
    const randomColor = generateHexCode();

    // Change background to generated color
    current.style.backgroundColor = randomColor;

    // Change name to generated color
    hexText.innerText = randomColor;

    // Adjust the color of text and icons to be more visible
    checkContrast(randomColor, hexText, constrolButtons);
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

randomColors();

// Events
generateButton.addEventListener('click', () => {
  randomColors();
});
