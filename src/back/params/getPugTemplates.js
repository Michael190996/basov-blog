import path from 'path';
import postgres from '../controllers/Postgres';
import params from './params';

export default async function () {
  return {
    locals: {
      url: 'http://basov.ru',
      title: '',
      keys: 'путешествия, фотосъемка, мысли и научные публикации',
      description: 'Блог',
      menu: await postgres.getMenu(),
      options: {
        pagesTemplate: {
          photo: {
            getCount: 12
          },

          articles: {
            getCount: 16
          },

          index: {
            getCountArticles: null,
            getCountExp: 3,
            getCountPhotos: 12
          }
        },
        articlePreview: 150
      }
    },
    debug: params.DEBUG,
    pretty: false,
    noCache: params.CACHE,
    viewPath: path.join(__dirname, '..', '..', 'views', 'templates'),
    basedir: path.join(__dirname, '..', '..', 'views')
  };
}