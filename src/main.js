define(function (require, exports) {

  var $ = require('$');
  var MessageRobot = require('./message-robot');
  var InputRobot = require('./input-robot');
  //目前版本写死，以后如有人工客服，需要做区分
  var CURRENT = 'robot';

  var MainApp = function () {
    this._initialize();
  };

  MainApp.prototype = {
    /**
     *
     * @private
     */
    _initialize: function () {
      var that = this;
      that._chatBox = $('#chat-robot');
      that._msgBox = $('.message', that._chatBox);
      that._iptBox = $('.input', that._chatBox);
      //提问按钮
      that._actionBtn = $('button', that._chatBox);

      that._initService();

      that._initEvent();

      //1秒以后再执行，是因为一些设备及浏览器，一开始初始化速度很慢，浏览器高度还没有固定
      setTimeout(function () {
        document.body.scrollTop = 100;
        that._fixHeight();
        //mask fadeout
        $('#mask').fadeOut(500);
      }, 1000);
    },
    /**
     *
     * @private
     */
    _initService: function () {
      var that = this;
      if (CURRENT === 'robot') {
        that.message = that._messageRobot || (that._messageRobot = new MessageRobot({
          element: that._msgBox,
          user: NAME
        }));
        that.input = that._inputRobot || (that._inputRobot = new InputRobot({
          element: that._iptBox
        }));
      }
    },
    /**
     *
     * @private
     */
    _initEvent: function () {
      var that = this;
      that._actionBtn.on('click', $.proxy(that, '_submitHandler'));
      that.input.on('ask', function (question) {
        that.message.ask(question);
      });
      that.message.on('scroll', function () {
        that.input.suggestion.hide();
      });
    },
    /**
     * 页面初始化时，初始化消息框高度
     * @private
     */
    _fixHeight: function () {
      this._msgBox.css('minHeight', ($(window).height() - 47) + 'px');
    },
    /**
     * 提问按钮触发
     * @param e
     * @private
     */
    _submitHandler: function (e) {
      var that = this;
      var btn = that._actionBtn;
      var question = that.input.val();
      if (btn.prop('disabled') || !question) {
        that.input.focus();
      } else {
        that.input.val('');
        that.message.ask(question);
      }
    }
  };

  new MainApp();
});