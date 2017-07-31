const otwitter = require('./oauth.js');
const fs = require('fs');
const yaml = require('js-yaml');

const sls = yaml.safeLoad(fs.readFileSync(`${__dirname}/../serverless.yml`));
const bucket = process.env.S3;
const aws = require('aws-sdk');
const s3 = new aws.S3({region: sls.custom.region});

const getOAuthSecret = (data) => {
  return new Promise((resolve, reject) => {
    s3.getObject({
      Bucket: bucket,
      Key: data.oauth_token
    }, (err, res) => {
      if (err) {
        reject(err);
        return;
      }
      data.oauth_secret = res.Body.toString();
      resolve(data)
    });
  });
};

const getAccessToken = (data) => {
  return new Promise((resolve, reject) => {
    data.oauth.getOAuthAccessToken(
      data.oauth_token,
      data.oauth_secret,
      data.oauth_verifier,
      (err, token, secret, results) => {
        if (err) {
          reject(err);
          return;
        }
        resolve({access_token_key: token, access_token_secret: secret});
      }
    );
  });
};

module.exports.handler = (event, context, callback) => {
  const oauth = otwitter.OAuth(null);
  const data = {
    oauth: oauth,
    oauth_token: event.queryStringParameters.oauth_token,
    oauth_verifier: event.queryStringParameters.oauth_verifier,
  };
  Promise
  .resolve(data)
  .then(getOAuthSecret)
  .then(getAccessToken)
  .then((data) => {
    delete data.oauth;
    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf8"
      },
      body: JSON.stringify(data)
    });
  
  })
  .catch((err) => {
    callback(null, {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json; charset=utf8"
      },
      body: JSON.stringify(err)
    });
  });
};
