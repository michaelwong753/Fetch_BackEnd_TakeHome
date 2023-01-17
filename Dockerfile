FROM node:16

WORKDIR /take_home_michael_wong

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 3000
CMD [ "npm", "start" ]
