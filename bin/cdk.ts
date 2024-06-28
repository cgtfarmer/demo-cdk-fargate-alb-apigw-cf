#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { ApiStack } from '../cdk/lib/stacks/api-stack';
import { CloudFrontStack } from '../cdk/lib/stacks/cloudfront-stack';
import { EcrStack } from '../cdk/lib/stacks/ecr-stack';

const app = new App();

const ecrStack = new EcrStack(app, 'EcrStack', {});

const cloudFrontAuthorizerHeader = {
  key: 'x-origin-verify',
  value: '11111111-2222-3333-4444-555555555555',
};

const apiStack = new ApiStack(app, 'ApiStack', {
  ecrRepository: ecrStack.ecrRepository,
  cloudFrontHeader: cloudFrontAuthorizerHeader,
});

new CloudFrontStack(app, 'CloudFrontStack', {
  apiUrl: apiStack.apiUrl,
  header: cloudFrontAuthorizerHeader,
});
