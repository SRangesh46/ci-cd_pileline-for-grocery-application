# FreshCart - Spring Boot 3-Tier Application on Amazon EKS

This project keeps the original FreshCart grocery application's frontend and database model, but replaces the Node.js/Express application tier with Spring Boot.

## Architecture

User -> AWS ALB -> Kubernetes Ingress

- `/` -> Frontend Service -> Frontend Pods (Nginx/static HTML/CSS/JS)
- `/api` -> Backend Service -> Spring Boot Pods
- Spring Boot -> Amazon RDS MySQL

CI/CD:
GitHub -> Jenkins -> Maven -> Docker -> ECR -> EKS

## Local prerequisites

- Java 17
- Maven 3.9+
- Docker
- MySQL 8.x
- kubectl
- AWS CLI
- An EKS cluster and AWS Load Balancer Controller for the AWS deployment

## Local database

Run:
```bash
mysql -u root -p < database/schema.sql
```

## Local Spring Boot backend

Linux/macOS:
```bash
export DB_HOST=localhost
export DB_PORT=3306
export DB_NAME=grocery_db
export DB_USER=root
export DB_PASSWORD=YOUR_PASSWORD
export JWT_SECRET='use-a-long-random-secret'
cd backend
mvn spring-boot:run
```

Windows PowerShell:
```powershell
$env:DB_HOST="localhost"
$env:DB_PORT="3306"
$env:DB_NAME="grocery_db"
$env:DB_USER="root"
$env:DB_PASSWORD="YOUR_PASSWORD"
$env:JWT_SECRET="use-a-long-random-secret"
cd backend
mvn spring-boot:run
```

Backend runs on:
`http://localhost:8080`

Test:
```bash
curl http://localhost:8080/api/health
curl http://localhost:8080/api/products
```

## Local frontend

Because `frontend/js/config.js` uses `/api`, the easiest local test is to serve the frontend through Nginx with a proxy to Spring Boot. Alternatively change API_BASE_URL to `http://localhost:8080/api` temporarily and open the static site.

For a simple temporary test:
```js
const API_BASE_URL = "http://localhost:8080/api";
```

Then serve:
```bash
cd frontend
python3 -m http.server 5500
```

Open:
`http://localhost:5500`

## AWS deployment

### 1. Create RDS MySQL

Create:
- DB: `grocery_db`
- Port: `3306`
- Private subnet group
- Security group allowing 3306 only from the EKS application/network security group

Import the schema:
```bash
mysql -h YOUR_RDS_ENDPOINT -u admin -p < database/schema.sql
```

Do NOT make RDS publicly accessible just to make the demo work.

### 2. Create ECR repositories

```bash
aws ecr create-repository --repository-name freshcart-backend --region us-east-1
aws ecr create-repository --repository-name freshcart-frontend --region us-east-1
```

### 3. Prepare EKS

Ensure:
- EKS cluster exists
- kubectl access works
- AWS Load Balancer Controller is installed
- its IAM role/IRSA is configured
- worker nodes/pods can reach RDS

### 4. Create namespace

```bash
kubectl apply -f k8s/namespace.yaml
```

### 5. Create database Secret

Edit `k8s/db-secret.yaml` and replace:
- DB_USER
- DB_PASSWORD
- JWT_SECRET

Then:
```bash
kubectl apply -f k8s/db-secret.yaml
```

### 6. Build and push images manually first

From the project root:
```bash
docker build -t freshcart-backend ./backend
docker build -t freshcart-frontend ./frontend
```

Tag and push using your AWS account ID:
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

docker tag freshcart-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/freshcart-backend:1
docker tag freshcart-frontend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/freshcart-frontend:1

docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/freshcart-backend:1
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/freshcart-frontend:1
```

### 7. Deploy backend

Before applying, edit `k8s/backend-deployment.yaml`:
- ACCOUNT_ID
- YOUR_RDS_ENDPOINT

Then:
```bash
kubectl apply -f k8s/backend-deployment.yaml
kubectl get pods -n freshcart
kubectl logs deployment/backend -n freshcart
```

### 8. Deploy frontend

Edit the ECR image in `k8s/frontend-deployment.yaml`, then:
```bash
kubectl apply -f k8s/frontend-deployment.yaml
```

### 9. Deploy Ingress

```bash
kubectl apply -f k8s/ingress.yaml
kubectl get ingress -n freshcart
```

Wait for the ALB hostname:
```bash
kubectl get ingress freshcart-ingress -n freshcart -w
```

Open the ALB address in a browser.

### 10. Test

```bash
curl http://ALB-DNS/api/health
curl http://ALB-DNS/api/products
```

Open:
`http://ALB-DNS/`

Then:
1. Register
2. Login
3. Browse products
4. Add to cart
5. Checkout
6. Open My Orders

## CI/CD

Configure a Jenkins agent with:
- Java 17
- Maven
- Docker
- AWS CLI
- kubectl

Prefer an IAM role on the Jenkins EC2 instance rather than long-lived AWS access keys.

Create Jenkins pipeline from this repository and use the included `Jenkinsfile`.

Update:
- `AWS_ACCOUNT_ID`
- `EKS_CLUSTER`

The pipeline:
1. Checks out GitHub
2. Builds Spring Boot with Maven
3. Builds frontend/backend Docker images
4. Logs in to ECR
5. Pushes both images with BUILD_NUMBER
6. Updates EKS deployments
7. Waits for rollout
8. Prints pods/services/Ingress

## Important production improvements

For a real production system:
- Store secrets in AWS Secrets Manager or another managed secret solution.
- Use HTTPS/ACM on the ALB.
- Restrict RDS to private subnets.
- Add DB connection pooling and monitoring.
- Add proper Spring Security authentication/authorization.
- Add database migrations with Flyway or Liquibase.
- Add automated tests.
- Add HPA and resource requests/limits.
- Do not expose admin product endpoints without authorization.
