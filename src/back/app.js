import Koa from 'koa';
import koaStatic from 'koa-static-serve';
import KoaPug from 'koa-pug';
import path from 'path';
import router from './controllers/router';
import cookie from 'koa-cookie';
import mount from 'koa-mount';
import pugUtils from './utils/pug';
import params from '../back/params/params';

export default function (pugTemplates) {
  const koa = new Koa();

  const koaPug = new KoaPug(pugTemplates);
  koaPug.locals.utils = pugUtils(koaPug);

  const _router = router(koaPug);

  koaPug.use(koa);

  if (params.STATIC) {
    koa.use(mount('/static', koaStatic(path.join(__dirname, '..', 'static'), {'404': 'next'})));
  }

  koa
    .use(cookie())
    .use(_router.routes())
    .use(_router.allowedMethods());

  return koa;
};

