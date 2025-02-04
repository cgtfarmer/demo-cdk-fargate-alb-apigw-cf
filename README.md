# CDK Fargate ALB APIGW CloudFront Demo

This is a demo showing how to deploy a simple Express API to ECS Fargate, load balanced by a private Application Load Balancer, served by an API Gateway (HTTP API) which can only be accessed through CloudFront, due to the Lambda Authorizer

![LessonGraphics-CF-Lambda-Auth-Fargate](https://github.com/cgtfarmer/demo-cdk-fargate-alb-apigw-cf/assets/33764231/07b34a1f-6003-4a26-b302-638d5993a949)

## Prerequisites

- Docker
- Node 18+
- awscli


## Installation

1. Clone this repository

2. Build the Docker image

`docker-compose build web`

3. Install NPM dependencies

`docker-compose run --rm web npm install`


## Run

1. Run the Docker image

`docker-compose up web`


## Deploy

1. Deploy the ECR Stack

`cdk deploy EcrStack`

2. Log into the private ECR Registry

`aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin {{AWS_ACCOUNT_ID_NUMBER}}.dkr.ecr.us-east-1.amazonaws.com`

3. Build the Docker image

`docker build -t demo-cdk .`

4. Tag image with ECR Repository details

`docker tag demo-cdk:latest {{AWS_ACCOUNT_ID_NUMBER}}.dkr.ecr.us-east-1.amazonaws.com/{{REPOSITORY_NAME}}:latest`

5. Push image to ECR Repository

`docker push {{AWS_ACCOUNT_ID_NUMBER}}.dkr.ecr.us-east-1.amazonaws.com/{{REPOSITORY_NAME}}:latest`

6. Deploy API Stack

`cdk deploy ApiStack`
