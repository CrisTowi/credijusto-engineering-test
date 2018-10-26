const axios = require("axios");
const rp = require("request-promise");
const cheerio = require("cheerio");

const formatFixer = (data) => {
  const lastUpdated = new Date(data.timestamp);

  return {
    value: data.rates.USD.toString(),
    last_updated: lastUpdated
  };
}

const getFixer = async () => {
  try {
    const result = await axios.get("http://data.fixer.io/api/latest", {
      params: {
        access_key: process.env.FIXER_TOKEN,
        base: "EUR",
        symbols: "USD"
      }
    });
    
    return formatFixer(result.data);
  } catch (error) {
    console.log(error);

    return {};
  }
}

const getDiarioOficial = async () => {
  const options = {
    uri: "http://www.banxico.org.mx/tipcamb/tipCamMIAction.do",
    transform: function (body) {
      return cheerio.load(body);
    }
  };

  try {
    const $ = await rp(options);
  
    let date;
    let value;
    const rowNon = $(".renglonNon");
  
    rowNon.find("td").each(function(index, elem) {
      if (index === 0) {
        date = $(this).text().replace(/\n| /g,"").trim();
      } else if (index === 2) {
        value = $(this).text().replace(/\n| /g,"").trim();;
      }
    });
  
    return {
      value: value,
      last_updated: date
    };
  } catch (error) {
    console.log(error);
    return {};
  }
}

const getBanxico = async () => {
  try {
    const result = await axios.get("https://www.banxico.org.mx/SieAPIRest/service/v1/series/sf43718//datos/oportuno", {
      params: {
        token: process.env.BANXICO_TOKEN
      }
    });

    const data = result.data.bmx.series[0].datos[0];

    return {
      last_updated: data.fecha,
      value: data.dato
    };
  } catch (error) {
    console.log(error);
    return {};
  }
}

module.exports = {
  getFixer,
  getDiarioOficial,
  getBanxico
};