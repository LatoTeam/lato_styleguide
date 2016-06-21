var gulp = require('gulp');
var styleguide = require('devbridge-styleguide');

gulp.task('start-styleguide', function () {
  styleguide.startServer();
});