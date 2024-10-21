# Use the official Python image as a parent image
FROM python:3.11-slim

# Set the timezone environment variable
ENV TZ=America/Toronto

# Install tzdata package for timezone data
RUN apt-get update && \
    apt-get install -y tzdata && \
    ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone    

# Set the working directory in the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt ./

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application code to the container
COPY . .

# Expose the port that your app runs on
EXPOSE 8080

# Specify the command to run your app
CMD ["python", "app.py"]
