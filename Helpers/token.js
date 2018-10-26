const crypto = require('crypto');

// Make the token combining the IP of the user and a secret key
const makeToken = (ip) => {
  return crypto
    .createHash('sha256')
    .update(ip + process.env.HASH_SECRET, 'utf8')
    .digest('hex');  
}

// Check if the token exists in the tokens list
const tokenExist = (token, tokens) => {
  return tokens.reduce((prevVal, tokenItem) => {
    if (tokenItem.token === token) {
      prevVal = true;
    }

    return prevVal;
  }, false);
}

// Validate if the token has exceded its limits of requests every 3 seconds
const validateExcess = (token, tokens) => {
  const selectedToken = tokens.find(tokenItem => tokenItem.token === token);
  const now = new Date();
  const lastUsed = new Date(selectedToken.lastUsed);

  const newTokens = tokens.map((tokenItem) => {
    if (tokenItem.token === token) {
      tokenItem.lastUsed = now;
    }

    return tokenItem;
  });

  return {
    exceed: Math.abs(now.getTime() - lastUsed.getTime()) < parseInt(process.env.MILISECONDS, 10),
    newTokens: newTokens
  };
}

module.exports = {
  tokenExist,
  makeToken,
  validateExcess
};
