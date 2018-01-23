import params from './dist/back/params/params';
import getPugTemplates from './dist/back/params/getPugTemplates';
import app from './dist/back/app';

getPugTemplates().then(async (pugTemplates) => {
  const koa = app(pugTemplates);

  koa.listen(params.KOA.PORT, () => {
    console.info(`Server start at localhost:${params.KOA.PORT}`);
    process.send('refresh');
  });
});