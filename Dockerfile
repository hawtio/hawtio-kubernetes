FROM centos:centos7
MAINTAINER Jimmi Dyson <jimmidyson@gmail.com>
ENTRYPOINT ["/kuisp"]
CMD [ "-p", "9090", \
      "-c", "/site/osconsole/config.js.tmpl=/site/osconsole/config.js", \
      "-s", "/kubernetes/api/v1beta2/proxy/services/app-library/=http://${APP_LIBRARY_SERVICE_HOST}:${APP_LIBRARY_SERVICE_PORT}/", \
      "-s", "/kubernetes/api/v1beta2/proxy/services/app-library-jolokia/=http://${APP_LIBRARY_JOLOKIA_SERVICE_HOST}:${APP_LIBRARY_JOLOKIA_SERVICE_PORT}/", \
      "-s", "/kubernetes/api/=https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}/api/", \
      "-s", "/kubernetes/osapi/=https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}/osapi/", \
      "--skip-cert-validation", \
      "--default-page=/index.html", \
      "--max-age=24h", \
      "--compress" ]
EXPOSE 9000

ENV KUISP_VERSION 0.9

RUN yum install -y tar && \
    yum clean all && \
    curl -L https://github.com/jimmidyson/kuisp/releases/download/v${KUISP_VERSION}/kuisp-${KUISP_VERSION}-linux-amd64.tar.gz | \
      tar xzv

COPY site /site/
RUN chown nobody:nobody /site/osconsole/

WORKDIR /site/
USER nobody
