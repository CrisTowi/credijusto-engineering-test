const crypto = require('crypto');
const { setAsync } = require("../Helpers/redisClient");

const makeToken = (ip) => {
  return sha256(ip + process.env.HASH_SECRET);
}

const sha256 = (data) => {
  return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
}

const tokenExist = (token, tokens) => {
  return tokens.reduce((prevVal, tokenItem) => {
    if (tokenItem.token === token) {
      prevVal = true;
    }

    return prevVal;
  }, false);
}

const validateExcess = async (token, tokens) => {
  const selectedToken = tokens.find(tokenItem => tokenItem.token === token);
  const now = new Date();
  const lastUsed = new Date(selectedToken.lastUsed);

  const newTokens = tokens.map((tokenItem) => {
    if (tokenItem.token === token) {
      tokenItem.lastUsed = now;
    }

    return tokenItem;
  });

  setAsync("tokens", JSON.stringify(newTokens));

  return Math.abs(now.getTime() - lastUsed.getTime()) < 3000;
}

module.exports = {
  tokenExist,
  makeToken,
  validateExcess,
  sha256
};
