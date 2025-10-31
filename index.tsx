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
  'Short Crew Cut',
  'Side Part',
  'Undercut',
  'Fade with Textured Top',
  'Man Bun',
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
  'Stylish Modern Suits',
  'Bold Business Outfit',
  'Creative Corporate Wears',
  'Formal Office Dress',
  'Smart Casual (Blazer + Pants)',
  'Chic Blouse + Trousers',
  'Modern Jumpsuit',
  'Classic Trench Coat',
  'Casual T-Shirt & Jeans',
  'Evening Gown',
  'Elegant Dinner Gown',
  'Leather Jacket',
  'Summer Dress',
  'Cozy Sweater',
  'Cocktail Dress',
  'Trendy Party Dress',
  'Sequin Party Dress',
  'Streetwear (Hoodie + Joggers)',
  'African Print Dress',
  'Denim Jacket + Skirt',
  'Winter Coat + Scarf',
  'Maxi Dress',
  'Classic Tuxedo',
  "Men's Three-Piece Suit",
  'Business Casual (Polo + Chinos)',
];

const OUTFIT_COLOR_PALETTE = [
  'Red',
  'Blue',
  'Green',
  'Yellow',
  'Black',
  'White',
  'Pink',
  'Purple',
  'Orange',
  'Gray',
  'Brown',
  'Beige',
];

const SHOE_EXAMPLES = [
  'High Heels',
  'Stilettos',
  'Wedges',
  'Ankle Boots',
  'Knee-High Boots',
  'Platform Shoes',
  'Ballet Flats',
  'Sneakers (Athletic)',
  'Sneakers (Fashion)',
  'Sandals (Flat)',
  'Sandals (Heeled)',
  'Loafers',
  'Oxfords',
  'Brogues',
  "Dress Shoes (Men's)",
  'Combat Boots',
  'Flip-Flops',
  'Espadrilles',
  'Mules',
];

const BACKGROUND_EXAMPLES = [
  'Studio Plain',
  'Minimalist Studio (White)',
  'Neutral Gray Wall',
  'Subtle Textured Wall',
  'Modern Office Interior',
  'Corporate Lobby',
  'Outdoor City',
  'Beach',
  'Forest',
  'Abstract Gradient',
  'Neon Cyberpunk Cityscape',
  'Enchanted Forest at Twilight',
  'Vintage Film Set',
  'Grand Library Interior',
  'Art Deco Speakeasy',
  'Bohemian Chic room with plants',
  'Futuristic Spaceship Bridge',
  'Dramatic Mountain Peak',
  'Cozy Coffee Shop',
  'Graffiti Wall in an Urban Alley',
];

const PHOTOSHOOT_STYLE_EXAMPLES = [
  'Professional Headshot',
  'Fantasy Cosplay',
  'Golden Hour Portrait',
  'Film Noir (Black & White)',
  'High-Fashion Magazine Cover',
  'Vibrant Street Style',
  'Surrealist Art Piece',
  'Vintage Sepia Tone',
];

