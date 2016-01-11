'use strict';

var browserify = require('browserify');
var gulp = require('gulp');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');
var gutil = require('gulp-util');
var browserSync = require('browser-sync');
var jshint = require('gulp-jshint');
var reload = browserSync.reload;  


/*
var gulp = require('gulp'),

var del = require('del'),
var sass = require('gulp-sass'),
var karma = require('gulp-karma'),
var jshint = require('gulp-jshint'),
var sourcemaps = require('gulp-sourcemaps'),
var spritesmith = require('gulp.spritesmith'),
var browserify = require('browserify'),
var source = require('vinyl-source-stream'),
var buffer = require('vinyl-buffer'),
var uglify = require('gulp-uglify'),
var gutil = require('gulp-util'),
var ngAnnotate = require('browserify-ngannotate');
*/

var CacheBuster = require('gulp-cachebust');
var cachebust = new CacheBuster();

gulp.task('clean', function() {
    gulp.src('./dist/*')
      .pipe(clean({force: true}));
});

gulp.task('minify-css', function() {
  var opts = {comments:true,spare:true};
  gulp.src(['./app/css/**/*.css', '!./app/lib/**'])
    .pipe(minifyCSS(opts))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('minify-js', function() {
  gulp.src(['./app/**/*.js', '!./app/lib/**'])
    .pipe(uglify({
      // inSourceMap:
      // outSourceMap: "app.js.map"
    }))
    .pipe(gulp.dest('./dist/'))
});

gulp.task('copy-html-files', function () {
  gulp.src('./app/**/*.html')
    .pipe(gulp.dest('dist/'));
});

gulp.task('icons', function() { 
    return gulp.src(config.bowerDir + '/fontawesome/fonts/**.*') 
        .pipe(gulp.dest('./public/fonts')); 
});

gulp.task('sprite', function () {
 
    var spriteData = gulp.src('.app/img/*.png')
        .pipe(spritesmith({
            imgName: 'todo-sprite.png',
            cssName: '_todo-sprite.scss',
            algorithm: 'top-down',
            padding: 5
        }));
 
    spriteData.css.pipe(gulp.dest('./dist'));
    spriteData.img.pipe(gulp.dest('./dist'))
});

gulp.task('sass', ['clean'], function() {  
    return gulp.src('./styles/*')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(cachebust.resources())
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest('./dist'));
});

gulp.task('css', function() { 
    return gulp.src(config.sassPath + '/style.scss')
         .pipe(sass({
             style: 'compressed',
             loadPath: [
                 './resources/sass',
                 config.bowerDir + '/bootstrap-sass-official/assets/stylesheets',
                 config.bowerDir + '/fontawesome/scss',
             ]
         }) 
            .on("error", notify.onError(function (error) {
                 return "Error: " + error.message;
             }))) 
         .pipe(gulp.dest('./public/css')); 
});

gulp.task('jshint', function() {  
    gulp.src('/js/*.js')
        .pipe(jshint())
        .pipe(jshint.reporter('default'));
});

gulp.task('javascript', function () {
  // set up the browserify instance on a task basis
  var b = browserify({
    entries: './entry.js',
    debug: true
  });

  return b.bundle()
    .pipe(source('app.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
        // Add transformation tasks to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/js/'));
});

gulp.task('build', [ 'clean','sass','build-template-cache', 'jshint', 'javascript'], function() {  
    return gulp.src('index.html')
        .pipe(cachebust.references())
        .pipe(gulp.dest('dist'));
});

// watch files for changes and reload
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  });

  gulp.watch(['*.html', 'css/**/*.css', 'js/**/*.js'], {cwd: 'app'}, reload);
});

