FROM node as builder
WORKDIR /
COPY package.json tsconfig.json $WORKDIR
ADD ./src $WORKDIR/src
RUN yarn install && yarn run build

FROM node
WORKDIR /app
COPY --from=builder /dist/ ./dist
COPY --from=builder ./node_modules ./node_modules
EXPOSE 3000 
CMD [ "node", "./dist/index.js" ]
