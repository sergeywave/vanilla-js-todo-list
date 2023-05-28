"use strict"

const { src, dest } = require("gulp")
const gulp = require("gulp")
const autoprefixer = require("gulp-autoprefixer")
const cssbeautify = require("gulp-cssbeautify");
const removeComments = require('gulp-strip-css-comments');
const rename = require("gulp-rename");
const rigger = require("gulp-rigger")
const sass = require("gulp-sass")(require('sass'));
const cssnano = require("gulp-cssnano");
const uglify = require("gulp-uglify");
const plumber = require("gulp-plumber");
const imagemin = require("gulp-imagemin");
const del = require("del");
const notify = require("gulp-notify")
const imagewebp = require("gulp-webp")
const browserSync = require("browser-sync").create();

/* Paths */
const srcPath = "src/"
const distPath = "dist/"


const path = {
    build: {
        html: distPath,
        css: distPath + "css/",
        js: distPath + "js/",
        images: distPath + "img/",
        fonts: distPath + "fonts/"
    },
    src: {
        html: srcPath + "*.html",
        css: srcPath + "scss/*.{scss,css}",
        js: srcPath + "js/*.js",
        images: srcPath + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "fonts/**/*.{eot,woff,woff2,ttf,svg}",
        json: srcPath + "*.json",
    },
    watch: {
        html: srcPath + "**/*.html",
        js: srcPath + "js/**/*.js",
        css: srcPath + "scss/**/*.scss",
        images: srcPath + "img/**/*.{jpg,png,svg,gif,ico,webp,webmanifest,xml,json}",
        fonts: srcPath + "fonts/**/*.{eot,woff,woff2,ttf,svg}",
        json: srcPath + "*.json",
    },
    clean: "./" + distPath
}

function serve() {
    browserSync.init({
        server: {
            baseDir: "./" + distPath
        },
        notify: false,
        browser: 'firefox',
        startPath: "index.html"
    });
}

function otherFiles() {
    return src(path.src.json, { base: srcPath })
        .pipe(dest(path.build.html))
}



function html() {
    return src(path.src.html, { base: srcPath })
        .pipe(plumber())
        .pipe(dest(path.build.html))
        .pipe(browserSync.reload({ stream: true }));
}

function css() {
    return src(path.src.css, { base: srcPath + "scss/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "SCSS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(sass())
        .pipe(autoprefixer('last 10 versions'))
        .pipe(cssbeautify())
        .pipe(dest(path.build.css))
        .pipe(cssnano({
            zindex: false,
            discardComments: {
                removeAll: true
            }
        }))
        .pipe(removeComments())
        .pipe(rename({
            suffix: ".min",
            extname: ".css"
        }))
        .pipe(dest(path.build.css))
        .pipe(browserSync.reload({ stream: true }));
}

function js() {
    return src(path.src.js, { base: srcPath + "js/" })
        .pipe(plumber({
            errorHandler: function (err) {
                notify.onError({
                    title: "JS Error",
                    message: "Error: <%= error.message %>"
                })(err);
                this.emit('end');
            }
        }))
        .pipe(rigger())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(rename({
            suffix: ".min",
            extname: ".js"
        }))
        .pipe(dest(path.build.js))
        .pipe(browserSync.reload({ stream: true }));
}

function images() {
    return src(path.src.images, { base: srcPath + "img/" })
        .pipe(dest(path.build.images))
        .pipe(browserSync.reload({ stream: true }));
}

function webpImages() {
    return src(path.src.images, { base: srcPath + "img/" })
        .pipe(imagewebp())
        .pipe(dest(path.build.images))
}

function fonts() {
    return src(path.src.fonts, { base: srcPath + "fonts/" })
        .pipe(dest(path.build.fonts))
        .pipe(browserSync.reload({ stream: true }));
}

function clean() {
    return del(path.clean)
}

gulp.task('moveLocalFiles', function() {
    return gulp.src('src/local/*')
      .pipe(gulp.dest('dist/local'));
});

function watchFiles() {
    gulp.watch([path.watch.html], html)
    gulp.watch([path.watch.css], css)
    gulp.watch([path.watch.js], js)
    gulp.watch([path.watch.images], images)
    gulp.watch([path.watch.fonts], fonts)
    gulp.watch([path.watch.json], otherFiles)
}

const build = gulp.series(clean, gulp.parallel(html, css, js, fonts, images, otherFiles))
const watch = gulp.parallel(watchFiles, serve)


exports.otherFiles = otherFiles
exports.html = html
exports.css = css
exports.js = js
exports.images = images
exports.webpImages = webpImages
exports.fonts = fonts
exports.clean = clean
exports.build = build
exports.watch = watch
exports.default = watch