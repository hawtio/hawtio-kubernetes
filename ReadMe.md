## hawtio-kubernetes [![Circle CI](https://circleci.com/gh/hawtio/hawtio-kubernetes.svg?style=svg)](https://circleci.com/gh/hawtio/hawtio-kubernetes)

This plugin provides a [Kubernetes](http://kubernetes.io/) console for hawtio

![controllers tab screenshot](http://fabric8.io/v2/images/controllers.png)

### Running

#### Running a release

If you have a [Kubernetes](http://kubernetes.io/) or [OpenShift](http://www.openshift.org/) environment, the easiest way to try out this console is to just run the app directly in kubernetes via [these instructions](http://fabric8.io/v2/console.html#running-the-console-on-kubernetesopenshift)

Or you can try running the [fabric8/hawtio-kubernetes docker image](https://registry.hub.docker.com/u/fabric8/hawtio-kubernetes/):

    docker pull fabric8/hawtio-kubernetes
    docker run -it -p 9090:9090 -e KUBERNETES_SERVICE_HOST=$DOCKER_IP fabric8/hawtio-kubernetes

Where **DOCKER_IP** is the IP address or host running the kubernetes master.

#### Running this plugin locally

First clone the source

    git clone https://github.com/hawtio/hawtio-kubernetes.git
    cd hawtio-kubernetes

Next you'll need to [install NodeJS](http://nodejs.org/download/) and then install the default global npm dependencies:

    npm install -g bower gulp slush slush-hawtio-javascript slush-hawtio-typescript typescript

Then install all local nodejs packages and update bower dependencies via:

    npm install
    bower update

Next you need to setup the **KUBERNETES_MASTER** environment variable to point to the kubernetes master you want to run against. e.g.

    export KUBERNETES_MASTER=https://$DOCKER_IP:8443

Where **DOCKER_IP** is the IP address or host running the kubernetes master.

If you need to disable OAUTH authentication in development try use **DISABLE_OAUTH**:

    export DISABLE_OAUTH=true

Then to run the web application:

    gulp

#### Install the bower package

`bower install --save hawtio-kubernetes`

#### Output build to a different directory

When developing this plugin in a dependent console you can change the output directory where the compiled .js and .css go.  Just use the 'out' flag to set a different output directory, for example:

`gulp watch --out=../fabric8-console/libs/hawtio-kubernetes/dist/`

Whenever the build completes the compiled .js file will be put into the target directory.  Don't forget to first do a `gulp build` without this flag before committing changes!

