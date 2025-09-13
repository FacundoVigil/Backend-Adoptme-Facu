# Adoptme Backend


## Imagen en Docker Hub
**Nombre:** `vtvrffzs23/adoptme-backend:1.0.0`  
**Link:** https://hub.docker.com/r/vtvrffzs23/adoptme-backend/tags


## Cómo correr con Docker
docker pull vtvrffzs23/adoptme-backend:1.0.0

docker run --name adoptme -p 8080:8080 \
  -e MONGO_URL="mongodb+srv://<user>:<pass>@<cluster>/?retryWrites=true&w=majority" \
  -e DB_NAME="adoptme" \
  -e JWT_SECRET="supersecret" \
  vtvrffzs23/adoptme-backend:1.0.0
