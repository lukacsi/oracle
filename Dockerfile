FROM nginxinc/nginx-unprivileged:alpine
COPY --chown=101:101 index.html /usr/share/nginx/html/
COPY --chown=101:101 css/ /usr/share/nginx/html/css/
COPY --chown=101:101 js/ /usr/share/nginx/html/js/
COPY --chown=101:101 data/ /usr/share/nginx/html/data/
