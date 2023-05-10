FROM node:19-alpine

ENV NODE_ENV development

WORKDIR /home/node/app
COPY package.json .
COPY package-lock.json .

# Install dependencies
RUN npm i -g wrangler
RUN npm i

# Copy the rest of the application code
VOLUME [ "/home/node/app" ]

EXPOSE 8787

# Set the default command to run when the container starts
CMD ["npm", "start", "--", "--local"]
