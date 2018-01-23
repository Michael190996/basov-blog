import gulp from 'gulp';
import gulpSass from 'gulp-sass';
import gulpClean from 'gulp-clean';
import gulpBabel from 'gulp-babel';
import gulpEslint from 'gulp-eslint';
import gulpSequence from 'gulp-sequence';
import gulpNotify from 'gulp-notify';
import gulpSourcemaps from 'gulp-sourcemaps';
import gulpMainBowerFiles from 'gulp-main-bower-files';
import gulpLivereload from 'gulp-refresh';
import childProcess from 'child_process';
import fs from 'fs';
import path from 'path';

process.env.CACHE = false;
process.env.BLOG_PORT = 3001;

const server = () => {
  app = childProcess.fork('gulpserver.js');

  app.on('message', (message) => {
    if (message === 'refresh') {
      gulp.src('dist')
        .pipe(gulpLivereload())
        .pipe(gulpNotify({
          title: 'Браузер перезагрузился'
        }));
    }
  });

  // рекурсия
  app.on('close', server); // вызывается при завершении работы сервера
};

const wrapPipe = (title, taskFn) => {
  return (done) => {
    let _err = false;

    const onSuccess = () => {
      if (!_err) {
        gulp.src('dist').pipe(gulpNotify({
          title: 'Завершено: ' + title
        }));

        return done();
      }
    };

    const onError = (err) => {
      _err = true; // флаг на то, чтобы onSuccess не сработал бы

      gulp.src('dist').pipe(gulpNotify({
        title: 'Хренушки: ' + title,
        message: err
      }));

      return done(err);
    };

    const outStream = taskFn(onSuccess, onError);
    if (outStream && typeof outStream.on === 'function') {
      outStream.on('end', onSuccess);
    }
  }
};

let app = false;

process.on('exit', () => {
  if (app) {
    app.kill();
  }
});

gulp.task('clean', () => {
  // найти все в src/static/ и заменить на dist/static/${el}
  const PATHS = fs.readdirSync(path.join(__dirname, 'src', 'static')).map(el => `dist/static/${el}`);

  // удалить эти папки
  gulp.src(PATHS, {
    read: false,
  }).pipe(gulpClean().on('end', () => {
    // удалить все, кроме dist/static
    return gulp.src(['dist/**/*', '!dist/static', '!dist/static/**/*'], {
      read: false
    }).pipe(gulpClean());
  }));
});

gulp.task('libs', () => {
  return gulp.src('dist/static/libs', {
    read: false
  }).pipe(gulpClean())
    .on('end', () => {
      gulp.src('bower.json')
        .pipe(gulpMainBowerFiles({
          ignore: ['**/*.less']
        }))
        .pipe(gulp.dest('dist/static/libs'));
    })
});

gulp.task('lint', () => {
  let _err = false;

  return gulp.src('src/**/*.js')
    .pipe(gulpEslint())
    .pipe(gulpEslint.result((result) => {
      if (result.errorCount) {
        _err = true;

        return gulp.src('dist').pipe(gulpNotify({
          title: 'Фигушки: Js lint',
          message: `filePath: ${result.filePath}\r${result.messages[0].message}\rline: ${result.messages[0].line}, column: ${result.messages[0].column}`
        }));
      }
    }).on('end', () => {
      if (!_err) {
        return gulp.src('dist').pipe(gulpNotify({
          title: 'Завершено: Js lint'
        }));
      }
    }))
    .pipe(gulpEslint.format())
    .pipe(gulpEslint.failAfterError());
});

gulp.task('babel:back', ['lint'], wrapPipe('Babel:back', (success, error) => {
  return gulp.src(['src/**/*.js', '!src/static', '!src/static/*/**'])
    .pipe(gulpSourcemaps.init())
    .pipe(gulpBabel().on('error', error))
    .pipe(gulpSourcemaps.write('.'))
    .pipe(gulp.dest('dist')).on('end', () => {
      if (app) {
        app.kill();
      }
    });
}));

gulp.task('babel:front', ['lint'], wrapPipe('Babel:front', (success, error) => {
  return gulp.src('src/static/**/*.js')
    .pipe(gulpSourcemaps.init())
    .pipe(gulpBabel().on('error', error))
    .pipe(gulpSourcemaps.write('.'))
    .pipe(gulp.dest('dist/static'))
    .pipe(gulpLivereload());
}));

gulp.task('sass', wrapPipe('Sass', (success, error) => {
  return gulp.src('src/static/styles/**/*')
    .pipe(gulpSourcemaps.init())
    .pipe(gulpSass().on('error', error))
    .pipe(gulpSourcemaps.write('.'))
    .pipe(gulp.dest('dist/static/styles'))
    .pipe(gulpLivereload());
}));

gulp.task('pug', wrapPipe('Mv pug files', () => {
  return gulp.src('src/views/**/*.pug')
    .pipe(gulp.dest('dist/views'))
    .pipe(gulpLivereload());
}));

gulp.task('watch', () => {
  server();
  gulpLivereload.listen({start: true});

  gulp.watch('src/**/*.pug', ['pug']);
  gulp.watch(['src/**/*.js', '!src/static', '!src/static/**/*.js'], ['babel:back']);
  gulp.watch('src/static/**/*.js', ['babel:front']);
  gulp.watch('src/static/styles/**/*.sass', ['sass']);
});

gulp.task('babel', ['lint', 'babel:back', 'babel:front']);
gulp.task('build', ['pug', 'sass', 'babel']);
gulp.task('default', gulpSequence('clean', 'lint', 'build', 'watch'));