# Restaurant Management Service

A distributed system for restaurant management, order processing, and food delivery.

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas account)
- npm or yarn
- Docker and Docker Compose
- Kubernetes (minikube, kind, or a managed Kubernetes service)

### Installation

1. Clone the repository
2. Install dependencies:
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Configuration

1. Create `.env` file in the server directory with the following variables:

## Microservices Architecture

The application is designed using a microservices architecture with the following components:

### Services

1. **API Gateway** - Entry point for all client requests, routes to appropriate microservices
2. **Auth Service** - Handles user authentication and authorization
3. **Restaurant Service** - Manages restaurant data and menus
4. **Order Service** - Processes and tracks customer orders
5. **Admin Service** - Provides administrative capabilities

### Running with Docker Compose

```bash
# Start all services
docker-compose up

# Build and start services
docker-compose up --build

# Run in background
docker-compose up -d

# Stop all services
docker-compose down
```

### Deploying to Kubernetes

```bash
# Apply Kubernetes configurations
kubectl apply -f kubernetes/secrets.yaml
kubectl apply -f kubernetes/mongodb-deployment.yaml
kubectl apply -f kubernetes/microservices.yaml
kubectl apply -f kubernetes/api-gateway.yaml
kubectl apply -f kubernetes/ingress.yaml

# Check status
kubectl get pods
kubectl get services
```

### Service Communication

Services communicate with each other using REST APIs through the internal Kubernetes network. The API Gateway provides a single entry point for client applications.
