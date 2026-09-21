pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '786830914319'
        BACKEND_REPO = 'grocery-backend-repository'
        FRONTEND_REPO = 'grocery-frontend-repository'
        EKS_CLUSTER = 'Rangesh-freshcart-cluster'
        NAMESPACE = 'freshcart'
    }

    options {
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 60, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Backend') {
            steps {
                sh 'cd backend && mvn clean package -DskipTests'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh '''
                  docker build -t ${BACKEND_REPO}:${BUILD_NUMBER} ./backend
                  docker build -t ${FRONTEND_REPO}:${BUILD_NUMBER} ./frontend
                '''
            }
        }

        stage('Login to ECR') {
            steps {
                sh '''
                  aws ecr get-login-password --region ${AWS_REGION} |
                  docker login --username AWS --password-stdin ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                  docker tag ${BACKEND_REPO}:${BUILD_NUMBER} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_REPO}:${BUILD_NUMBER}
                  docker tag ${FRONTEND_REPO}:${BUILD_NUMBER} ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}:${BUILD_NUMBER}

                  docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${BACKEND_REPO}:${BUILD_NUMBER}
                  docker push ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${FRONTEND_REPO}:${BUILD_NUMBER}
                '''
            }
        }

        stage('Deploy to EKS') {
            steps {
                sh '''
                  aws eks update-kubeconfig --region ${AWS_REGION} --name ${EKS_CLUSTER}

                  sed "s#IMAGE_TAG#${BUILD_NUMBER}#g; s#ACCOUNT_ID#${AWS_ACCOUNT_ID}#g" k8s/backend-deployment.yaml | kubectl apply -f -
                  sed "s#IMAGE_TAG#${BUILD_NUMBER}#g; s#ACCOUNT_ID#${AWS_ACCOUNT_ID}#g" k8s/frontend-deployment.yaml | kubectl apply -f -

                  kubectl apply -f k8s/ingress.yaml
                  kubectl rollout status deployment/backend -n ${NAMESPACE} --timeout=180s
                  kubectl rollout status deployment/frontend -n ${NAMESPACE} --timeout=180s
                '''
            }
        }

        stage('Verify') {
            steps {
                sh '''
                  kubectl get pods -n ${NAMESPACE}
                  kubectl get svc -n ${NAMESPACE}
                  kubectl get ingress -n ${NAMESPACE}
                '''
            }
        }
    }
}
