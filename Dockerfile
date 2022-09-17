FROM node:12-alpine

# this is a hack to obmit a lhci error that occurs because its run in a docker container
ENV LHCI_BUILD_CONTEXT__CURRENT_BRANCH null

# install dependencies
WORKDIR /opt/app

# install yarn
COPY package.json yarn.lock ./
RUN yarn install --network-timeout 1000000

# install lighthouse
RUN yarn global add @lhci/cli@0.3.x

# install serve
RUN yarn global add serve

# Update APK
RUN apk update

# Install Chrome
RUN apk add chromium

COPY . /opt/app

ENV PORT 80
EXPOSE 80

# build React App
RUN yarn build

# By default launch serve
CMD yarn serve

