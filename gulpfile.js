var gulp         = require('gulp');
var uglify       = require('gulp-uglify');
var jshint       = require('gulp-jshint');
var rename       = require('gulp-rename');
var replace      = require('gulp-replace');
var browserify   = require('browserify');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer');
var fs           = require("fs");
var spawn        = require('child_process').spawn;

///////////////////////////////////////////////////////////////////////////////

gulp.task("default", ["watch"]);
gulp.task("scripts", scripts);
gulp.task("server", server);
gulp.task("watch", ["scripts"], watch);

///////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////

function scripts(){
  browserify({
    debug: true,
    entries: ['./lib/app.js']
  })
  .transform("reactify")
  .bundle()
  .pipe(source('app.js'))
  .pipe(buffer())
  // .pipe(uglify())
  .pipe(gulp.dest('./dist/'))
  ;

  browserify({
    debug: false,
    entries: ['./react-inline-style.js']
  })
  .bundle()
  .pipe(source('react-inline-style.js'))
  .pipe(buffer())
  // .pipe(uglify())
  .pipe(gulp.dest('./dist/'))
  ;
}

///////////////////////////////////////////////////////////////////////////////

function server(){
  spawn('python', ['-m', "SimpleHTTPServer", "8001"]);
}


///////////////////////////////////////////////////////////////////////////////

function watch(){
  gulp.watch(["./*.js", "./lib/**/*.js", "./**/*.html", "./package.json"], ["scripts"]);
};
