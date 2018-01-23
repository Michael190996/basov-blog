$(window).ready(() => {
  const DATAPHOTOS = $('.gallery .photo').data('dataphotos');
  const ALBUMID = (DATAPHOTOS.album ? DATAPHOTOS.album.id : 'all');
  let page = 1;
  let wait = false;

  const galleryPhoto = (currentTarget) => {
    const PHOTO = $(currentTarget).data().photo;

    $('#galleryPhoto .block').removeClass('active');
    $('#galleryPhoto .left, #galleryPhoto .right').removeClass('hidden');

    $(currentTarget).addClass('active');

    $('#galleryPhoto img').attr('src', PHOTO.src);
    $('#galleryPhoto .date span').text(PHOTO.date);
    $('#galleryPhoto .subject').text(PHOTO.title);
    $('#galleryPhoto .theme').text(PHOTO.description);
    $('#galleryPhoto .link-origin').attr('href', PHOTO.src);

    if (!DATAPHOTOS.album) {
      $.get(`/rest/album/${PHOTO.albumid}`, (album) => {
        $('#galleryPhoto .detail').text(album.title);
        $('#galleryPhoto .logo').css('background', `url(${album.background})`);
        $('#galleryPhoto .more').attr('href', `/photo/album/${album.id}`);

        $('#galleryPhoto').modal();
      });
    } else {
      $('#galleryPhoto').modal();
    }


  };

  const queryToPageAndBuild = () => {
    wait = true;

    return $.get(`/rest/photos/${ALBUMID}/${page}`, (data) => {
      const $items = $(data.photos.map((el) => {
        return `<div class="block a" data-photo=${JSON.stringify(el)}>
                    <div class="wrapper">
                        <div class="date"><i class="fa fa-clock-o"></i>${el.date}</div>
                        <img src="${el.src}" />
                    </div>
                  </div>`;
      })
        .join(''))
        .on('click', ({currentTarget}) => {
          galleryPhoto(currentTarget);
        });

      $('.gallery .photo').append($items)
        .masonry('appended', $items)
        .masonry('layout');

      page++;

      wait = false;
    });
  };

  const lazy = () => {
    const TOTAL = $('.gallery .photo').masonry('getItemElements').length;
    const PAGEYCONTENTTOP = $('#content').offset().top + parseInt($('#content').css('height'));

    if (!wait && TOTAL < DATAPHOTOS.total && PAGEYCONTENTTOP <= ($(window).scrollTop() + window.innerHeight)) {
      queryToPageAndBuild();
    }
  };

  $('#galleryPhoto').on('click', ({target}) => {
    if ($(target).hasClass('target-close')) {
      $('#galleryPhoto .close').click();
    }
  });
  
  $('#galleryPhoto .left, #galleryPhoto .right').on('click', ({currentTarget}) => {
    const items = $('.gallery .photo').masonry('getItemElements');
    const NEXT = ($(currentTarget).hasClass('left') ? -1 : 1);

    for(let i = 0; i < items.length; i++) {
      if ($(items[i]).hasClass('active')) {
        if (items[i+NEXT]) {
          galleryPhoto(items[i+NEXT]);
        } else if (NEXT === 1 && items.length < DATAPHOTOS.total) {
          queryToPageAndBuild().then(() => {
            $('#galleryPhoto .right').click();
          });
        }

        break;
      }
    }
  });

  window.onscroll = lazy;
  lazy();
});