import { Duration, Size, Stack, StackProps } from 'aws-cdk-lib';
import { InstanceClass, InstanceSize, InstanceType, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Repository } from 'aws-cdk-lib/aws-ecr';
import {
  AwsLogDriverMode, Cluster, ContainerImage, LogDrivers, FargateService, FargateTaskDefinition, Protocol
} from 'aws-cdk-lib/aws-ecs';
import { ApplicationLoadBalancer } from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import { Construct } from 'constructs';
import { CorsHttpMethod, HttpApi, HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2';
import { HttpAlbIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations';

interface ApiStackProps extends StackProps {
  ecrRepository: Repository;
}

export class ApiStack extends Stack {

  public readonly apiUrl: string;

  constructor(scope: Construct, id: string, props: ApiStackProps) {
    super(scope, id, props);

    const vpc = new Vpc(this, 'Vpc', {
      maxAzs: 2,
      // Necessary for Security Group rules to enable API GW VPC Link Integrations:
      restrictDefaultSecurityGroup: false,
    });

    // Can use the default VPC instead:
    // const vpc = ec2.Vpc.fromLookup(this, 'Vpc', {
    //   isDefault: true,
    // });

    const cluster = new Cluster(this, 'Cluster', {
      vpc: vpc,
      capacity: {
        instanceType: InstanceType.of(InstanceClass.T3, InstanceSize.NANO),
        desiredCapacity: 2,
        maxCapacity: 2,
      }
    });

    const taskDefinition = new FargateTaskDefinition(this, 'TaskDef', {
      cpu: 256,
      memoryLimitMiB: 512,
    });

    taskDefinition.addContainer('DefaultContainer', {
      image: ContainerImage.fromEcrRepository(props.ecrRepository, 'latest'),
      memoryLimitMiB: 512,
      logging: LogDrivers.awsLogs({
        streamPrefix: 'TestStreamPrefix',
        mode: AwsLogDriverMode.NON_BLOCKING,
        maxBufferSize: Size.mebibytes(25),
      }),
      portMappings: [ { containerPort: 80, protocol: Protocol.TCP, } ],
      healthCheck: {
        command: [ "CMD-SHELL", "curl -f http://localhost/health || exit 1" ],
        interval: Duration.minutes(1),
        retries: 3,
        startPeriod: Duration.minutes(1),
        timeout: Duration.minutes(1),
      }
    });

    const fargateService = new FargateService(this, 'FargateService', {
      cluster,
      taskDefinition,
      assignPublicIp: false,
      desiredCount: 2,
    });

    const alb = new ApplicationLoadBalancer(this, 'ApplicationLoadBalancer', {
      vpc: vpc,
      internetFacing: false,
    });

    const listener = alb.addListener('AlbListener', { port: 80 });
    listener.addTargets('target', {
      port: 80,
      targets: [ fargateService ],
      healthCheck: {
        path: '/health',
        interval: Duration.minutes(2),
        timeout: Duration.minutes(1),
      }
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      createDefaultStage: false,
      corsPreflight: {
        allowHeaders: ['Authorization'],
        allowMethods: [
          CorsHttpMethod.ANY,
          // CorsHttpMethod.GET,
          // CorsHttpMethod.HEAD,
          // CorsHttpMethod.OPTIONS,
          // CorsHttpMethod.POST,
          // CorsHttpMethod.DELETE,
          // CorsHttpMethod.PUT,
          // CorsHttpMethod.PATCH,
        ],
        allowOrigins: ['*'],
        maxAge: Duration.days(10),
      },
    });

    const httpApiDefaultStage = httpApi.addStage('DefaultStage', {
      stageName: '$default',
      autoDeploy: true,
      throttle: {
        burstLimit: 2,
        rateLimit: 1,
      }
    });

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [
        HttpMethod.ANY,
        // HttpMethod.GET,
        // HttpMethod.HEAD,
        // HttpMethod.OPTIONS,
        // HttpMethod.POST,
        // HttpMethod.DELETE,
        // HttpMethod.PUT,
        // HttpMethod.PATCH
      ],
      integration: new HttpAlbIntegration('DefaultIntegration', listener),
    });

    this.apiUrl = `${httpApi.apiId}.execute-api.${process.env.CDK_DEFAULT_REGION}.amazonaws.com`;
  }
}
