# 1) Build phase.

FROM node:latest

RUN npm install -g yarn
RUN npm install -g nodemon

# Create app directory
WORKDIR /usr/app

# Install app dependencies
COPY package.json .

RUN yarn install

COPY . .

EXPOSE 4000

CMD [ "yarn", "start" ]
