$(window).ready(() => {
  window.onscroll = (e) => {
    const PAGEYCONTENT = $('#content').offset().top;
    const PAGEYFOOTER = $('#footer').offset().top;
    const SCROLLYHEIGHTMENU = $(window).scrollTop()-parseInt($('.fix-menu').css('height'));

    if(PAGEYCONTENT < SCROLLYHEIGHTMENU && SCROLLYHEIGHTMENU+window.innerHeight < PAGEYFOOTER) {
      $('.fix-menu').removeClass('fix-menu-hidden');
    } else {
      $('.fix-menu').addClass('fix-menu-hidden');
    }
  };
});