#!/usr/bin/env node

import { App } from 'aws-cdk-lib';

import { ApiStack } from '../cdk/lib/stacks/api-stack';
import { CloudFrontStack } from '../cdk/lib/stacks/cloudfront-stack';
import { EcrStack } from '../cdk/lib/stacks/ecr-stack';

const app = new App();

const ecrStack = new EcrStack(app, 'EcrStack', {});

const apiStack = new ApiStack(app, 'ApiStack', {
  ecrRepository: ecrStack.ecrRepository,
});

new CloudFrontStack(app, 'CloudFrontStack', {
  apiUrl: apiStack.apiUrl,
});
