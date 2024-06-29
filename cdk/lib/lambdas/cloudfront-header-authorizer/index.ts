// Runtime: Node.js 18.x

import { APIGatewayRequestAuthorizerEventV2, Handler } from 'aws-lambda';

export const handler: Handler = async (event: APIGatewayRequestAuthorizerEventV2) => {
  const cfHeaderKey: string = process.env.CLOUDFRONT_HEADER_KEY || '';
  const cfHeaderValue: string = process.env.CLOUDFRONT_HEADER_VALUE || '';
  const isAuthorizedKey: string = 'isAuthorized';

  console.log(event.headers);

  const response: Record<string, boolean> = {};
  if (!event.headers) {
    response[isAuthorizedKey] = false;
    console.log(response);
    return response;
  }

  const headerValue = event.headers[cfHeaderKey];
  console.log(headerValue);

  if (headerValue !== cfHeaderValue) {
    response[isAuthorizedKey] = false;
    console.log(response);
    return response;
  }

  response[isAuthorizedKey] = true;
  console.log(response);
  return response;
};
