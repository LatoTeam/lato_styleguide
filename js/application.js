"use strict";!function(o){function n(){var n=o("main section");n.each(function(){var n=o(this),e=103;actualHeight=n.height(),actualAnchor=o(".s_sidebar-nav").find('a[href="#'+n.attr("id")+'"]'),parseInt(n.offset().top-e)<=o(window).scrollTop()&&parseInt(n.offset().top+actualHeight-e)>o(window).scrollTop()+1?actualAnchor.addClass("is-active"):actualAnchor.removeClass("is-active")})}var e=o("body");o(".s_header-toggle").on("click",function(o){o.preventDefault(),e.addClass("is-menu-open")}),o(".s_sidebar-close").on("click",function(o){o.preventDefault(),e.removeClass("is-menu-open")}),o('.s_sidebar-nav a[href^="#"]').on("click",function(n){n.preventDefault();var e=o(this.hash),t=93;o("body, html").animate({scrollTop:parseInt(e.offset().top-t)},300)}),o(window).on("scroll",function(){n()})}(jQuery),function(){var o,n,e,t,s;n=!1,t=0,e=0,o=0,s=5e3,$(window).bind("load",function(){return $(".browser").removeClass("loading"),o=$("#scroll-img").height()-$(".browser .window").height(),$("#scroll-img").animate({top:-o},s,function(){return $("#scroll-img").animate({top:0},s)})}),$(document).ready(function(){return $("#scroll-img").mousedown(function(o){return $(this).stop(),n=!0,e=parseInt($(this).css("top")),t=o.pageY}),$(window).mouseup(function(o){return n=!1,e=parseInt($("#scroll-img").css("top")),$(".browser .window").removeClass("grabbed")}),$(window).on("mousemove",function(s){var r;if(n&&(r=t-s.pageY-e,r>=0&&r<=o))return $(".browser .window").addClass("grabbed"),$("#scroll-img").css({top:-r+"px"})})})}.call(void 0);