FROM jimmidyson/k8s-proxy:latest

MAINTAINER Jimmi Dyson <jimmidyson@gmail.com>

ADD site /site/

# lets add default env vars so the docker image is a little easier to run directly on the command line
ENV KUBERNETES_TRUST_CERT true
ENV PROXY_DISABLE_CERT_VALIDATION true
ENV KUBERNETES_SERVICE_HOST localhost
ENV KUBERNETES_SERVICE_PORT 8443

CMD ["--insecure", "-w", "/site", "--api-prefix=/kubernetes/api/", "--osapi-prefix=/kubernetes/osapi/", "--404=/index.html"]
