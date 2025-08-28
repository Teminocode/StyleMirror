/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Modality, Part } from '@google/genai';

// --- Style Data ---
const HAIRSTYLE_EXAMPLES = [
  'Ponytail',
  'Short Bob',
  'Long & Wavy',
  'Curly Afro',
  'Buzz Cut',
  'Messy Bun',
  'Slicked Back',
  'Bone Straight',
  'Pixie Cut',
  'Cornrows',
];

const HAIR_COLOR_EXAMPLES = [
  'Black',
  'Dark Brown',
  'Light Brown',
  'Blonde',
  'Platinum Blonde',
  'Auburn',
  'Burgundy',
  'Red',
  'Ash Gray',
  'White / Silver',
  'Ombre (two-tone blend)',
  'Highlighted (brown base with golden highlights)',
];

const OUTFIT_EXAMPLES = [
  'Business Suit',
  'Casual T-Shirt & Jeans',
  'Evening Gown',
  'Leather Jacket',
  'Summer Dress',
  'Cozy Sweater',
  'Cocktail Dress',
  'Streetwear (Hoodie + Joggers)',
  'Smart Casual (Blazer + Pants)',
  'African Print Dress',
  'Denim Jacket + Skirt',
  'Classic Trench Coat',
  'Modern Jumpsuit',
  'Formal Office Dress',
  'Chic Blouse + Trousers',
  'Winter Coat + Scarf',
  'Maxi Dress',
  'Trendy Party Dress',
];

const BACKGROUND_EXAMPLES = [
  'Studio Plain',
  'Outdoor City',
  'Beach',
  'Forest',
  'Abstract Gradient',
];

// --- DOM Element Selection ---
const baseImageInput = document.getElementById(
  'base-image-upload',
) as HTMLInputElement;
const uploadBtn = document.getElementById('upload-btn') as HTMLButtonElement;
const uploadPrompt = document.getElementById('upload-prompt') as HTMLDivElement;
const baseImagePreview = document.getElementById(
  'base-image-preview',
) as HTMLImageElement;
const hairstyleSelect = document.getElementById(
  'hairstyle-select',
) as HTMLSelectElement;
const hairColorSelect = document.getElementById(
  'hair-color-select',
) as HTMLSelectElement;
const outfitSelect = document.getElementById(
  'outfit-select',
) as HTMLSelectElement;
const backgroundSelect = document.getElementById(
  'background-select',
) as HTMLSelectElement;
const generateBtn = document.getElementById('generate-btn') as HTMLButtonElement;
const resetBtn = document.getElementById('reset-btn') as HTMLButtonElement;
const outputPlaceholder = document.getElementById(
  'output-placeholder',
) as HTMLDivElement;
const loadingSpinner = document.getElementById(
  'loading-spinner',
) as HTMLDivElement;
const outputActions = document.getElementById(
  'output-actions',
) as HTMLDivElement;
const undoBtn = document.getElementById('undo-btn') as HTMLButtonElement;
const redoBtn = document.getElementById('redo-btn') as HTMLButtonElement;
const downloadBtn = document.getElementById('download-btn') as HTMLButtonElement;

// Comparison View Elements
const comparisonContainer = document.getElementById(
  'comparison-container',
) as HTMLDivElement;
const comparisonBefore = document.getElementById(
  'comparison-before',
) as HTMLImageElement;
const comparisonAfterWrapper = document.getElementById(
  'comparison-after-wrapper',
) as HTMLDivElement;
const comparisonAfter = document.getElementById(
  'comparison-after',
) as HTMLImageElement;
const comparisonSlider = document.getElementById(
  'comparison-slider',
) as HTMLDivElement;

// --- State Management ---
let baseImageFile: File | null = null;
let generatedImageUrl: string | null = null;
let isLoading = false;
let selectedHairstyle = '';
let selectedHairColor = '';
let selectedOutfit = '';
let selectedBackground = '';
let history: string[] = [];
let historyIndex = -1;

// --- Gemini API Initialization ---
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

// --- Helper Functions ---

/**
 * Converts a File object to a Gemini GenerativePart.
 * @param file The file to convert.
 * @returns A promise that resolves to a GenerativePart object.
 */
