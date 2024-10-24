build:
	docker-compose build

build-force:
	docker-compose build --no-cache	

up:
	docker-compose -f docker-compose.yaml up -d

up-dev:
	docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d

down:
	docker-compose down

