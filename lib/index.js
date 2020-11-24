// 实现这个项目的构建任务

const {src, dest, parallel, series, watch } = require('gulp');
const path = require('path');
const del = require('del');
const browserSync = require('browser-sync');

const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();
const bs = browserSync.create();

const cwd = process.cwd()

let config = {
  // default infomation
  build: {
    source: 'src',
    target: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: "assets/styles/*.scss",
      scripts: "assets/scripts/*.js",
      pages: "*.html",
      images: 'assets/images/**',
      fonts: "assets/fonts/**"
    }
  }
}

try {
  const loadConfig = require(path.join(cwd, 'pages.config.js'))
  config = Object.assign({}, config, loadConfig)
} catch (e) {
  // console.log('未找到或未能正确识别出 pages.config.js')
}

const clean = () => {
  return del([config.build.target, config.build.temp])
}

const styles = () => {
  return src(config.build.paths.styles, { base: config.build.source, cwd: config.build.source })
        .pipe(plugins.sass({ outputStyle: 'expanded' }))
        .pipe(dest(config.build.temp))
        .pipe(bs.reload({stream: true}))
}

const scripts = () => {
  return src(config.build.paths.scripts, {base: config.build.source, cwd: config.build.source })
          .pipe(plugins.babel({ presets: [ require('@babel/preset-env') ]}))
          .pipe(dest(config.build.temp))
          .pipe(bs.reload({stream: true}))
}

const pages = () => {
  return src(config.build.paths.pages, {base: config.build.source, cwd: config.build.source})
          .pipe(plugins.swig({data: config.data, defaults: { cache: false }}))
          .pipe(dest(config.build.temp))
          .pipe(bs.reload({stream: true}))
}

const images = () => {
  return src(config.build.paths.images, { base: config.build.source, cwd: config.build.source })
          .pipe(plugins.imagemin())
          .pipe(dest(config.build.target))
}

const fonts = () => {
  return src(config.build.paths.fonts, { base: config.build.source, cwd: config.build.source })
          .pipe(plugins.imagemin())
          .pipe(dest(config.build.target))
}

const extra = () => {
  return src('**', { base: config.build.public, cwd: config.build.public })
          .pipe(dest(config.build.target))
}

const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
          .pipe(plugins.useref({ searchPath: [config.build.temp, '.'] }))
          .pipe(plugins.if(/\.js$/, plugins.uglify()))
          .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
          .pipe(plugins.if(/\.html$/, plugins.htmlmin({
            collapseWhitespace: true,
            minityCSS: true,
            minifyJS: true
          })))
          .pipe(dest(config.build.target))
}

const serve = () => {
  bs.init({
    port: 1357,
    server: {
      baseDir: [config.build.temp, config.build.source, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  })
}

const compile = parallel(styles, scripts, pages)

const develop = series(compile, serve)

const build = series(clean, parallel(series(compile, useref), images, fonts, extra))


module.exports = {
  clean,
  develop,
  build
}
