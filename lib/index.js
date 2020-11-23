const { src, dest } = require('gulp');
const sass = require('gulp-sass');

module.exports.styles = () => {
  return src('src/**/*.scss')
          .pipe(sass())
          .pipe(dest('dist'))
}