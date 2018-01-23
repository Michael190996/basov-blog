import log4js from 'log4js';

const logger = log4js.getLogger('utils');
logger.level = 'info';

export default {
  error: (callback) => {
    return async (ctx, next) => {
      try {
        return await callback(ctx, next);
      } catch (_err) {
        logger.error(_err);

        ctx.status = 500;
        ctx.render('error', {
          error: _err.toString(),
          statusCode: 500
        });
      }
    };
  }
};