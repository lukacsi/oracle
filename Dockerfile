FROM nginxinc/nginx-unprivileged:alpine
COPY --chown=101:101 index.html css js data /usr/share/nginx/html/
