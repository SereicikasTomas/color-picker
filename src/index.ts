import chroma from 'chroma-js';

interface Palette {
  id: number;
  name: string;
  colors: string[];
}

// Selectors
const colors = document.querySelectorAll('.color') as NodeListOf<HTMLElement>;
const generateButton = document.querySelector('.panel__button--generate') as HTMLButtonElement;
const sliders = document.querySelectorAll('input[type="range"]') as NodeListOf<HTMLInputElement>;
const colorHeaders = document.querySelectorAll('.color__header') as NodeListOf<HTMLElement>;
const popupCopy = document.querySelector('.background--copy') as HTMLElement;
const popupSave = document.querySelector('.background--save') as HTMLElement;
const popupLibrary = document.querySelector('.background--library') as HTMLElement;
const libraryModal = popupLibrary.children[0] as HTMLElement;
const popupCloseButtons = document.querySelectorAll('.popup__close') as NodeListOf<HTMLButtonElement>;
const popupSaveButton = document.querySelector('.popup__save') as HTMLButtonElement;
const popupSaveInput = document.querySelector('.popup__input') as HTMLInputElement;
const getControlButtons = (colorDiv: HTMLElement) =>
  colorDiv.children[1].querySelectorAll('.color__button') as NodeListOf<HTMLElement>;
const adjustButtons = document.querySelectorAll('.color__button--adjust') as NodeListOf<HTMLButtonElement>;
const lockButtons = document.querySelectorAll('.color__button--lock') as NodeListOf<HTMLButtonElement>;
const sliderCloseButtons = document.querySelectorAll('.color__button--close') as NodeListOf<HTMLButtonElement>;
const sliderContainers = document.querySelectorAll('.color__sliders') as NodeListOf<HTMLElement>;
const saveButton = document.querySelector('.panel__button--save') as HTMLButtonElement;
const libraryButton = document.querySelector('.panel__button--library') as HTMLButtonElement;
const initialColors: string[] = []; // Initial colors to use for reference when changing settings
const savedPalettes: Palette[] = [];

// Events
generateButton.addEventListener('click', () => randomColors());

sliders.forEach((slider) => slider.addEventListener('input', sliderControls));

colors.forEach((color, index) => {
  color.addEventListener('input', () => {
    updateTextUI(index);
  });
});

colorHeaders.forEach((header) => {
  header.addEventListener('click', () => copyToClipboard(header.innerText));
});

popupCopy.addEventListener('transitionend', () => popupCopy.classList.remove('active'));

adjustButtons.forEach((button, index) =>
  button.addEventListener('click', () => {
    sliderContainers[index].classList.toggle('active');
  })
);

sliderCloseButtons.forEach((button, index) =>
  button.addEventListener('click', () => {
    sliderContainers[index].classList.remove('active');
  })
);

lockButtons.forEach((button, index) => {
  button.addEventListener('click', () => lockColor(button, index));
});

saveButton.addEventListener('click', () => openPopup(popupSave));

libraryButton.addEventListener('click', () => openPopup(popupLibrary));

popupSaveButton.addEventListener('click', savePalette);

popupCloseButtons.forEach((button) => button.addEventListener('click', closePopup));

libraryModal.addEventListener('click', selectPalette);

/**
 * Function responsible for setting the background, text values, contrast and sliders to right values and places
 */
function setAllValues(color: string, index: number) {
  // Set colors to array for reference
  initialColors.splice(index, 1, color);

  // Set the background color to new color
  colors[index].style.background = color;

  // Update text and buttons of color div
  updateTextUI(index);

  //
  const [hueSlider, brightnessSlider, saturationSlider] = getColorSliders(colors[index]);
  setSliderBackground(color, hueSlider, brightnessSlider, saturationSlider);
}

/**
 * Generates random hex value for color
 */
function generateHexCode(): string {
  const hexColor = chroma.random().hex();
  return hexColor;
}

/**
 * Takes in color div HTMLElement and returns it's three color sliders
 * @returns [hueSlider, brightnessSlider, saturationSlider]
 */
function getColorSliders(colorDiv: HTMLElement) {
  const hueSlider = colorDiv.querySelector('.hue-input') as HTMLInputElement;
  const brightnessSlider = colorDiv.querySelector('.bright-input') as HTMLInputElement;
  const saturationSlider = colorDiv.querySelector('.sat-input') as HTMLInputElement;

  return [hueSlider, brightnessSlider, saturationSlider];
}

/**
 * Set hex values as background color to color div and names
 */
