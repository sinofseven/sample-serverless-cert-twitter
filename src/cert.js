const otwitter = require('./oauth.js');
const yaml = require('js-yaml');
const fs = require('fs');

const sls = yaml.safeLoad(fs.readFileSync(`${__dirname}/../serverless.yml`));
const stage = process.env.STAGE;
const api = process.env.API;
const url = `https://${api}.execute-api.${sls.custom.region}.amazonaws.com/${stage}/callback`;
const bucket = process.env.BUCKET;
const aws = require('aws-sdk');
const s3 = new aws.S3({region: sls.custom.region});

const getRequestToken = (oauth) => {
  return new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken((err, oauth_token, oauth_token_secret) => {
      if (err) {
        reject(err);
        return;
      }
      const data = {
        oauth_token: oauth_token,
        oauth_token_secret: oauth_token_secret
      };
      resolve(data);
    });
  });
};

const saveRequestToken = (token) => {
  return new Promise((resolve, reject) => {
    s3.putObject({
      Bucket: bucket,
      Key: token.oauth_token,
      Body: token.oauth_token_secret
    }, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(token);
    });
  });
};

const makeCertUrl = (token) => {
  return new Promise((resolve) => {
    const location = `https://twitter.com/oauth/authenticate?oauth_token=${token.oauth_token}`;
    resolve(location);
  });
};

module.exports.handler = (event, context, callback) => {
  const oauth = otwitter.OAuth(url);
  Promise.resolve(oauth)
  .then(getRequestToken)
  .then(saveRequestToken)
  .then(makeCertUrl)
  .then((location) => {
    callback(null, {
      statusCode: 303,
      headers: {
        "Access-Control-Allow-Origin": "*",
        Location: location
      }
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
