// 字體清單配置
const availableFonts = [
  { id: 1, name: '粉圓體全繁體', filename: '粉圓體全繁體.ttf' },
  { id: 2, name: '粒線體不等寬全繁體', filename: '粒線體不等寬全繁體.ttf' },
  { id: 3, name: '粒線體等寬全繁體', filename: '粒線體等寬全繁體.ttf' },
  { id: 4, name: '粗線體不等寬版', filename: '粗線體不等寬版 全繁體.ttf' },
  { id: 5, name: '粗線體等寬版', filename: '粗線體等寬版 全繁體.ttf' },
  { id: 6, name: '胖西手寫體', filename: '胖西手寫體 全繁體.ttf' },
  { id: 7, name: '辰宇落雁體不等寬版', filename: '辰宇落雁體 不等寬版全繁體.ttf' }
];

// GitHub repository configuration
const GITHUB_RAW_URL = 'https://raw.githubusercontent.com/DK0124/font-preview-system/main/fonts/';

// DOM Elements
const previewText = document.getElementById('previewText');
const fontGrid = document.getElementById('fontGrid');
const generateButton = document.getElementById('generateButton');
const loadingOverlay = document.getElementById('loadingOverlay');
const selectedFontName = document.getElementById('selectedFontName');
const selectionBar = document.getElementById('selectionBar');
const selectBtn = document.getElementById('selectBtn');
const cancelBtn = document.getElementById('cancelBtn');
const scrollTopBtn = document.getElementById('scrollTopBtn');
const colorOptions = document.querySelectorAll('.color-option');

// State
let selectedFontId = null;
let currentColor = '#333333';
let loadedFonts = {};
let generateTimeout = null;

// Initialize
function init() {
  setupEventListeners();
  
  // Scroll event
  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      scrollTopBtn.classList.add('visible');
    } else {
      scrollTopBtn.classList.remove('visible');
    }
  });
}

// Setup event listeners
function setupEventListeners() {
  // Generate preview button
  generateButton.addEventListener('click', generatePreviews);
  
  // Color selection
  colorOptions.forEach(option => {
    option.addEventListener('click', () => {
      colorOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      currentColor = option.getAttribute('data-color');
      
      // Regenerate if previews exist
      if (fontGrid.querySelectorAll('.font-card').length > 0) {
        generatePreviews();
      }
    });
  });
  
  // Select font button
  selectBtn.addEventListener('click', () => {
    if (selectedFontId) {
      const selectedFont = availableFonts.find(font => font.id === selectedFontId);
      if (selectedFont) {
        // 這裡可以加入您的選擇邏輯
        console.log(`已選擇字體: ${selectedFont.name}`);
        alert(`已選擇字體: ${selectedFont.name}`);
      }
    }
  });
  
  // Cancel button
  cancelBtn.addEventListener('click', () => {
    selectedFontId = null;
    selectedFontName.textContent = '尚未選擇';
    selectionBar.classList.remove('visible');
    
    document.querySelectorAll('.font-card').forEach(card => {
      card.classList.remove('selected');
    });
  });
  
  // Scroll to top button
  scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  // Preview text input with debounce
  previewText.addEventListener('input', () => {
    if (fontGrid.querySelectorAll('.font-card').length > 0) {
      clearTimeout(generateTimeout);
      generateTimeout = setTimeout(() => {
        generatePreviews();
      }, 500);
    }
  });
}

// Load font
async function loadFont(fontData) {
  if (loadedFonts[fontData.id]) {
    return loadedFonts[fontData.id];
  }
  
  try {
    const fontUrl = GITHUB_RAW_URL + encodeURIComponent(fontData.filename);
    const fontFace = new FontFace(
      `CustomFont${fontData.id}`, 
      `url(${fontUrl})`
    );
    
    await fontFace.load();
    document.fonts.add(fontFace);
    loadedFonts[fontData.id] = fontFace;
    
    return fontFace;
  } catch (error) {
    console.error(`Failed to load font ${fontData.name}:`, error);
    return null;
  }
}

// Create preview canvas
function createPreviewCanvas(text, fontData, color) {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  // Set canvas size
  canvas.width = 400;
  canvas.height = 100;
  
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Set font and style
  ctx.font = `40px CustomFont${fontData.id}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Draw text
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  return canvas;
}

// Generate font previews
async function generatePreviews() {
  loadingOverlay.style.display = 'flex';
  
  const text = previewText.value || '字體預覽測試';
  fontGrid.innerHTML = '';
  
  for (const font of availableFonts) {
    const card = document.createElement('div');
    card.className = 'font-card';
    card.setAttribute('data-id', font.id);
    
    if (selectedFontId === font.id) {
      card.classList.add('selected');
    }
    
    card.innerHTML = `
      <div class="checkmark">✓</div>
      <div class="font-preview">
        <div class="font-loading">載入中...</div>
      </div>
      <div class="font-name">${font.name}</div>
    `;
    
    // Add click event
    card.addEventListener('click', () => {
      document.querySelectorAll('.font-card').forEach(c => {
        c.classList.remove('selected');
      });
      
      card.classList.add('selected');
      selectedFontId = font.id;
      selectedFontName.textContent = font.name;
      selectionBar.classList.add('visible');
    });
    
    fontGrid.appendChild(card);
    
    // Load font and create preview asynchronously
    loadFont(font).then(() => {
      const previewDiv = card.querySelector('.font-preview');
      previewDiv.innerHTML = '';
      
      const canvas = createPreviewCanvas(text, font, currentColor);
      previewDiv.appendChild(canvas);
    }).catch(error => {
      const previewDiv = card.querySelector('.font-preview');
      previewDiv.innerHTML = '<div class="font-loading">載入失敗</div>';
    });
  }
  
  loadingOverlay.style.display = 'none';
}

// Initialize the page
init();
