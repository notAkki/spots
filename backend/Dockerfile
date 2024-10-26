# Use the official Python image as a parent image Stage 1
FROM python:3.10.12-slim-bullseye as pybuilder

# Set the timezone environment variable
ENV TZ=America/Toronto

# Install tzdata and Chromium with its driver
RUN apt-get update && \
    apt-get install -y tzdata wget gnupg unzip libnss3 libxss1 libappindicator1 \
    fonts-liberation libasound2 libatk-bridge2.0-0 libgtk-3-0 xdg-utils chromium \
    chromium-driver && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

# Set the working directory in the builder
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt ./

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Use a slim Python image for the final build Stage 2
FROM python:3.10.12-slim-bullseye

# Set the timezone environment variable
ENV TZ=America/Toronto

# Set the working directory in the final image
WORKDIR /app

# Install Chromium and its driver
RUN apt-get update && \
    apt-get install -y chromium chromium-driver

# Copy the installed dependencies from the builder stage
COPY --from=pybuilder /usr/local/lib/python3.10/site-packages /usr/local/lib/python3.10/site-packages
COPY --from=pybuilder /usr/local/bin /usr/local/bin
COPY --from=pybuilder /etc/localtime /etc/localtime
COPY --from=pybuilder /etc/timezone /etc/timezone

# Copy the rest of your application code to the container
COPY spots /app/spots

# Expose the port that your app runs on
EXPOSE 8080

# Specify the command to run your app
CMD ["python", "-m", "spots.app"]
