const {
  formatFixer,
  formatDiarioOficial,
  formatBanxico,
} = require("../helpers");

describe("Helpers functionalities", () => {
  test("Should format fixer's data", () => {
    const data = {
      date: "2018-11-26",
      rates: {
        USD: "10,000"
      }
    };

    const expectedData = {
      value: "10,000",
      last_updated: new Date("2018", "11", "26")
    };

    expect(formatFixer(data)).toEqual(expectedData);
  });

  test("Should format Diario Oficial's data", () =>{
    const value = "10,000";
    const date = "26/11/2018";

    const expectedData = {
      value: "10,000",
      last_updated: new Date("2018", "11", "26")
    };

    expect(formatDiarioOficial(value, date)).toEqual(expectedData);
  });

  test("Should format Banxico's information", () => {
    const data = {
      dato: "10,000",
      fecha: "26/11/2018"
    };

    const expectedData = {
      value: "10,000",
      last_updated: new Date("2018", "11", "26")
    };

    expect(formatBanxico(data)).toEqual(expectedData);
  });
});
