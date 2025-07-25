/*!
 * Font Preview Widget v1.0.2
 * (c) 2025 DK0124
 * Released under the MIT License.
 * 
 * 修改說明：
 * 1. 移除了原始程式碼中不相關的部分
 * 2. 保留了字體預覽的核心功能
 * 3. 適配為可嵌入的widget形式
 */

(function() {
  // 避免全域變數污染，創建獨立的命名空間
  const FontPreviewWidget = {
    // 配置選項
    config: {
      apiUrl: 'https://www.ctmfont.com/generatefont',
      containerSelector: '#fontPreviewWidget',
      csrfToken: null
    },
    
    // 當前狀態
    state: {
      selectedFontId: null,
      selectedFontName: null,
      currentColor: '#333333',
      previewTimeout: null,
      fontsData: []
    },
    
    // 初始化widget
    init: function(options = {}) {
      // 合併配置
      this.config = Object.assign(this.config, options);
      
      // 確保jQuery已載入
      if (typeof jQuery === 'undefined') {
        console.error('Font Preview Widget: jQuery is required');
        this.loadjQuery(() => this.initWidget());
        return;
      }
      
      this.initWidget();
    },
    
    // 動態載入jQuery（如果需要）
    loadjQuery: function(callback) {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.7.1.min.js';
      script.onload = callback;
      document.head.appendChild(script);
    },
    
    // 初始化Widget內容
    initWidget: function() {
      const $ = jQuery;
      const container = $(this.config.containerSelector);
      
      if (container.length === 0) {
        console.error('Font Preview Widget: Container not found');
        return;
      }
      
      // 注入HTML結構
      container.html(this.getTemplate());
      
      // 注入CSS
      this.injectStyles();
      
      // 設置事件監聽器
      this.setupEventListeners();
    },
    
    // 獲取HTML模板
    getTemplate: function() {
      return `
        <div class="fpw-container">
          <div class="fpw-preview-card">
            <div class="fpw-preview-header">
              <div class="fpw-preview-title">漢字字體預覽</div>
            </div>
            
            <input type="text" class="fpw-preview-input" id="fpwPreviewText" 
              placeholder="輸入文字預覽字體效果..." value="漢字字體預覽">
            
            <div class="fpw-color-section">
              <div class="fpw-color-title">文字顏色:</div>
              <div class="fpw-color-options">
                <div class="fpw-color-option active" data-color="#333333" style="background-color: #333333;"></div>
                <div class="fpw-color-option" data-color="#FF0000" style="background-color: #FF0000;"></div>
                <div class="fpw-color-option" data-color="#0000FF" style="background-color: #0000FF;"></div>
                <div class="fpw-color-option" data-color="#008000" style="background-color: #008000;"></div>
                <div class="fpw-color-option" data-color="#FFA500" style="background-color: #FFA500;"></div>
                <div class="fpw-color-option" data-color="#800080" style="background-color: #800080;"></div>
              </div>
            </div>
            
            <button class="fpw-preview-button" id="fpwGenerateButton">
              生成所有字體預覽
            </button>
          </div>
          
          <div class="fpw-fonts-container">
            <div class="fpw-font-grid" id="fpwFontGrid">
              <div class="fpw-empty-state">點擊上方按鈕生成字體預覽</div>
            </div>
          </div>
          
          <div class="fpw-fixed-selection" id="fpwSelectionBar">
            <div class="fpw-selected-info" id="fpwSelectedFontName">尚未選擇</div>
            <div class="fpw-selection-actions">
              <button class="fpw-btn fpw-btn-cancel" id="fpwCancelBtn">取消</button>
              <button class="fpw-btn fpw-btn-select" id="fpwSelectBtn">選擇</button>
            </div>
          </div>
          
          <div class="fpw-loading-overlay" id="fpwLoadingOverlay">
            <div class="fpw-loading-spinner"></div>
            <div>正在生成字體預覽...</div>
          </div>
        </div>
      `;
    },
    
    // 注入CSS樣式
    injectStyles: function() {
      const styleId = 'font-preview-widget-styles';
      
      // 如果樣式已存在，不重複注入
      if (document.getElementById(styleId)) return;
      
      const styles = `
        <style id="${styleId}">
          .fpw-container {
            width: 100%;
            background-color: #F6F9F6;
            padding: 20px;
            box-sizing: border-box;
            font-family: 'Microsoft JhengHei', sans-serif;
            position: relative;
          }
          
          .fpw-container * {
            box-sizing: border-box;
          }
          
          .fpw-preview-card {
            background-color: white;
            border-radius: 15px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
            padding: 20px;
            margin-bottom: 20px;
            max-width: 800px;
            margin-left: auto;
            margin-right: auto;
          }
          
          .fpw-preview-header {
            margin-bottom: 20px;
          }
          
          .fpw-preview-title {
            font-size: 18px;
            font-weight: bold;
          }
          
          .fpw-preview-input {
            width: 100%;
            padding: 12px;
            border: 2px solid #D4E8D1;
            border-radius: 8px;
            font-size: 16px;
            margin-bottom: 20px;
            transition: border-color 0.2s ease;
          }
          
          .fpw-preview-input:focus {
            outline: none;
            border-color: #B5D5B0;
          }
          
          .fpw-color-section {
            margin-bottom: 20px;
          }
          
          .fpw-color-title {
            font-size: 16px;
            margin-bottom: 10px;
          }
          
          .fpw-color-options {
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
          }
          
          .fpw-color-option {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 3px solid transparent;
          }
          
          .fpw-color-option:hover {
            transform: scale(1.1);
          }
          
          .fpw-color-option.active {
            border-color: #97BF90;
          }
          
          .fpw-preview-button {
            width: 100%;
            padding: 15px;
            background-color: #B5D5B0;
            border: none;
            border-radius: 8px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
          }
          
          .fpw-preview-button:hover {
            background-color: #97BF90;
          }
          
          .fpw-fonts-container {
            max-width: 800px;
            margin: 0 auto;
          }
          
          .fpw-font-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
            gap: 20px;
            margin-top: 20px;
          }
          
          .fpw-font-card {
            background-color: white;
            border-radius: 12px;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            transition: all 0.2s ease;
            cursor: pointer;
            position: relative;
          }
          
          .fpw-font-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
          }
          
          .fpw-font-card.selected {
            border: 3px solid #97BF90;
          }
          
          .fpw-font-preview {
            width: 100%;
            min-height: 140px;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-color: white;
          }
          
          .fpw-font-preview img {
            max-width: 100%;
            max-height: 120px;
            object-fit: contain;
          }
          
          .fpw-font-name {
            padding: 12px;
            text-align: center;
            font-size: 14px;
            border-top: 1px solid #D4E8D1;
            background-color: #F6F9F6;
          }
          
          .fpw-checkmark {
            position: absolute;
            top: 10px;
            right: 10px;
            width: 24px;
            height: 24px;
            background-color: #97BF90;
            border-radius: 50%;
            display: none;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
          }
          
          .fpw-font-card.selected .fpw-checkmark {
            display: flex;
          }
          
          .fpw-empty-state {
            grid-column: 1/-1;
            text-align: center;
            padding: 40px 0;
            color: #888;
            font-size: 14px;
          }
          
          .fpw-fixed-selection {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            background-color: white;
            padding: 15px 25px;
            border-radius: 30px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
            display: none;
            align-items: center;
            gap: 15px;
            z-index: 9999;
            min-width: 280px;
            justify-content: center;
          }
          
          .fpw-selected-info {
            font-size: 15px;
            font-weight: bold;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            max-width: 150px;
          }
          
          .fpw-selection-actions {
            display: flex;
            gap: 10px;
          }
          
          .fpw-btn {
            padding: 8px 16px;
            border-radius: 20px;
            border: none;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
          }
          
          .fpw-btn-cancel {
            background-color: #eee;
          }
          
          .fpw-btn-cancel:hover {
            background-color: #ddd;
          }
          
          .fpw-btn-select {
            background-color: #B5D5B0;
          }
          
          .fpw-btn-select:hover {
            background-color: #97BF90;
          }
          
          .fpw-loading-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(255, 255, 255, 0.8);
            display: none;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            z-index: 10000;
          }
          
          .fpw-loading-spinner {
            width: 50px;
            height: 50px;
            border: 5px solid #D4E8D1;
            border-top: 5px solid #97BF90;
            border-radius: 50%;
            animation: fpwSpin 1s linear infinite;
            margin-bottom: 20px;
          }
          
          @keyframes fpwSpin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @media (max-width: 600px) {
            .fpw-font-grid {
              grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
              gap: 15px;
            }
            
            .fpw-fixed-selection {
              bottom: 20px;
              padding: 12px 20px;
              min-width: 260px;
            }
          }
        </style>
      `;
      
      document.head.insertAdjacentHTML('beforeend', styles);
    },
    
    // 設置事件監聽器
    setupEventListeners: function() {
      const $ = jQuery;
      const self = this;
      
      // 生成預覽按鈕
      $(document).on('click', '#fpwGenerateButton', function() {
        self.generatePreviews();
      });
      
      // 顏色選擇
      $(document).on('click', '.fpw-color-option', function() {
        $('.fpw-color-option').removeClass('active');
        $(this).addClass('active');
        self.state.currentColor = $(this).data('color');
      });
      
      // 選擇字體按鈕
      $(document).on('click', '#fpwSelectBtn', function() {
        if (self.state.selectedFontId !== null && self.state.selectedFontName) {
          const selectedFont = {
            id: self.state.selectedFontId,
            name: self.state.selectedFontName
          };
          
          // 觸發自定義事件
          $(document).trigger('fontSelected', [selectedFont]);
          
          // 如果有回調函數
          if (window.onFontSelected) {
            window.onFontSelected(selectedFont);
          } else {
            alert(`已選擇字體: ${selectedFont.name}`);
          }
        }
      });
      
      // 取消按鈕
      $(document).on('click', '#fpwCancelBtn', function() {
        self.state.selectedFontId = null;
        self.state.selectedFontName = null;
        $('#fpwSelectedFontName').text('尚未選擇');
        $('#fpwSelectionBar').hide();
        $('.fpw-font-card').removeClass('selected');
      });
      
      // 預覽文字輸入 - 防抖處理
      $(document).on('input', '#fpwPreviewText', function() {
        if ($('.fpw-font-card').length > 0) {
          clearTimeout(self.state.previewTimeout);
          self.state.previewTimeout = setTimeout(function() {
            self.generatePreviews();
          }, 500);
        }
      });
    },
    
    // 生成字體預覽
    generatePreviews: function() {
      const $ = jQuery;
      const self = this;
      
      // 顯示載入中
      $('#fpwLoadingOverlay').css('display', 'flex');
      
      const text = $('#fpwPreviewText').val() || '漢字字體預覽';
      const color = self.state.currentColor || '#333333';
      
      // 清空字體網格
      $('#fpwFontGrid').html('');
      
      // 發送AJAX請求
      $.ajax({
        url: self.config.apiUrl,
        type: 'POST',
        data: {
          previewText: text,
          color: color
        },
        headers: {
          'X-CSRF-TOKEN': self.config.csrfToken || $('meta[name="csrf-token"]').attr('content') || ''
        },
        success: function(response) {
          if (!response || response.length === 0) {
            $('#fpwFontGrid').html('<div class="fpw-empty-state">沒有可用的字體</div>');
            $('#fpwLoadingOverlay').hide();
            return;
          }
          
          self.state.fontsData = response;
          
          response.forEach(function(fontData, index) {
            const card = $('<div></div>')
              .addClass('fpw-font-card')
              .attr('data-id', fontData.id || index)
              .attr('data-name', fontData.font_name)
              .html(`
                <div class="fpw-checkmark">✓</div>
                <div class="fpw-font-preview">
                  <img src="${fontData.url}" alt="${fontData.font_name}" loading="lazy">
                </div>
                <div class="fpw-font-name">${fontData.font_name}</div>
              `);
            
            // 添加點擊事件
            card.on('click', function() {
              $('.fpw-font-card').removeClass('selected');
              $(this).addClass('selected');
              
              self.state.selectedFontId = $(this).data('id');
              self.state.selectedFontName = $(this).data('name');
              $('#fpwSelectedFontName').text(self.state.selectedFontName);
              $('#fpwSelectionBar').css('display', 'flex');
            });
            
            $('#fpwFontGrid').append(card);
          });
          
          $('#fpwLoadingOverlay').hide();
        },
        error: function(xhr, status, error) {
          console.error('Font generation error:', error);
          $('#fpwFontGrid').html('<div class="fpw-empty-state">生成字體預覽時發生錯誤，請稍後再試。</div>');
          $('#fpwLoadingOverlay').hide();
        }
      });
    }
  };
  
  // 暴露給全域
  window.FontPreviewWidget = FontPreviewWidget;
})();
