const yaml = require('js-yaml');
const fs = require('fs');
const oauth = require('oauth');

module.exports.OAuth = (url) => {
  const config = yaml.safeLoad(fs.readFileSync(`${__dirname}/../config.yml`));
  return new oauth.OAuth(
    "https://api.twitter.com/oauth/request_token",
    "https://api.twitter.com/oauth/access_token",
    config.twitter.consumer_key,
    config.twitter.consumer_secret,
    "1.0",
    url,
    "HMAC-SHA1"
  );
};
