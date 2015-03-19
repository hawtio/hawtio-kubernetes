var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    eventStream = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    map = require('vinyl-map'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    uri = require('URIjs'),
    urljoin = require('url-join'),
    s = require('underscore.string'),
    hawtio = require('hawtio-node-backend');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  main: '.',
  ts: ['plugins/**/*.ts'],
  templates: ['plugins/**/*.html'],
  templateModule: pkg.name + '-templates',
  dist: './dist/',
  js: pkg.name + '.js',
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: true,
    noExternalResolve: false
  })
};

gulp.task('bower', function() {
  gulp.src('index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

/** Adjust the reference path of any typescript-built plugin this project depends on */
gulp.task('path-adjust', function() {
  gulp.src('libs/**/includes.d.ts')
    .pipe(map(function(buf, filename) {
      var textContent = buf.toString();
      var newTextContent = textContent.replace(/"\.\.\/libs/gm, '"../../../libs');
      // console.log("Filename: ", filename, " old: ", textContent, " new:", newTextContent);
      return newTextContent;
    }))
    .pipe(gulp.dest('libs'));
});

gulp.task('clean-defs', function() {
  return gulp.src('defs.d.ts', { read: false })
    .pipe(plugins.clean());
});

gulp.task('tsc', ['clean-defs'], function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.typescript(config.tsProject))
    .on('error', plugins.notify.onError({
      message: '#{ error.message }',
      title: 'Typescript compilation error'
    }));

    return eventStream.merge(
      tsResult.js
        .pipe(plugins.concat('compiled.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('.')),
      tsResult.dts
        .pipe(gulp.dest('d.ts')))
        .pipe(map(function(buf, filename) {
          if (!s.endsWith(filename, 'd.ts')) {
            return buf;
          }
          var relative = path.relative(cwd, filename);
          fs.appendFileSync('defs.d.ts', '/// <reference path="' + relative + '"/>\n');
          return buf;
        }));
});

gulp.task('template', ['tsc'], function() {
  return gulp.src(config.templates)
    .pipe(plugins.angularTemplatecache({
      filename: 'templates.js',
      root: 'plugins/',
      standalone: true,
      module: config.templateModule,
      templateFooter: '}]); hawtioPluginLoader.addModule("' + config.templateModule + '");'
    }))
    .pipe(gulp.dest('.'));
});

gulp.task('concat', ['template'], function() {
  return gulp.src(['compiled.js', 'templates.js'])
    .pipe(plugins.concat(config.js))
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', ['concat'], function() {
  return gulp.src(['templates.js', 'compiled.js', './site/'], { read: false })
    .pipe(plugins.clean());
});

gulp.task('watch', ['build'], function() {
  plugins.watch(['libs/**/*.js', 'libs/**/*.css', 'index.html', config.dist + '/*'], function() {
    gulp.start('reload');
  });
  plugins.watch(['libs/**/*.d.ts', config.ts, config.templates], function() {
    gulp.start(['tsc', 'template', 'concat', 'clean']);
  });
});

gulp.task('connect', ['watch'], function() {
  // lets disable unauthorised TLS issues with kube REST API
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  var kubeBase = process.env.KUBERNETES_MASTER || 'https://localhost:8443';
  var kube = uri(urljoin(kubeBase, 'api'));
  var osapi = uri(urljoin(kubeBase, 'osapi'));
  console.log("Connecting to Kubernetes on: " + kube);

  var staticAssets = [{
      path: '/',
      dir: '.'
  }];

  var dirs = fs.readdirSync('./libs');
  dirs.forEach(function(dir) {
    var dir = './libs/' + dir;
    console.log("dir: ", dir);
    if (fs.statSync(dir).isDirectory()) {
      console.log("Adding directory to search path: ", dir);
      staticAssets.push({
        path: '/',
        dir: dir
      });
    }
  });

  var localProxies = [];
  if (process.env.LOCAL_APP_LIBRARY === "true") {
    localProxies.push({
        proto: "http",
        port: "8588",
        hostname: "localhost",
        path: '/kubernetes/api/v1beta2/proxy/services/app-library',
        targetPath: "/"
      });
    console.log("because of $LOCAL_APP_LIBRARY being true we are using a local proxy for /kubernetes/api/v1beta2/proxy/services/app-library" );
  }
  if (process.env.LOCAL_FABRIC8_FORGE === "true") {
    localProxies.push({
        proto: "http",
        port: "8599",
        hostname: "localhost",
        path: '/kubernetes/api/v1beta2/proxy/services/fabric8-forge',
        targetPath: "/"
      });
    console.log("because of LOCAL_FABRIC8_FORGE being true we are using a local proxy for /kubernetes/api/v1beta2/proxy/services/fabric8-forge" );
  }
  if (process.env.LOCAL_GOGS_HOST) {
    var gogsPort = process.env.LOCAL_GOGS_PORT || "3000";
    //var gogsHostName = process.env.LOCAL_GOGS_HOST + ":" + gogsPort;
    var gogsHostName = process.env.LOCAL_GOGS_HOST;
    console.log("Using gogs host: " + gogsHostName);
    localProxies.push({
        proto: "http",
        port: gogsPort,
        hostname: gogsHostName,
        path: '/kubernetes/api/v1beta2/proxy/services/gogs-http-service',
        targetPath: "/"
      });
    console.log("because of LOCAL_GOGS_HOST being set we are using a local proxy for /kubernetes/api/v1beta2/proxy/services/gogs-http-service to point to http://"
    + process.env.LOCAL_GOGS_HOST + ":" + gogsPort);
  }
  var defaultProxies = [{
    proto: kube.protocol(),
    port: kube.port(),
    hostname: kube.hostname(),
    path: '/kubernetes/api',
    targetPath: kube.path()
  }, {
    proto: osapi.protocol(),
    port: osapi.port(),
    hostname: osapi.hostname(),
    path: '/kubernetes/osapi',
    targetPath: osapi.path()
  }, {
    proto: kube.protocol(),
    hostname: kube.hostname(),
    port: kube.port(),
    path: '/jolokia',
    targetPath: '/hawtio/jolokia'
  }, {
    proto: kube.protocol(),
    hostname: kube.hostname(),
    port: kube.port(),
    path: '/git',
    targetPath: '/hawtio/git'
  }];

  var staticProxies = localProxies.concat(defaultProxies);

  hawtio.setConfig({
    port: 9000,
    staticProxies: staticProxies,
    staticAssets: staticAssets,
    fallback: 'index.html',
    liveReload: {
      enabled: true
    }
  });
  var debugLoggingOfProxy = process.env.DEBUG_PROXY === "true";
  hawtio.use('/osconsole/config.js', function(req, res, next) {
    var configJs = 'window.OPENSHIFT_CONFIG = {' +
      ' auth: {' +
      '   oauth_authorize_uri: "' + urljoin(kubeBase, '/oauth/authorize')  + '",' +
      '   oauth_client_id: "fabric8-console",' +
      ' }' +
      '};';
    res.set('Content-Type', 'application/javascript');
    res.send(configJs);
  });
  hawtio.use('/', function(req, res, next) {
          var path = req.originalUrl;
          // avoid returning these files, they should get pulled from js
          if (s.startsWith(path, '/plugins/') && s.endsWith(path, 'html')) {
            console.log("returning 404 for: ", path);
            res.statusCode = 404;
            res.end();
          } else {
            if (debugLoggingOfProxy) {
              console.log("allowing: ", path);
            }
            next();
          }
        });
  hawtio.listen(function(server) {
    var host = server.address().address;
    var port = server.address().port;
    console.log("started from gulp file at ", host, ":", port);
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(hawtio.reload());
});

gulp.task('build', ['bower', 'path-adjust', 'tsc', 'template', 'concat', 'clean']);

gulp.task('site', ['clean', 'build'], function() {
  gulp.src(['index.html', 'css/**', 'images/**', 'img/**', 'libs/**', 'dist/**'], {base: '.'}).pipe(gulp.dest('site'));

  var dirs = fs.readdirSync('./libs');
  dirs.forEach(function(dir) {
    var path = './libs/' + dir + "/img";
    try {
      if (fs.statSync(path).isDirectory()) {
        console.log("found image dir: " + path);
        var pattern = 'libs/' + dir + "/img/**";
        gulp.src([pattern]).pipe(gulp.dest('site/img'));
      }
    } catch (e) {
      // ignore, file does not exist
    }
  });
});

gulp.task('default', ['connect']);



