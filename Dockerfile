FROM node:14
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN make
EXPOSE 80
WORKDIR /usr/src/app/dist
CMD ["node", "main.js"]