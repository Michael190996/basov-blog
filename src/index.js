import params from './back/params/params';
import getPugTemplates from './back/params/getPugTemplates';
import log4js from 'log4js';
import app from './back/app';

const logger = log4js.getLogger();
logger.level = 'info';

getPugTemplates().then(async (pugTemplates) => {
  const koa = app(pugTemplates);

  koa.listen(params.KOA.PORT, () => {
    logger.info(`Server start at localhost:${params.KOA.PORT}`);
  });
});