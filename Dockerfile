FROM node:18-alpine
WORKDIR /app

# copy lockfile first for better caching
COPY package*.json ./
COPY package-lock.json ./

# allow legacy peer deps to avoid ERESOLVE during build
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# install production deps reproducibly
RUN npm ci --omit=dev

# copy app sources
COPY . .

EXPOSE 3000
CMD ["npm", "start"]
