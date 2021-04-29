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
  colors.forEach((curr, index) => {
    const hexText = curr.firstElementChild as HTMLElement;
    const randomColor = generateHexCode();

    curr.style.backgroundColor = randomColor;
    hexText.innerText = randomColor;
  });
}

randomColors();

// Events
generateButton.addEventListener('click', () => {
  randomColors();
});