# Stage 1: Dependencies
FROM node:21 AS depsbuilder

# Set the working directory in the container
WORKDIR /app

# Copy only the package files to install dependencies
COPY package.json package-lock.json /app/

# Install the dependencies
RUN npm install

# Stage 2: Build
FROM node:21

# Set the working directory in the container
WORKDIR /app

# Copy application files and configuration
COPY app /app/app
COPY components /app/components
COPY lib /app/lib
COPY public /app/public
COPY tsconfig.json /app
COPY components.json /app
COPY next.config.mjs /app
COPY tailwind.config.ts /app
COPY postcss.config.mjs /app
COPY package.json package-lock.json /app/

# Copy installed node_modules from the depsbuilder stage
COPY --from=depsbuilder /app/node_modules /app/node_modules

# Build the application
RUN npm run build

# Expose the port that your app runs on
EXPOSE 3000
