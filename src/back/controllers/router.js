import KoaRouter from 'koa-router';
import utilsKoa from '../utils/koa';
import postgres from './Postgres';
import RSS from 'rss';

export default function (koaPug) {
  const router = new KoaRouter();

  // rest

  router.get('/rest/search', utilsKoa.error((ctx) => {
    console.log(ctx);
  }));

  router.get('/rest/photos/:albumid/:page', utilsKoa.error(async (ctx, next) => {
    const ALBUM = ctx.params.albumid === 'all' ? null : ctx.params.albumid;
    const PAGE = koaPug.locals.options.pagesTemplate.photo.getCount * ctx.params.page;

    if (ctx.params.page < 0 || isNaN(PAGE) || (PAGE % 1) !== 0) {
      return next();
    }

    if (ALBUM) {
      ctx.response.body = await postgres.getPhotosByAlbum(PAGE, koaPug.locals.options.pagesTemplate.photo.getCount, ALBUM);
    } else {
      ctx.response.body = await postgres.getPhotos(PAGE, koaPug.locals.options.pagesTemplate.photo.getCount);
    }
  }));

  router.get('/rest/album/:id', utilsKoa.error(async (ctx, next) => {
    ctx.response.body = await postgres.getAlbumById(ctx.params.id);
  }));

  // request get templates

  router.get('/about', utilsKoa.error(async (ctx) => {
    const ARTICLE = await postgres.getArticleById('about');

    ctx.render('about', {
      pageTemplate: 'about',
      article: ARTICLE,
      title: koaPug.locals.menu.about.title,
      keywords: koaPug.locals.menu.about.keywords,
      description: koaPug.locals.menu.about.description,
    });
  }));

  router.get('/photo', utilsKoa.error(async (ctx) => {
    const RESPONSEPHOTOS = await postgres.getPhotos(0, koaPug.locals.options.pagesTemplate.photo.getCount);

    ctx.render('photo', {
      pageTemplate: 'photo',
      title: koaPug.locals.menu.photo.title,
      keywords: koaPug.locals.menu.photo.keywords,
      description: koaPug.locals.menu.photo.description,
      dataPhotos: {
        items: RESPONSEPHOTOS.items,
        total: RESPONSEPHOTOS.total
      }
    });
  }));

  router.get('/photo/albums', utilsKoa.error(async (ctx, next) => {
    const RESPONSEALBUMS = await postgres.getAlbums();

    ctx.render('albums', {
      pageTemplate: 'photo',
      title: koaPug.locals.menu.photo.title,
      keywords: koaPug.locals.menu.photo.keywords,
      description: koaPug.locals.menu.photo.description,
      dataAlbums: RESPONSEALBUMS
    });
  }));

  router.get('/photo/album/:id/', utilsKoa.error(async (ctx, next) => {
    const RESPONSE = await Promise.all([
      postgres.getPhotosByAlbum(0, koaPug.locals.options.pagesTemplate.photo.getCount, ctx.params.id),
      postgres.getAlbumById(ctx.params.id)
    ]);

    const RESPONSEPHOTOS = RESPONSE[0];
    const RESPONSEALBUM = RESPONSE[1];

    if (RESPONSEPHOTOS.items.length) {
      ctx.render('photo', {
        pageTemplate: 'photo',
        title: koaPug.locals.menu.photo.title,
        keywords: koaPug.locals.menu.photo.keywords,
        description: koaPug.locals.menu.photo.description,
        dataPhotos: {
          items: RESPONSEPHOTOS.items,
          total: RESPONSEPHOTOS.total,
          album: RESPONSEALBUM
        }
      });
    }

    return next();
  }));

  router.get('/articles', utilsKoa.error(async (ctx, next) => {
    const RESPONSE = await Promise.all([
      postgres.getArticles(0, koaPug.locals.options.pagesTemplate.articles.getCount),
      postgres.getCategories()
    ]);

    const RESPONSEARTICLES = RESPONSE[0];
    const RESPONSECATEEGORYES = RESPONSE[1];

    ctx.render('articles', {
      pageTemplate: 'articles',
      title: 'Статьи',
      dataArticles: RESPONSEARTICLES,
      dataCategories: RESPONSECATEEGORYES
    });
  }));

  router.get('/articles/:category', utilsKoa.error(async (ctx, next) => {
    const RESPONSECATEGORY = await postgres.getCategoryById(ctx.params.category);

    if (RESPONSECATEGORY) {
      const RESPONSEARTICLES = await postgres.getArticlesByKV(0, koaPug.locals.options.pagesTemplate.articles.getCount, 'categoryid', ctx.params.category);

      ctx.render(RESPONSECATEGORY.template, {
        pageTemplate: ctx.params.category,
        dataArticles: RESPONSEARTICLES
      });
    }

    return next();
  }));

  router.get('/articles/:category/:id', utilsKoa.error(async (ctx, next) => {
    const ARTICLE = await postgres.getArticleById(ctx.params.id);

    if (ARTICLE) {
      ctx.render(ARTICLE.template, {
        pageTemplate: ctx.params.category,
        article: ARTICLE,
        title: ARTICLE.title,
        keys: ARTICLE.keys
      });
    }

    return next();
  }));

  router.get('/rss.xml', utilsKoa.error(async (ctx, next) => {
    const RESPONSE = await Promise.all([
      postgres.getArticles(0, koaPug.locals.options.pagesTemplate.articles.getCount),
      postgres.getCategories()
    ]);

    const ARTICLES = RESPONSE[0].items;
    const RESPONSECATEEGORIES = RESPONSE[1];

    const feed = new RSS({
      title: koaPug.locals.title,
      description: koaPug.locals.description,
      site_url: koaPug.locals.url,
      generator: 'RSS',
      image_url: `${koaPug.locals.url}/icon.png`,
      categories: RESPONSECATEEGORIES.map(el => el.title),
      language: 'ru'
    });

    for (let i = 0; i < ARTICLES.length; i++) {
      const ARTICLEPREVIEW = koaPug.locals.options.articlePreview;
      let description = ARTICLES[i].description;
      description = description.length < ARTICLEPREVIEW ? description : description.substr(0, ARTICLEPREVIEW) + '...';

      feed.item({
        description,
        title: ARTICLES[i].title,
        url: `${koaPug.locals.url}/articles/${ARTICLES[i].categoryid}/${ARTICLES[i].id}`,
        enclosure: {
          url: ARTICLES[i].background
        },
        categories: ARTICLES[i].keys.split(','),
        author: ARTICLES[i].bookmark,
        date: ARTICLES[i].date,
        language: 'ru'
      });
    }

    ctx.response.status = 200;
    ctx.response.type = ctx.request.accepts('xml');
    ctx.response.body = feed.xml();
  }));

  router.get(/./, utilsKoa.error(async (ctx, next) => {
    if (ctx.url === '/' || ctx.status === 404) {
      const RESPONSE = await Promise.all([
        postgres.queryRows('articles', 0, koaPug.locals.options.pagesTemplate.index.getCountArticles).whereNotNull('main').orderBy('main'),
        postgres.getArticlesByKV(0, koaPug.locals.options.pagesTemplate.index.getCountExp, 'categoryid', 'exp'),
        postgres.getPhotos(0, koaPug.locals.options.pagesTemplate.index.getCountPhotos),
        postgres.getSlides()
      ]);

      const RESPONSEARTICLES = RESPONSE[0];
      const RESPONSEEXP = RESPONSE[1];
      const RESPONSEPHOTOS = RESPONSE[2];
      const RESPONSESLIDES = RESPONSE[3];

      if (ctx.url !== '/') {
        ctx.response.status = 404;
      }

      ctx.render('index', {
        pageTemplate: 'home',

        title: koaPug.locals.menu.home.title,
        keywords: koaPug.locals.menu.home.keywords,
        description: koaPug.locals.menu.home.description,

        dataSlides: RESPONSESLIDES,

        dataPhotos: RESPONSEPHOTOS,

        dataArticles: {
          items: RESPONSEARTICLES
        },

        dataExp: RESPONSEEXP
      });
    }

    return next();
  }));

  return router;
};