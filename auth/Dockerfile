FROM node:alpine

WORKDIR /app
COPY package.json .

# Omit devDependencies from container
RUN npm install --omit=dev
COPY . .

CMD ["npm", "start"]
