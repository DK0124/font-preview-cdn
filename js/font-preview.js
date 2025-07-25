(function() {
  // 避免全域變數污染
  const FontPreviewApp = {
    // 字體列表
    availableFonts: [
      { id: 1, name: '微軟正黑體' },
      { id: 2, name: '新細明體' },
      { id: 3, name: '標楷體' },
      { id: 4, name: '華康中黑體' },
      { id: 5, name: '華康娃娃體' },
      { id: 6, name: '華康海報體' },
      { id: 7, name: '華康少女文字體' },
      { id: 8, name: '文鼎中黑' },
      { id: 9, name: '文鼎扁黑體' },
      { id: 10, name: '文鼎毛筆字體' },
      { id: 11, name: '文鼎POP1體' },
      { id: 12, name: '文鼎POP2體' },
      { id: 13, name: '文鼎POP3體' },
      { id: 14, name: '王漢宗粗鋼體' },
      { id: 15, name: '王漢宗特黑體' },
      { id: 16, name: '王漢宗超明體' },
      { id: 17, name: '851手書き雑フォント' },
      { id: 18, name: '青柳隷書しも' }
    ],
    
    // 當前狀態
    selectedFontId: null,
    currentColor: '#333333',
    previewTimeout: null,
    
    // 初始化
    init: function() {
      this.setupEventListeners();
    },
    
    // 設置事件監聽器
    setupEventListeners: function() {
      const self = this;
      
      // 生成預覽按鈕
      $('#fontGenerateButton').on('click', function() {
        self.generatePreviews();
      });
      
      // 顏色選擇
      $('.font-color-option').on('click', function() {
        $('.font-color-option').css('border', '3px solid transparent');
        $(this).css('border', '3px solid #97BF90');
        self.currentColor = $(this).data('color');
      });
      
      // 選擇字體按鈕
      $('#fontSelectBtn').on('click', function() {
        if (self.selectedFontId) {
          const selectedFont = self.availableFonts.find(font => font.id === self.selectedFontId);
          if (selectedFont) {
            // 這裡可以觸發您的回調函數或事件
            if (window.onFontSelected) {
              window.onFontSelected(selectedFont);
            } else {
              alert(`已選擇字體: ${selectedFont.name}`);
            }
          }
        }
      });
      
      // 取消按鈕
      $('#fontCancelBtn').on('click', function() {
        self.selectedFontId = null;
        $('#selectedFontName').text('尚未選擇');
        $('#fontSelectionBar').hide();
        $('.font-card').removeClass('selected');
      });
      
      // 預覽文字輸入
      $('#fontPreviewText').on('input', function() {
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
      
      // 清空字體網格
      $('#fontGrid').html('');
      
      // 發送AJAX請求
      $.ajax({
        url: 'https://www.ctmfont.com/generatefont',
        type: 'POST',
        data: {
          previewText: text,
          color: self.currentColor
        },
        headers: {
          'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content') || ''
        },
        success: function(response) {
          response.forEach(function(fontData, index) {
            const card = $('<div></div>')
              .addClass('font-card')
              .attr('data-id', index)
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
              
              self.selectedFontId = index + 1;
              $('#selectedFontName').text(fontData.font_name);
              $('#fontSelectionBar').css('display', 'flex');
            });
            
            $('#fontGrid').append(card);
          });
          
          $('#fontLoadingOverlay').hide();
        },
        error: function(xhr) {
          console.error('Error:', xhr.responseText);
          alert('生成字體預覽時發生錯誤，請稍後再試。');
          $('#fontLoadingOverlay').hide();
        }
      });
    }
  };
  
  // 當DOM載入完成後初始化
  $(document).ready(function() {
    FontPreviewApp.init();
  });
  
  // 暴露給全域以便外部調用（可選）
  window.FontPreviewApp = FontPreviewApp;
})();