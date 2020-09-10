let gulp = require('gulp');
let ts = require('gulp-typescript');
let sourcemaps = require('gulp-sourcemaps');
// let uglify = require('gulp-uglify-es').default;
let tsProject = ts.createProject('tsconfig.json');

const options = {
	js: ['src/**/*.ts', 'src/**/*.js'],
	web: ['src/*.html', 'src/**/*.html', 'src/*.css', 'src/**/*.css']
};

gulp.task('ts', function () {
	return tsProject
			.src()
			.pipe(sourcemaps.init({ loadMaps: true }))
			.pipe(tsProject()).js
			// .pipe(uglify())
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest('dist'));
});

gulp.task('copy-web', function () {
	return gulp.src(options.web).pipe(gulp.dest('dist'));
});

gulp.task('watch', function(){
	gulp.watch(options.js, gulp.parallel('ts'));
	gulp.watch(options.web, gulp.parallel('copy-web'));
});

gulp.task('default', gulp.series(gulp.parallel('copy-web'), gulp.parallel('ts')));