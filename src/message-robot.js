define(function (require, exports) {

  var $ = require('$');
  var Widget = require('widget');

  var MessageBox = Widget.extend({
    setup: function () {
      var that = this;
      that._initEvent(that.element);
    },
    /**
     * 在手机浏览器中，发现使用delegate影响容器内的文本操作和点击事件，故改为传统事件注册方式。
     * @param container
     * @private
     */
    _initEvent: function (context) {
      var that = this;
      $('article li a', context).on('click', articleClickHandler);
      $('p a', context).on('click', answerClickHandler);
      $('.feedback input:radio', context).on('click', radioClickHandler);

      function answerClickHandler() {
        var href = $(this).attr('href');
        if (/mjrlink/.test(href)) {
          var container = $(this).closest('section');
          that.answer(container, SERVICENOTSUPPORT, 'service');
        }
      }

      function articleClickHandler() {
        var link = $(this);
        var type = link.data('type');
        var container;

        if (type) {
          var knowtype = link.data('knowtype');
          var id = link.attr('href').slice(1);
          var indexid = link.data('indexid');
          var question = link.text();

          if (type === 'recommend') {
            container = link.parent();
            var answer = link.next();
            if (answer.length) {
              answer.toggle();
            } else {
              that.ask(question, container, {
                id: id,
                indexId: indexid,
                type: 2
              }, type);

            }
          } else {
            that.ask(question, container, {
              id: id,
              indexId: indexid,
              type: 2
            }, type);
          }
        }
      }

      function radioClickHandler() {
        var feedback = $(this).closest('.feedback');
        var chatlogid = feedback.data('chatlogid');
        var knowtype = feedback.data('knowtype');
        var instanceid = feedback.data('instanceid');
        feedback.html(FEEDBACKSUCC + '<div class="arrow"></div>');
        $.ajax('feedback.jspa', {
          type: 'post',
          dataType: 'html',
          data: {
            sessionUuid: SESSIONUUID,
            cacheChatLogId: chatlogid,
            conversationInstanceId: instanceid,
            knowType: knowtype,
            userId: LOGINID,
            feedback: this.value,
            sourceType: SOURCETYPE
          },
          success: function (data) {
            if (data.trim() === 'true') {
              //success
            }
          }
        });
      }
    },
    /**
     *
     * @param question
     * @param container
     * @param callback
     * @param params
     */
    ask: function (question, container, params, type) {
      var that = this;
      //正常的问答
      if (!container) {
        container = $('<section>');
        var user = $('<div class="user">').html('<span>' + that.get('user') + '</span>：<time>' + that._getTime() + '</time>');
        var ask = $('<div class="ask">').text(question);
        container.append(user).append(ask).appendTo(that.element);
      }
      $.ajax('answer.jspa', {
        type: 'post',
        dataType: 'html',
        data: $.extend({
          sessionUuid: SESSIONUUID,
          question: question,
          sourceType: SOURCETYPE
        }, params || {}),
        success: function (data) {
          that.answer(container, data, type);
        }
      });
    },
    answer: function (container, answer, type) {
      var that = this;
      var answerContainer = $('<div class="answer">');
      answer = answerHandler(answer);
      switch (type) {
        case 'service':
          container.append($('<div class="robot">').html('<span>智能小宝</span>：<time>' + that._getTime() + '</time>'));
        case 'recommend':
          container.append(answerContainer.html(answer));
          break;
        default:
          container.append($('<div class="robot">').html('<span>智能小宝</span>：<time>' + that._getTime() + '</time>'))
            .append(answerContainer.html(answer));
          that.scrollBottom();
          break;
      }
      that._initEvent(answerContainer);
    },
    scrollBottom: function () {
      setTimeout(function () {
        var scrollTop = $(document).height() - $(window).height();
        $($.browser.webkit ? 'body' : 'html').animate({
          scrollTop: scrollTop
        }, 400);
      }, 100);
    },
    _getTime: function () {
      var date = new Date();
      var year = date.getFullYear();
      var month = date.getMonth() + 1;
      var day = date.getDate();
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var seconds = date.getSeconds();

      return year + '-' + (month < 10 ? ('0' + month) : month) + '-' + (day < 10 ? ('0' + day) : day) + ' ' +
        (hours < 10 ? ('0' + hours) : hours) + ':' +
        (minutes < 10 ? ('0' + minutes) : minutes) + ':' +
        (seconds < 10 ? ('0' + seconds) : seconds);
    }
  });

  function answerHandler(html) {
    return html.replace('{{ROBOTSORRY}}', ROBOTSORRY)
      .replace(/<img[^>]*src="([^"]+)"[^>]*>/gm, '<br/><a title="" href="$1" target="_blank">点击查看图片</a>');
  }

  return MessageBox;
});