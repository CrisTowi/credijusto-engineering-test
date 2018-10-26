const {
  makeToken,
  tokenExist,
  validateExcess
} = require("../token");

describe("Token helpers functionality", () => {
  test("Should make a token", () => {
    const IP = "0.0.0.0";
    const expectedToken = "17d02289f7fec6d0762183475194c31da39b52ebb1889a1800d9e486609931f9";

    expect(makeToken(IP)).toEqual(expectedToken);
  });

  test("Should check if a token exists in the list of tokens", () => {
    const token = "ABCD";
    const invalidToken = "ZZZZZ";
    const tokens = [
      { token: "ABCD", generatedAt: "10-10-2018" },
      { token: "WXYZ", generatedAt: "11-11-2018" },
    ];

    expect(tokenExist(token, tokens)).toEqual(true);
    expect(tokenExist(invalidToken, tokens)).toEqual(false);
  });

  test("Should validate if the toke exceded its time", () => {
    const token = "ABCD";
    const invalidToken = "WXYZ";
    const now = new Date();
    const yesterday = new Date();

    yesterday.setDate(yesterday.getDate() - 1);

    const tokens = [
      { token: "ABCD", generatedAt: "10-10-2018", lastUsed: now },
      { token: "WXYZ", generatedAt: "11-11-2018", lastUsed: yesterday },
    ];

    expect(validateExcess("ABCD", tokens).exceed).toEqual(true);
    expect(validateExcess("WXYZ", tokens).exceed).toEqual(false);
  });
});