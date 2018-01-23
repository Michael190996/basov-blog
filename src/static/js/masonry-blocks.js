$(window).ready(() => {
  let $grid = $('.gallery .photo');

  $grid.on('layoutComplete', (e, items) => {
    $grid.find('.block').css('margin-top', 0);
    $(items[1].element).css('margin-top', 40);
  });

  $grid = $grid.masonry({
    itemSelector: '.block'
  });

  $grid.masonry('layout');
});
