var gulp = require('gulp'),
    wiredep = require('wiredep').stream,
    eventStream = require('event-stream'),
    gulpLoadPlugins = require('gulp-load-plugins'),
    fs = require('fs'),
    path = require('path'),
    url = require('url'),
    uri = require('urijs'),
    urljoin = require('url-join'),
    s = require('underscore.string'),
    stringifyObject = require('stringify-object'),
    hawtio = require('hawtio-node-backend'),
    argv = require('yargs').argv,
    del = require('del');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  main: '.',
  ts: ['plugins/**/*.ts'],
  less: ['plugins/**/*.less'],
  templates: ['plugins/**/*.html'],
  templateModule: pkg.name + '-templates',
  dist: argv.out || './dist/',
  js: pkg.name + '.js',
  css: pkg.name + '.css',
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: true,
    noExternalResolve: false
  })
};

gulp.task('bower', function() {
  return gulp.src('index.html')
    .pipe(wiredep({}))
    .pipe(gulp.dest('.'));
});

/** Adjust the reference path of any typescript-built plugin this project depends on */
gulp.task('path-adjust', function() {
  return gulp.src('libs/**/includes.d.ts')
    .pipe(plugins.replace(/"\.\.\/libs/gm, '"../../../libs'))
    .pipe(gulp.dest('libs'));
});

gulp.task('clean-defs', function() {
  return del('defs.d.ts');
});

gulp.task('tsc', ['clean-defs'], function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.sourcemaps.init())
    .pipe(plugins.typescript(config.tsProject))
    .on('error', plugins.notify.onError({
      onLast: true,
      message: '<%= error.message %>',
      title: 'Typescript compilation error'
    }));

    return eventStream.merge(
      tsResult.js
        .pipe(plugins.concat('compiled.js'))
        .pipe(plugins.sourcemaps.write())
        .pipe(gulp.dest('.')),
      tsResult.dts
        .pipe(gulp.dest('d.ts')))
        .pipe(plugins.filter('**/*.d.ts'))
        .pipe(plugins.concatFilenames('defs.d.ts', {
          root: cwd,
          prepend: '/// <reference path="',
          append: '"/>'
        }))
        .pipe(gulp.dest('.'));
});

gulp.task('less', function () {
  return gulp.src(config.less)
    .pipe(plugins.less({
      paths: [ path.join(__dirname, 'less', 'includes') ]
    }))
    .on('error', plugins.notify.onError({
      onLast: true,
      message: '<%= error.message %>',
      title: 'less file compilation error'
    }))
    .pipe(plugins.concat(config.css))
    .pipe(gulp.dest(config.dist));
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
    .pipe(plugins.ngAnnotate())
    .pipe(gulp.dest(config.dist));
});

gulp.task('clean', ['concat'], function() {
  return del(['templates.js', 'compiled.js', './site/']);
});

gulp.task('watch-less', function() {
  plugins.watch(config.less, function() {
    gulp.start('less');
  });
});

