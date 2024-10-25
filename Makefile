build:
	docker-compose build

up:
	docker-compose -f docker-compose.yaml up -d

up-dev:
	docker-compose -f docker-compose.yaml -f docker-compose.dev.yaml up -d

