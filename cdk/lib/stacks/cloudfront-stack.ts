import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import {
  AllowedMethods, BehaviorOptions, Distribution, HttpVersion, OriginProtocolPolicy, PriceClass, SecurityPolicyProtocol, ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import { HttpOrigin } from 'aws-cdk-lib/aws-cloudfront-origins';

interface CloudFrontStackProps extends StackProps {
  apiUrl: string;
}

export class CloudFrontStack extends Stack {

  constructor(scope: Construct, id: string, props: CloudFrontStackProps) {
    super(scope, id, props);

    const httpApiOrigin = new HttpOrigin(props.apiUrl, {
      protocolPolicy: OriginProtocolPolicy.HTTPS_ONLY,
    });

    const originBehaviorOptions: BehaviorOptions = {
      origin: httpApiOrigin,
      allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
      viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      compress: true,
    };

    const cloudFrontDistribution = new Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: originBehaviorOptions,
      httpVersion: HttpVersion.HTTP2_AND_3,
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      priceClass: PriceClass.PRICE_CLASS_100,
      // additionalBehaviors: {
      //   '/assets/': assetsBucketBehaviorOptions,
      // },
    });
  }
}
