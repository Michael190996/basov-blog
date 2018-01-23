FROM node:9

ADD . /workspace
WORKDIR /workspace

RUN npm run build
RUN rm -r src bower_components

CMD sh run_docker.sh