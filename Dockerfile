FROM jimmidyson/k8s-proxy:latest

MAINTAINER Jimmi Dyson <jimmidyson@gmail.com>

ADD site /site/

CMD ["--insecure", "-w", "/site", "--api-prefix=/kubernetes/api/", "--404=/index.html"]