const MATERNITY_STYLE_EXAMPLES = [
  'Classic Elegant Gown',
  'Newspaper Announcement (Baby Coming Soon)',
  'Studio with "BABY" Light-Up Letters',
  'Festive Holiday / Christmas Theme',
  'Artistic Giant White Flower Backdrop',
  'Elegant Gown with "MOM" Letters',
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

const referenceImageInput = document.getElementById(
  'reference-image-upload',
) as HTMLInputElement;
const referenceUploadBtn = document.getElementById(
  'reference-upload-btn',
) as HTMLButtonElement;
const referenceUploadPrompt = document.getElementById(
  'reference-upload-prompt',
) as HTMLDivElement;
const referenceImageContainer = document.getElementById(
  'reference-image-container',
) as HTMLDivElement;
const referenceImagePreview = document.getElementById(
  'reference-image-preview',
) as HTMLImageElement;
const removeReferenceBtn = document.getElementById(
  'remove-reference-btn',
) as HTMLButtonElement;

const hairstyleSelect = document.getElementById(
  'hairstyle-select',
) as HTMLSelectElement;
const hairColorSelect = document.getElementById(
  'hair-color-select',
) as HTMLSelectElement;
const outfitSelect = document.getElementById(
  'outfit-select',
) as HTMLSelectElement;
const outfitColorInput = document.getElementById(
  'outfit-color-input',
) as HTMLInputElement;
const outfitColorPalette = document.getElementById(
  'outfit-color-palette',
) as HTMLDivElement;
const shoeSelect = document.getElementById('shoe-select') as HTMLSelectElement;
const backgroundSelect = document.getElementById(
  'background-select',
) as HTMLSelectElement;
const photoshootStyleSelect = document.getElementById(
  'photoshoot-style-select',
) as HTMLSelectElement;
const maternityCheckbox = document.getElementById(
  'maternity-checkbox',
) as HTMLInputElement;
const maternityOptionsContainer = document.getElementById(
  'maternity-options-container',
) as HTMLDivElement;
const maternityStyleSelect = document.getElementById(
  'maternity-style-select',
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
let referenceImageFile: File | null = null;
let generatedImageUrl: string | null = null;
let isLoading = false;
let selectedHairstyle = '';
let selectedHairColor = '';
let selectedOutfit = '';
let selectedOutfitColor = '';
let selectedShoes = '';
let selectedBackground = '';
let selectedPhotoshootStyle = '';
let isMaternityStyle = false;
let selectedMaternityStyle = '';
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
    referenceImageFile !== null ||
    selectedHairstyle !== '' ||
    selectedHairColor !== '' ||
    selectedOutfit !== '' ||
    selectedOutfitColor !== '' ||
    selectedShoes !== '' ||
    selectedBackground !== '' ||
    selectedPhotoshootStyle !== '' ||
    selectedMaternityStyle !== '';
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
 * Populates the color palette with clickable swatches.
 */
function populateColorPalette() {
  OUTFIT_COLOR_PALETTE.forEach((color) => {
    const swatch = document.createElement('div');
    swatch.classList.add('color-swatch');
    swatch.style.backgroundColor = color;
    swatch.dataset.color = color;
    swatch.title = color;

    swatch.addEventListener('click', () => {
      // Deselect any other swatch
      const currentlySelected = document.querySelector('.color-swatch.selected');
      if (currentlySelected) {
        currentlySelected.classList.remove('selected');
      }

      // Select the new one
      swatch.classList.add('selected');

      // Update state and input field
      selectedOutfitColor = color;
      outfitColorInput.value = color;
      validateState();
    });

    outfitColorPalette.appendChild(swatch);
  });
}

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

  OUTFIT_EXAMPLES.sort().forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    outfitSelect.appendChild(option);
  });

  // Shoe Dropdown
  const shoePlaceholder = document.createElement('option');
  shoePlaceholder.value = '';
  shoePlaceholder.textContent = 'Select Shoes';
  shoePlaceholder.disabled = true;
  shoePlaceholder.selected = true;
  shoeSelect.appendChild(shoePlaceholder);

  SHOE_EXAMPLES.sort().forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    shoeSelect.appendChild(option);
  });

  // Background Dropdown
  const backgroundPlaceholder = document.createElement('option');
  backgroundPlaceholder.value = '';
  backgroundPlaceholder.textContent = 'Select Background';
  backgroundPlaceholder.disabled = true;
  backgroundPlaceholder.selected = true;
  backgroundSelect.appendChild(backgroundPlaceholder);

  BACKGROUND_EXAMPLES.sort().forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    backgroundSelect.appendChild(option);
  });

  // Photoshoot Style Dropdown
  const photoshootStylePlaceholder = document.createElement('option');
  photoshootStylePlaceholder.value = '';
  photoshootStylePlaceholder.textContent = 'Select Photoshoot Style';
  photoshootStylePlaceholder.disabled = true;
  photoshootStylePlaceholder.selected = true;
  photoshootStyleSelect.appendChild(photoshootStylePlaceholder);

  PHOTOSHOOT_STYLE_EXAMPLES.forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    photoshootStyleSelect.appendChild(option);
  });

  // Maternity Style Dropdown
  const maternityStylePlaceholder = document.createElement('option');
  maternityStylePlaceholder.value = '';
  maternityStylePlaceholder.textContent = 'Select Maternity Style';
  maternityStylePlaceholder.disabled = true;
  maternityStylePlaceholder.selected = true;
  maternityStyleSelect.appendChild(maternityStylePlaceholder);

  MATERNITY_STYLE_EXAMPLES.forEach((style) => {
    const option = document.createElement('option');
    option.value = style;
    option.textContent = style;
    maternityStyleSelect.appendChild(option);
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
 * Handles the file selection for the reference image.
 * @param file The selected file.
 */
function handleReferenceImageUpload(file: File) {
  referenceImageFile = file;
  referenceImagePreview.src = URL.createObjectURL(file);
  referenceUploadPrompt.classList.add('hidden');
  referenceImageContainer.classList.remove('hidden');
  validateState();
}

/**
 * Handles the removal of the reference image.
 */
function handleRemoveReferenceImage() {
  referenceImageFile = null;
  referenceImageInput.value = '';
  referenceImagePreview.src = '';
  referenceUploadPrompt.classList.remove('hidden');
  referenceImageContainer.classList.add('hidden');
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

  handleRemoveReferenceImage();

  comparisonContainer.classList.add('hidden');
  comparisonBefore.src = '';
  comparisonAfter.src = '';

  outputPlaceholder.classList.remove('hidden');
  outputActions.classList.add('hidden');

  hairstyleSelect.selectedIndex = 0;
  hairColorSelect.selectedIndex = 0;
  outfitSelect.selectedIndex = 0;
  outfitColorInput.value = '';
  document
    .querySelector('.color-swatch.selected')
    ?.classList.remove('selected');
  shoeSelect.selectedIndex = 0;
  backgroundSelect.selectedIndex = 0;
  photoshootStyleSelect.selectedIndex = 0;
  maternityCheckbox.checked = false;
  maternityStyleSelect.selectedIndex = 0;
  maternityOptionsContainer.classList.add('hidden');

  selectedHairstyle = '';
  selectedHairColor = '';
  selectedOutfit = '';
  selectedOutfitColor = '';
  selectedShoes = '';
  selectedBackground = '';
  selectedPhotoshootStyle = '';
  isMaternityStyle = false;
  selectedMaternityStyle = '';

  validateState();
  updateUndoRedoState();
}

/**
 * Triggers the download of the generated image. This method is more robust
 * and works better on mobile devices by converting the data URL to a Blob.
 */
async function downloadImage() {
  if (!generatedImageUrl) return;

  try {
    // Convert data URL to blob for better cross-browser support
    const response = await fetch(generatedImageUrl);
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'stylemirror-image.png';
    document.body.appendChild(a);
    a.click();

    // Cleanup
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Download failed:', error);
    alert(
      'Could not download the image. Please try long-pressing the image and selecting "Save Image".',
    );
  }
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
    referenceImageFile ||
    selectedHairstyle ||
    selectedHairColor ||
    selectedOutfit ||
    selectedOutfitColor ||
    selectedShoes ||
    selectedBackground ||
    selectedPhotoshootStyle ||
    selectedMaternityStyle;

  if (!baseImageFile || isLoading || !isAnyStyleSelected) {
    return;
  }

  isLoading = true;
  updateLoadingState();

  try {
    const contentParts: Part[] = [];
    const edits: string[] = [];

    let textPrompt = `You are a world-class photo editor. Your task is to perform a sophisticated style transfer. You will be given one or two images.

**Image Roles:**
- The FIRST image provided is the **PHOTO TO EDIT**. This contains the person whose appearance you will modify.
- The SECOND image (if provided) is the **STYLE REFERENCE**. This image is for inspiration only.

**Your Goal:**
Apply the style from the **STYLE REFERENCE** image to the **PHOTO TO EDIT**. This includes elements like clothing style, color palette, lighting, background, and overall mood. If no style reference is given, use the specific text instructions below.

**CRITICAL RULES - IDENTITY PRESERVATION:**
- **DO NOT CHANGE THE PERSON'S FACE.** The face shape, facial features (eyes, nose, mouth), skin tone, and identity of the person in the **PHOTO TO EDIT** must be perfectly preserved.
- **DO NOT MERGE THE IMAGES.** The final output should not be a collage or combination of the two source images.
- **DO NOT COPY THE PERSON from the STYLE REFERENCE.** The output must only feature the person from the **PHOTO TO EDIT**.
- Unless a maternity style is requested, do not alter the person's body shape or size.
- Maintain the original photo's realism and the person's pose. The edits should blend seamlessly.
- ONLY modify the items explicitly requested. If an item (hair, clothing, background) is not mentioned, leave it unchanged.

**SPECIFIC EDITS TO PERFORM:**
`;

    if (referenceImageFile) {
      edits.push(
        `Use the provided STYLE REFERENCE image as the primary guide for the overall aesthetic (clothing, colors, mood, lighting, composition).`,
      );
    }

    if (isMaternityStyle && selectedMaternityStyle) {
      edits.push(
        `Transform this into a maternity photoshoot. Add a realistic and natural-looking baby bump to the person.`,
      );
      edits.push(
        `The specific maternity style is: "${selectedMaternityStyle}".`,
      );
    } else if (selectedPhotoshootStyle) {
      edits.push(
        `Overall photoshoot style should be: "${selectedPhotoshootStyle}".`,
      );
    }

    if (selectedHairstyle) {
      edits.push(`Change hairstyle to: "${selectedHairstyle}".`);
    }
    if (selectedHairColor) {
      edits.push(`Change hair color to: "${selectedHairColor}".`);
    }
    if (selectedOutfit) {
      edits.push(`Change outfit to: "${selectedOutfit}".`);
    }
    if (selectedOutfitColor) {
      edits.push(
        `Change the color of their outfit as described: "${selectedOutfitColor}". Important: Only change the color, not the style of the clothing unless a new style is also specified.`,
      );
    }
    if (selectedShoes) {
      edits.push(`Change shoes to: "${selectedShoes}".`);
    }
    if (selectedBackground) {
      edits.push(`Change background to: "${selectedBackground}".`);
    }

    if (edits.length > 0) {
      textPrompt += edits.map((edit) => `- ${edit}`).join('\n');
    } else {
      textPrompt +=
        '- No specific text edits requested. Rely on the style reference image if provided.';
    }

    textPrompt += `\n\nProduce a single, photorealistic final image.`;

    // 1. Add the comprehensive text prompt first.
    contentParts.push({ text: textPrompt });

    // 2. Add the base image (PHOTO TO EDIT).
    const baseImagePart = await fileToGenerativePart(baseImageFile);
    contentParts.push(baseImagePart);

    // 3. Add the reference image if it exists (STYLE REFERENCE).
    if (referenceImageFile) {
      const referenceImagePart = await fileToGenerativePart(referenceImageFile);
      contentParts.push(referenceImagePart);
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: contentParts },
      config: {
        responseModalities: [Modality.IMAGE],
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
      const textResponse = response.text?.trim();
      if (textResponse) {
        throw new Error(
          `Image generation failed. The model responded: "${textResponse}"`,
        );
      } else {
        throw new Error(
          'No image was generated and no error message was provided. Please check the model configuration and try again.',
        );
      }
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
  populateColorPalette();
  initComparisonSlider();

  // --- Event Listeners ---
  uploadBtn.addEventListener('click', () => baseImageInput.click());
  baseImageInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleBaseImageUpload(file);
  });

  referenceUploadBtn.addEventListener('click', () =>
    referenceImageInput.click(),
  );
  referenceImageInput.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) handleReferenceImageUpload(file);
  });
  removeReferenceBtn.addEventListener('click', handleRemoveReferenceImage);

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

  outfitColorInput.addEventListener('input', (e) => {
    selectedOutfitColor = (e.target as HTMLInputElement).value.trim();
    // Deselect any swatch if the user types manually
    const currentlySelected = document.querySelector('.color-swatch.selected');
    if (currentlySelected) {
      currentlySelected.classList.remove('selected');
    }
    validateState();
  });

  shoeSelect.addEventListener('change', (e) => {
    selectedShoes = (e.target as HTMLSelectElement).value;
    validateState();
  });

  backgroundSelect.addEventListener('change', (e) => {
    selectedBackground = (e.target as HTMLSelectElement).value;
    validateState();
  });

  photoshootStyleSelect.addEventListener('change', (e) => {
    selectedPhotoshootStyle = (e.target as HTMLSelectElement).value;
    // Make styles mutually exclusive
    if (selectedPhotoshootStyle) {
      maternityCheckbox.checked = false;
      isMaternityStyle = false;
      selectedMaternityStyle = '';
      maternityStyleSelect.selectedIndex = 0;
      maternityOptionsContainer.classList.add('hidden');
    }
    validateState();
  });

  maternityCheckbox.addEventListener('change', (e) => {
    isMaternityStyle = (e.target as HTMLInputElement).checked;
    if (isMaternityStyle) {
      maternityOptionsContainer.classList.remove('hidden');
      // Make styles mutually exclusive
      photoshootStyleSelect.selectedIndex = 0;
      selectedPhotoshootStyle = '';
    } else {
      maternityOptionsContainer.classList.add('hidden');
      maternityStyleSelect.selectedIndex = 0;
      selectedMaternityStyle = '';
    }
    validateState();
  });

  maternityStyleSelect.addEventListener('change', (e) => {
    selectedMaternityStyle = (e.target as HTMLSelectElement).value;
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