function randomColors() {
  colors.forEach((colorDiv, index) => {
    const randomColor = generateHexCode();

    if (colorDiv.classList.contains('locked')) return;

    setAllValues(randomColor, index);
  });

  setSliders();
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
 * Set correct background values for color sliders
 */
function setSliderBackground(
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

/**
 * Gets number value of color
 */
const getColorHsl = (slider: HTMLInputElement, type: string): number => {
  const index = slider.getAttribute(`data-${type}`);
  const color = initialColors[parseInt(index as string)];
  const value = type === 'hue' ? 0 : type === 'saturation' ? 1 : 2;

  return chroma(color).hsl()[value];
};

/**
 * Moves color sliders to their right place
 */
function setSliders() {
  sliders.forEach((slider) => {
    getColorHsl(slider, slider.name);

    switch (slider.name) {
      case 'hue': {
        slider.value = Math.floor(getColorHsl(slider, slider.name)).toString();
      }
      case 'brightness':
      case 'saturation': {
        slider.value = (Math.floor(getColorHsl(slider, slider.name) * 100) / 100).toString();
      }
    }
  });
}

/**
 * Updates color values on slider input
 */
function sliderControls(e: Event) {
  const target = e.target as HTMLInputElement;
  const sliderIndex = target.getAttribute(`data-${target.name}`);
  const index = parseInt(sliderIndex as string);
  const colorDiv = colors[index] as HTMLElement;
  const [hue, brightness, saturation] = getColorSliders(colorDiv);

  // Update color values
  const hexColor = chroma(initialColors[index])
    .set('hsl.s', saturation.value)
    .set('hsl.h', hue.value)
    .set('hsl.l', brightness.value)
    .hex();

  // Set new color values
  colorDiv.style.backgroundColor = hexColor;
  setSliderBackground(hexColor, hue, brightness, saturation);
}

/**
 * Adjust color and value of color text and control buttons
 */
function updateTextUI(index: number) {
  const currentColor = colors[index];
  const currentHeader = colorHeaders[index];
  const controlButtons = getControlButtons(currentColor);
  const hexColor = chroma(currentColor.style.backgroundColor).hex();

  currentHeader.innerText = hexColor;
  checkContrast(hexColor, currentHeader, controlButtons);
}

/**
 * Copies hex value to clipboard
 */
function copyToClipboard(hex: string) {
  const textArea = document.createElement('textarea');
  textArea.value = hex;
  document.body.appendChild(textArea);
  textArea.select();
  document.execCommand('copy');
  document.body.removeChild(textArea);

  popupCopy.classList.add('active');
}

/**
 * Function responsible for locking and unlocking color
 */
function lockColor(button: HTMLButtonElement, index: number) {
  colors[index].classList.toggle('locked');
  const useEl = button.querySelector('use') as SVGUseElement;
  const href = useEl.href.baseVal;
  const isLocked = colors[index].classList.contains('locked');
  useEl.href.baseVal = isLocked ? href.replace('-open', '') : href + '-open';
}

/**
 * Function responsible for opening the popups
 */
function openPopup(popup: HTMLElement) {
  popup.classList.add('active');
}

/**
 * Function responsible for closing the popups
 */
function closePopup(e: Event) {
  const target = e.target as HTMLButtonElement;
  const popup = target.parentNode?.parentNode as HTMLElement;
  popup.classList.remove('active');
}

function customPaletteMarkup(name: string, colors: string[], id: number) {
  let colorElements = '';
  colors.forEach(
    (color) => (colorElements += `<div class="custom-palette__color" style="background-color: ${color}"></div>`)
  );

  return `<div class="popup__palette">
      <h3>${name}</h3>
      <div class="custom-palette">${colorElements}</div>
      <button class="popup__select" data-id="${id}">Select</button>
    </div>`;
}

/**
 * Function responsible for creating and saving palette object
 */
function savePalette(e: Event) {
  e.preventDefault();
  popupSave.classList.remove('active');
  const modal = popupLibrary.children[0];

  // Create values fr palette object
  const id = new Date().getTime();
  const name = popupSaveInput.value;
  const colors: string[] = [];
  colorHeaders.forEach((color) => colors.push(color.innerText));

  // Set all values to object
  const paletteObject = { id, name, colors };
  savedPalettes.push(paletteObject);

  // Don't forget to reset input value
  popupSaveInput.value = '';

  // Call function to set into local storage
  saveToLocalStorage(paletteObject);

  modal.insertAdjacentHTML('beforeend', customPaletteMarkup(name, colors, id));
}

/**
 * Function responsible for saving palettes in local storage
 */
function saveToLocalStorage(paletteObject: Palette) {
  const getPalettes = localStorage.getItem('palettes');

  // Check if any palettes exist in local storage
  const localPalettes = getPalettes ? JSON.parse(getPalettes) : [];
  // Add new palette too existing ones
  localPalettes.push(paletteObject);

  localStorage.setItem('palettes', JSON.stringify(localPalettes));
}

/**
 * Function responsible for selecting a palette from library
 * And setting all needed values to display it
 */
function selectPalette(e: Event) {
  const target = e.target as HTMLElement;
  const selectButton = target.closest('.popup__select') as HTMLButtonElement;
  const id = selectButton?.dataset?.id;
  const selectedPalette = savedPalettes.find((palette) => palette.id === parseInt(id as string))?.colors;

  // Set all needed values to display color
  selectedPalette?.forEach((color, index) => {
    setAllValues(color, index);
  });

  // Close modal when select button is clicked
  if (target.matches('.popup__select')) {
    setSliders();
    popupLibrary.classList.remove('active');
  }
}

randomColors();
