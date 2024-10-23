# Spots Frontend

## Local Development

1. Install Docker and Docker Compose.
2. Run `make build up-dev` to start the frontend and backend services.

### Environment Variables

- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`: Mapbox access token.
- `NEXT_PUBLIC_MAPBOX_STYLE_URL`: Mapbox style URL.
- `API_URL`: API URL.

Copy these into a `.env` file in the frontend directory using `.env.example` as a template.

```bash
cp .env.example .env
```