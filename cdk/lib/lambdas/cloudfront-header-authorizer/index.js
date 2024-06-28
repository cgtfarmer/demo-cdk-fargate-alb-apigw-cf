// Runtime: Node.js 18.x

exports.handler = async (event) => {
  const cfHeaderKey = process.env.CLOUDFRONT_HEADER_KEY;
  const cfHeaderValue = process.env.CLOUDFRONT_HEADER_VALUE;
  const isAuthorizedKey = 'isAuthorized';

  console.log(event.headers);

  const headerValue = event.headers[cfHeaderKey];
  console.log(headerValue);

  const response = {};
  if (headerValue == cfHeaderValue) {
    response[isAuthorizedKey] = true;
  } else {
    response[isAuthorizedKey] = false;
  }

  console.log(response);
  return response;
};
