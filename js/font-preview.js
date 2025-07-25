/*!
 * Font Preview v1.0.1
 * (c) 2025 DK0124
 * Released under the MIT License.
 */

(function() {
  // 避免全域變數污染
  const FontPreviewApp = {
    // 當前狀態
    selectedFontId: null,
    selectedFontName: null,
    currentColor: '#333333',
    previewTimeout: null,
    
    // 初始化
    init: function() {
      // 確保 jQuery 已載入
      if (typeof jQuery === 'undefined') {
        console.error('Font Preview: jQuery is required');
        return;
      }
      
      this.setupEventListeners();
    },
    
    // 設置事件監聽器
    setupEventListeners: function() {
      const self = this;
      
      // 生成預覽按鈕
      $(document).on('click', '#fontGenerateButton', function() {
        self.generatePreviews();
      });
      
      // 顏色選擇 - 使用事件委託確保動態元素也能綁定
      $(document).on('click', '.font-color-option', function() {
        // 移除所有選中狀態
        $('.font-color-option').css('border-color', 'transparent').removeClass('active');
        
        // 設置當前選中
        $(this).css('border-color', '#97BF90').addClass('active');
        
        // 更新當前顏色
        self.currentColor = $(this).data('color');
        console.log('Selected color:', self.currentColor);
      });
      
      // 選擇字體按鈕
      $(document).on('click', '#fontSelectBtn', function() {
        if (self.selectedFontId && self.selectedFontName) {
          // 觸發自定義事件或回調
          if (window.onFontSelected) {
            window.onFontSelected({
              id: self.selectedFontId,
              name: self.selectedFontName
            });
          } else {
            alert(`已選擇字體: ${self.selectedFontName}`);
          }
        }
      });
      
      // 取消按鈕
      $(document).on('click', '#fontCancelBtn', function() {
        self.selectedFontId = null;
        self.selectedFontName = null;
        $('#selectedFontName').text('尚未選擇');
        $('#fontSelectionBar').hide();
        $('.font-card').removeClass('selected');
      });
      
      // 預覽文字輸入 - 防抖處理
      $(document).on('input', '#fontPreviewText', function() {
        if ($('#fontGrid .font-card').length > 0) {
          clearTimeout(self.previewTimeout);
          self.previewTimeout = setTimeout(function() {
            self.generatePreviews();
          }, 500);
        }
      });
    },
    
    // 生成字體預覽
    generatePreviews: function() {
      const self = this;
      
      // 顯示載入中
      $('#fontLoadingOverlay').css('display', 'flex');
      
      const text = $('#fontPreviewText').val() || '漢字字體預覽';
      const color = self.currentColor || '#333333';
      
      console.log('Generating previews with:', { text, color });
      
      // 清空字體網格
      $('#fontGrid').html('');
      
      // 發送AJAX請求
      $.ajax({
        url: 'https://www.ctmfont.com/generatefont',
        type: 'POST',
        data: {
          previewText: text,
          color: color
        },
        headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') || ''
        },
        success: function(response) {
          console.log('Font generation success:', response);
          
          if (!response || response.length === 0) {
            $('#fontGrid').html('<div style="grid-column: 1/-1; text-align: center; padding: 40px 0; color: #888;">沒有可用的字體</div>');
            $('#fontLoadingOverlay').hide();
            return;
          }
          
          response.forEach(function(fontData, index) {
            const card = $('<div></div>')
              .addClass('font-card')
              .attr('data-id', fontData.id || index)
              .attr('data-name', fontData.font_name)
              .html(`
                <div class="font-checkmark">✓</div>
                <div style="width: 100%; min-height: 140px; display: flex; align-items: center; justify-content: center; padding: 20px; background-color: white;">
                  <img src="${fontData.url}" alt="${fontData.font_name}" loading="lazy" style="max-width: 100%; max-height: 120px; object-fit: contain;">
                </div>
                <div style="padding: 12px; text-align: center; font-size: 14px; border-top: 1px solid #D4E8D1; background-color: #F6F9F6;">
                  ${fontData.font_name}
                </div>
              `);
            
            // 添加點擊事件
            card.on('click', function() {
              $('.font-card').removeClass('selected');
              $(this).addClass('selected');
              
              self.selectedFontId = $(this).data('id');
              self.selectedFontName = $(this).data('name');
              $('#selectedFontName').text(self.selectedFontName);
              $('#fontSelectionBar').css('display', 'flex');
            });
            
            $('#fontGrid').append(card);
          });
          
          $('#fontLoadingOverlay').hide();
        },
        error: function(xhr, status, error) {
          console.error('Font generation error:', {
            status: status,
            error: error,
            response: xhr.responseText
          });
          
          $('#fontGrid').html('<div style="grid-column: 1/-1; text-align: center; padding: 40px 0; color: #f00;">生成字體預覽時發生錯誤，請稍後再試。</div>');
          $('#fontLoadingOverlay').hide();
        }
      });
    }
  };
  
  // 當DOM載入完成後初始化
  $(document).ready(function() {
    // 延遲初始化，確保所有元素都已載入
    setTimeout(function() {
      FontPreviewApp.init();
    }, 100);
  });
  
  // 暴露給全域以便外部調用（可選）
  window.FontPreviewApp = FontPreviewApp;
})();
