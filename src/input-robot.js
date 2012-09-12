define(function (require, exports) {
  var $ = require('$');
  var Widget = require('widget');
  var Overlay = require('overlay');

  var Suggestion = Overlay.extend({
    show: function () {
      var that = this;
      Suggestion.superclass.show.call(that);
      that._setPosition();
    },
    hide: function () {
      Suggestion.superclass.hide.call(this);
    }
  });

  var InputBox = Widget.extend({
    setup: function () {
      var that = this;
      var elem = that.element;

      that._input = that.$('input');
      that._suggest = that.$('.suggest');

      that._initSuggestion();

      that._initEvent();
    },
    _initEvent: function () {
      var that = this, showTimer, cache, ajaxHandler; //suggestion受时间间隔和文本内容的限制，防止请求过于频繁
      that._input.on('keyup',function (e) {
          var question = $(this).val();
          //按回车提交问题
          if (e.keyCode === 13 && question) {
            ajaxHandler && ajaxHandler.abort();
            showTimer && clearTimeout(showTimer);
            that.suggestion.hide();
            that.trigger('ask', question);
            $(this).val('').blur();
          }
        }).on('focus input',function (e) {
          showTimer && clearTimeout(showTimer);
          showTimer = setTimeout(function () {
            var value = that.val().trim();
            if(e.type === 'focus')
              cache = '';
            if (cache === value)
              return;
            cache = value;
            if (!cache) {
              that.suggestion.hide();
              return;
            }
            //终止上一次ajax请求
            ajaxHandler && ajaxHandler.abort();
            ajaxHandler = $.ajax('suggest.jspa', {
              type: 'post',
              dataType: 'json',
              data: {
                sessionUuid: SESSIONUUID,
                question: that.val(),
                sourceType: SOURCETYPE
              },
              success: function (o) {
                if (o.success && o.data.length) {
                  var ul = $('ul', that._suggest), len = o.data.length;
                  ul.empty();
                  for (var i = 0; i < len; i++) {
                    ul.append('<li>' + o.data[i] + '</li>');
                  }
                  that._initSuggestEvent();
                  that.suggestion.show();
                } else {
                  that.suggestion.hide();
                }
              }
            });
          }, 200);
        }).on('blur', function () {
          ajaxHandler && ajaxHandler.abort();
          showTimer && clearTimeout(showTimer);
          setTimeout(function () {
            that.suggestion.hide();
          }, 50);
        });
    },
    /**
     * 在手机浏览器中，发现使用delegate影响容器内的文本操作和点击事件，故改为传统事件注册方式。
     * @private
     */
    _initSuggestEvent: function () {
      var that = this;
      $('li', this._suggest).on('click', function (e) {
        e.stopPropagation();
        that.trigger('ask', $(this).text());
        that.val('');
        that.suggestion.hide();
      });
    },
    _initSuggestion: function () {
      var that = this;
      that.suggestion = new Suggestion({
        element: that._input.next(),
        parentNode: that.element,
        align: {
          selfXY: [5, '100%'],
          baseElement: that._input[0],
          baseXY: [0, -5]
        }
      });
      that.suggestion.set('width', $(window).width() - 12);
    },
    focus: function () {
      this._input.focus();
    },
    val: function (value) {
      if (typeof(value) === 'undefined') {
        return this._input.val();
      } else {
        this._input.val(value);
      }
    }

  });
  return InputBox;
});