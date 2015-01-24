## hawtio-kubernetes

This plugin provides a [Kubernetes](http://kubernetes.io/) console for hawtio

### Basic usage

#### Running this plugin locally

First clone the source

    git clone https://github.com/hawtio/hawtio-kubernetes.git
    cd hawtio-kubernetes

Next you'll need to [install NodeJS](http://nodejs.org/download/) and then install the default global npm dependencies:

    npm install -g bower gulp slush slush-hawtio-javascript slush-hawtio-typescript typescript

Then install all local nodejs packages and update bower dependencies via:

    npm install
    bower update

Then to run the web application:

    gulp

The build uses the $KUBERNETES_MASTER environment variable to connect to Kubernetes

#### Install the bower package

`bower install --save hawtio-kubernetes`