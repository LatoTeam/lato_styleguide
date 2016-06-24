'use strict';

(function ($) {
  var $body = $('body');
  // Navigation
  $('.s_header-toggle').on('click', function (e) {
    e.preventDefault();
    $body.addClass('is-menu-open');
  });

  $('.s_sidebar-close').on('click', function (e) {
    e.preventDefault();
    $body.removeClass('is-menu-open');
  });

  // Smooth Nav.
  $('.s_sidebar-nav a[href^="#"]').on('click', function (e) {
    e.preventDefault();
    var target = $(this.hash),
        paddingTop = 93;
    $('body, html').animate({ 'scrollTop': parseInt(target.offset().top - paddingTop) }, 300);
  });

  //update selected navigation element
  $(window).on('scroll', function () {
    updateNavigation();
  });

  function updateNavigation() {
    var contentSections = $('main section');
    contentSections.each(function () {
      var actual = $(this),
          paddingTop = 103;
      actualHeight = actual.height(), actualAnchor = $('.s_sidebar-nav').find('a[href="#' + actual.attr('id') + '"]');

      if (parseInt(actual.offset().top - paddingTop) <= $(window).scrollTop() && parseInt(actual.offset().top + actualHeight - paddingTop) > $(window).scrollTop() + 1) {
        actualAnchor.addClass('is-active');
      } else {
        actualAnchor.removeClass('is-active');
      }
    });
  }
})(jQuery);

// ShowCase
(function () {
  var bottom, curDown, curTop, curY, scrollSpeed;
  curDown = false;
  curY = 0;
  curTop = 0;
  bottom = 0;
  scrollSpeed = 5000;
  $(window).bind('load', function () {
    $('.browser').removeClass('loading');
    bottom = $('#scroll-img').height() - $('.browser .window').height();
    return $('#scroll-img').animate({ 'top': -bottom }, scrollSpeed, function () {
      return $('#scroll-img').animate({ 'top': 0 }, scrollSpeed);
    });
  });
  $(document).ready(function () {
    $('#scroll-img').mousedown(function (e) {
      $(this).stop();
      curDown = true;
      curTop = parseInt($(this).css('top'));
      return curY = e.pageY;
    });
    $(window).mouseup(function (e) {
      curDown = false;
      curTop = parseInt($('#scroll-img').css('top'));
      return $('.browser .window').removeClass('grabbed');
    });
    return $(window).on('mousemove', function (e) {
      var newTop;
      if (curDown) {
        newTop = curY - e.pageY - curTop;
        if (newTop >= 0 && newTop <= bottom) {
          $('.browser .window').addClass('grabbed');
          return $('#scroll-img').css({ 'top': -newTop + 'px' });
        }
      }
    });
  });
}).call(undefined);