gulp.task('watch', ['build', 'watch-less'], function() {
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
  console.log("==== using KUBERNETES URL: " + kubeBase);
  var kube = uri(urljoin(kubeBase, 'api'));
  var kubeapis = uri(urljoin(kubeBase, 'apis'));
  var oapi = uri(urljoin(kubeBase, 'oapi'));
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
        path: '/api/v1/proxy/namespaces/default/services/app-library',
        targetPath: "/"
      });
    console.log("because of $LOCAL_APP_LIBRARY being true we are using a local proxy for /api/v1/proxy/namespaces/default/services/app-library" );
  }
  if (process.env.LOCAL_FABRIC8_FORGE === "true") {
    localProxies.push({
        proto: "http",
        port: "8080",
        hostname: "localhost",
        path: '/api/v1/proxy/namespaces/default/services/fabric8-forge',
        targetPath: "/"
      });
    console.log("because of LOCAL_FABRIC8_FORGE being true we are using a local proxy for /api/v1/proxy/namespaces/default/services/fabric8-forge" );
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
        path: '/kubernetes/api/v1/proxy/services/gogs-http-service',
        targetPath: "/"
      });
    console.log("because of LOCAL_GOGS_HOST being set we are using a local proxy for /kubernetes/api/v1/proxy/services/gogs-http-service to point to http://"
    + process.env.LOCAL_GOGS_HOST + ":" + gogsPort);
  }
  if (process.env.LOCAL_JENKINSHIFT) {
    var jenkinshiftPort = process.env.LOCAL_JENKINSHIFT_PORT || "9090";
    var jenkinshiftHost = process.env.LOCAL_JENKINSHIFT;
    console.log("Using jenkinshift host: " + jenkinshiftHost);
    var proxyPath = '/api/v1/proxy/namespaces/default/services/templates/oapi/v1';
    console.log("Using jenkinshift host: " + jenkinshiftHost);
    localProxies.push({
        proto: "http",
        port: jenkinshiftPort,
        hostname: jenkinshiftHost,
        path: proxyPath,
        targetPath: "/oapi/v1"
      });
    localProxies.push({
        proto: "http",
        port: jenkinshiftPort,
        hostname: jenkinshiftHost,
        path: "/oapi/v1",
        targetPath: "/oapi/v1"
      });
    console.log("because of LOCAL_JENKINSHIFT being set we are using a local proxy for " + proxyPath + " to point to http://"
    + jenkinshiftHost + ":" + jenkinshiftPort);
  }
  var defaultProxies = [{
    proto: kube.protocol(),
    port: kube.port(),
    hostname: kube.hostname(),
    path: '/kubernetes/api',
    targetPath: kube.path()
  }, {
    proto: kubeapis.protocol(),
    port: kubeapis.port(),
    hostname: kubeapis.hostname(),
    path: '/apis',
    targetPath: kubeapis.path()
  }, {
    proto: oapi.protocol(),
    port: oapi.port(),
    hostname: oapi.hostname(),
    path: '/kubernetes/oapi',
    targetPath: oapi.path()
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
    port: process.env.DEV_PORT || 9000,
    staticProxies: staticProxies,
    staticAssets: staticAssets,
    fallback: 'index.html',
    liveReload: {
      enabled: true
    }
  });
  var debugLoggingOfProxy = process.env.DEBUG_PROXY === "true";
  var useAuthentication = process.env.DISABLE_OAUTH !== "true";

  var googleClientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  var googleClientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;

  hawtio.use('/osconsole/config.js', function(req, res, next) {
    var config = {
      api: {
        openshift: {
          proto: oapi.protocol(),
          hostPort: oapi.host(),
          prefix: oapi.path()
        },
        k8s: {
          proto: kube.protocol(),
          hostPort: kube.host(),
          prefix: kube.path()
        }
      }
    };
    if (googleClientId && googleClientSecret) {
      config.master_uri = kubeBase;
      config.google = {
         clientId: googleClientId,
         clientSecret: googleClientSecret,
         authenticationURI: "https://accounts.google.com/o/oauth2/auth",
         authorizationURI: "https://accounts.google.com/o/oauth2/auth",
         scope: "profile",
         redirectURI: "http://localhost:9000"
      };

    } else if (useAuthentication) {
      config.master_uri = kubeBase;
      config.openshift = {
        oauth_authorize_uri: urljoin(kubeBase, '/oauth/authorize'),
        oauth_client_id: 'fabric8'
      };
    }
    var answer = "window.OPENSHIFT_CONFIG = window.HAWTIO_OAUTH_CONFIG = " + stringifyObject(config);
    res.set('Content-Type', 'application/javascript');
    res.send(answer);
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

gulp.task('build', ['bower', 'path-adjust', 'tsc', 'less', 'template', 'concat', 'clean']);

gulp.task('site', ['clean', 'build'], function() {
  gulp.src(['index.html', 'osconsole/config.js.tmpl', 'css/**', 'images/**', 'img/**', 'libs/**', 'dist/**'], {base: '.'}).pipe(gulp.dest('site'));

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