async function fileToGenerativePart(
  file: File,
): Promise<{ inlineData: { data: string; mimeType: string } }> {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

/**
 * Validates the current state and updates the Generate button's disabled status.
 */
function validateState() {
  const isAnyStyleSelected =
    selectedHairstyle !== '' ||
    selectedHairColor !== '' ||
    selectedOutfit !== '' ||
    selectedBackground !== '';
  const isReady = baseImageFile !== null && isAnyStyleSelected;
  generateBtn.disabled = !isReady || isLoading;
}

/**
 * Updates the UI based on the current undo/redo history.
 */
function updateUndoRedoState() {
  if (history.length > 0) {
    outputActions.classList.remove('hidden');
  } else {
    outputActions.classList.add('hidden');
  }
  undoBtn.disabled = historyIndex <= 0;
  redoBtn.disabled = historyIndex >= history.length - 1;
}

/**
 * Updates the UI based on the current loading state.
 */
function updateLoadingState() {
  if (isLoading) {
    loadingSpinner.classList.remove('hidden');
    outputPlaceholder.classList.add('hidden');
    comparisonContainer.classList.add('hidden');
    outputActions.classList.add('hidden');
    generateBtn.disabled = true;
    generateBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Applying...`;
  } else {
    loadingSpinner.classList.add('hidden');
    validateState(); // Re-validate state to set button status
    generateBtn.innerHTML = `<i class="fa-solid fa-lightbulb"></i> Apply Style`;
    if (history.length > 0) {
      comparisonContainer.classList.remove('hidden');
    }
    updateUndoRedoState();
  }
}

// --- UI Functions ---

/**
 * Populates the dropdown menus with style options.
 */
function populateDropdowns() {
  // Hairstyle Dropdown
  const hairstylePlaceholder = document.createElement('option');
  hairstylePlaceholder.value = '';
  hairstylePlaceholder.textContent = 'Select Hairstyle';
  hairstylePlaceholder.disabled = true;
  hairstylePlaceholder.selected = true;
  hairstyleSelect.appendChild(hairstylePlaceholder);

  HAIRSTYLE_EXAMPLES.forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    hairstyleSelect.appendChild(option);
  });

  // Hair Color Dropdown
  const hairColorPlaceholder = document.createElement('option');
  hairColorPlaceholder.value = '';
  hairColorPlaceholder.textContent = 'Select Hair Color';
  hairColorPlaceholder.disabled = true;
  hairColorPlaceholder.selected = true;
  hairColorSelect.appendChild(hairColorPlaceholder);

  HAIR_COLOR_EXAMPLES.forEach((color) => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    hairColorSelect.appendChild(option);
  });

  // Outfit Dropdown
  const outfitPlaceholder = document.createElement('option');
  outfitPlaceholder.value = '';
  outfitPlaceholder.textContent = 'Select Outfit Style';
  outfitPlaceholder.disabled = true;
  outfitPlaceholder.selected = true;
  outfitSelect.appendChild(outfitPlaceholder);

  OUTFIT_EXAMPLES.forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    outfitSelect.appendChild(option);
  });

  // Background Dropdown
  const backgroundPlaceholder = document.createElement('option');
  backgroundPlaceholder.value = '';
  backgroundPlaceholder.textContent = 'Select Background';
  backgroundPlaceholder.disabled = true;
  backgroundPlaceholder.selected = true;
  backgroundSelect.appendChild(backgroundPlaceholder);

  BACKGROUND_EXAMPLES.forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    backgroundSelect.appendChild(option);
  });
}

// --- Core Functions ---

/**
 * Handles the file selection for the base image.
 * @param file The selected file.
 */
function handleBaseImageUpload(file: File) {
  baseImageFile = file;
  baseImagePreview.src = URL.createObjectURL(file);
  uploadPrompt.classList.add('hidden');
  baseImagePreview.classList.remove('hidden');
  validateState();
}

/**
 * Resets the application to its initial state.
 */
function resetApp() {
  baseImageFile = null;
  generatedImageUrl = null;
  history = [];
  historyIndex = -1;

  baseImageInput.value = '';
  baseImagePreview.src = '';
  uploadPrompt.classList.remove('hidden');
  baseImagePreview.classList.add('hidden');

  comparisonContainer.classList.add('hidden');
  comparisonBefore.src = '';
  comparisonAfter.src = '';

  outputPlaceholder.classList.remove('hidden');
  outputActions.classList.add('hidden');

  hairstyleSelect.selectedIndex = 0;
  hairColorSelect.selectedIndex = 0;
  outfitSelect.selectedIndex = 0;
  backgroundSelect.selectedIndex = 0;
  selectedHairstyle = '';
  selectedHairColor = '';
  selectedOutfit = '';
  selectedBackground = '';

  validateState();
  updateUndoRedoState();
}

/**
 * Triggers the download of the generated image.
 */
function downloadImage() {
  if (!generatedImageUrl) return;
  const a = document.createElement('a');
  a.href = generatedImageUrl;
  a.download = 'stylemirror-image.png';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Handles the Undo action.
 */
function handleUndo() {
  if (historyIndex > 0) {
    historyIndex--;
    generatedImageUrl = history[historyIndex];
    comparisonAfter.src = generatedImageUrl;
    updateUndoRedoState();
  }
}

/**
 * Handles the Redo action.
 */
function handleRedo() {
  if (historyIndex < history.length - 1) {
    historyIndex++;
    generatedImageUrl = history[historyIndex];
    comparisonAfter.src = generatedImageUrl;
    updateUndoRedoState();
  }
}

/**
 * Main function to generate the image using the Gemini API.
 */
async function generateImage() {
  const isAnyStyleSelected =
    selectedHairstyle ||
    selectedHairColor ||
    selectedOutfit ||
    selectedBackground;

  if (!baseImageFile || isLoading || !isAnyStyleSelected) {
    return;
  }

  isLoading = true;
  updateLoadingState();

  try {
    let textPrompt = `You are an expert photo editor. Edit the provided photo of a person.`;
    const edits = [];
    if (selectedHairstyle) {
      edits.push(`Change their hairstyle to: "${selectedHairstyle}".`);
    }
    if (selectedHairColor) {
      edits.push(`Change their hair color to: "${selectedHairColor}".`);
    }
    if (selectedOutfit) {
      edits.push(`Change their outfit to: "${selectedOutfit}".`);
    }
    if (selectedBackground) {
      edits.push(`Change the background to: "${selectedBackground}".`);
    }

    if (edits.length > 0) {
      textPrompt += '\n' + edits.join('\n');
    }

    textPrompt += `\n\nCRITICAL INSTRUCTION: You MUST preserve the person's identity.
      - DO NOT change their face shape.
      - DO NOT change their facial features (eyes, nose, mouth).
      - DO NOT change their skin tone or age.
      - DO NOT change their expression or any makeup.
      - DO NOT change the lighting on their face.
      - ONLY modify the items requested. If an item (hair, clothing, background) is not mentioned in the edits above, you MUST leave it completely unchanged from the original photo.`;

    const contentParts: Part[] = [];

    // Add base image
    const baseImagePart = await fileToGenerativePart(baseImageFile);
    contentParts.push(baseImagePart);
    contentParts.push({ text: textPrompt });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: contentParts },
      config: {
        responseModalities: [Modality.IMAGE, Modality.TEXT],
      },
    });

    // Find and display the generated image
    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (part) => part.inlineData,
    )?.inlineData;

    if (imagePart && baseImageFile) {
      generatedImageUrl = `data:${imagePart.mimeType};base64,${imagePart.data}`;

      // Clear "redo" history if we're generating a new image after an undo
      if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
      }
      history.push(generatedImageUrl);
      historyIndex = history.length - 1;

      // Setup the comparison view
      comparisonBefore.src = URL.createObjectURL(baseImageFile);
      comparisonAfter.src = generatedImageUrl;

      // Reset slider to show the "after" image fully
      const initialPosition = 100;
      comparisonSlider.style.left = `${initialPosition}%`;
      comparisonAfterWrapper.style.clipPath = `polygon(0 0, ${initialPosition}% 0, ${initialPosition}% 100%, 0 100%)`;

      comparisonContainer.classList.remove('hidden');
      outputPlaceholder.classList.add('hidden');
      updateUndoRedoState();
    } else {
      throw new Error('No image was generated. Please try again.');
    }
  } catch (error) {
    console.error(error);
    alert(
      `An error occurred: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    if (history.length === 0) {
      outputPlaceholder.classList.remove('hidden');
    }
  } finally {
    isLoading = false;
    updateLoadingState();
  }
}

/**
 * Initializes the comparison slider functionality.
 */
function initComparisonSlider() {
  let isDragging = false;

  const startDrag = (e: MouseEvent | TouchEvent) => {
    isDragging = true;
    document.body.classList.add('dragging');
    if (e.type === 'touchstart') e.preventDefault();
  };

  const stopDrag = () => {
    isDragging = false;
    document.body.classList.remove('dragging');
  };

  const onDrag = (e: MouseEvent | TouchEvent) => {
    if (!isDragging) return;

    const containerRect = comparisonContainer.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    let position = ((clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp position between 0 and 100
    position = Math.max(0, Math.min(100, position));

    comparisonSlider.style.left = `${position}%`;
    comparisonAfterWrapper.style.clipPath = `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`;
  };

  comparisonSlider.addEventListener('mousedown', startDrag);
  comparisonSlider.addEventListener('touchstart', startDrag, {
    passive: false,
  });

  document.addEventListener('mouseup', stopDrag);
  document.addEventListener('touchend', stopDrag);

  document.addEventListener('mousemove', onDrag);
  document.addEventListener('touchmove', onDrag);
}

/**
 * Initializes the application.
 */
function initializeApp() {
  populateDropdowns();
  initComparisonSlider();

  // --- Event Listeners ---
  uploadBtn.addEventListener('click', () => baseImageInput.click());
  baseImageInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleBaseImageUpload(file);
  });

  hairstyleSelect.addEventListener('change', (e) => {
    selectedHairstyle = (e.target as HTMLSelectElement).value;
    validateState();
  });

  hairColorSelect.addEventListener('change', (e) => {
    selectedHairColor = (e.target as HTMLSelectElement).value;
    validateState();
  });

  outfitSelect.addEventListener('change', (e) => {
    selectedOutfit = (e.target as HTMLSelectElement).value;
    validateState();
  });

  backgroundSelect.addEventListener('change', (e) => {
    selectedBackground = (e.target as HTMLSelectElement).value;
    validateState();
  });

  generateBtn.addEventListener('click', generateImage);
  resetBtn.addEventListener('click', resetApp);
  downloadBtn.addEventListener('click', downloadImage);
  undoBtn.addEventListener('click', handleUndo);
  redoBtn.addEventListener('click', handleRedo);

  // Initial validation check
  validateState();
  updateUndoRedoState();
}

// --- App Start ---
initializeApp();
