FROM gliderlabs/alpine:3.1
MAINTAINER Jimmi Dyson <jimmidyson@gmail.com>
ENTRYPOINT ["/kuisp"]
CMD [ "-p", "9000", "-c", "/site/osconsole/config.js.tmpl=/site/osconsole/config.js", "-s", "/kubernetes/api/=https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}/api/", "-s", "/kubernetes/osapi/=https://${KUBERNETES_SERVICE_HOST}:${KUBERNETES_SERVICE_PORT}/osapi/", "--skip-cert-validation", "--default-page=/index.html" ]
EXPOSE 9000

ENV KUISP_VERSION 0.4

RUN apk-install ca-certificates curl tar && \
    curl -L https://github.com/jimmidyson/kuisp/releases/download/v${KUISP_VERSION}/kuisp-${KUISP_VERSION}-linux-amd64.tar.gz | \
      tar xzv && \
    apk del curl tar

COPY site /site/
RUN chown nobody:nobody /site/osconsole/

WORKDIR /site/
USER nobody
