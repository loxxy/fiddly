/*jslint node:true es5:true nomen:true*/
/* console*/

"use strict";

var gulp = require('gulp'),
  mainBowerFiles = require('main-bower-files'),
  minify = require('gulp-cssnano'),
  uglify = require('gulp-uglify'),

  baseDir = "./",
  images = ['./images/*'],
  main = ['./*.html', './manifest.json'],
  styles = ['./styles/*.css'],
  scripts = ['./js/*.js'],
  dest = "./public";

function onError(err) {
  console.log(err);
}

gulp.task('Copy_Images', function () {
  return gulp.src(images)
    .pipe(gulp.dest(dest));
});

gulp.task('Copy_Styles', function () {
  return gulp.src(styles)
    .pipe(minify())
    .pipe(gulp.dest(dest));
});

gulp.task('Copy_Scripts', function () {
  return gulp.src(scripts)
    .pipe(uglify())
    .pipe(gulp.dest(dest));
});

gulp.task('Copy_Main_Files', function () {
  return gulp.src(main)
    .pipe(gulp.dest(dest));
});

gulp.task('Copy_Bower_Files', function () {
  return gulp.src(mainBowerFiles())
    .pipe(uglify())
    .pipe(gulp.dest(dest));
});

var tasklist = [];
tasklist.push('Copy_Images');
tasklist.push('Copy_Styles');
tasklist.push('Copy_Scripts');
tasklist.push('Copy_Main_Files');
tasklist.push('Copy_Bower_Files');

gulp.task('default', tasklist, function () {
  console.log("Done.");
}).on('error', onError);
