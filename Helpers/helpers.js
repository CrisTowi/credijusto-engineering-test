// Libraries
const axios = require("axios");
const rp = require("request-promise");
const cheerio = require("cheerio");

// Format Fixer data to a valid format to store
const formatFixer = (data) => {
  const splittedDate = data.date.split("-");

  return {
    value: data.rates.USD.toString(),
    last_updated: new Date(splittedDate[0], splittedDate[1], splittedDate[2])
  };
}


// Format Diario Oficial data to a valid format to store
const formatDiarioOficial = (value, date) => {
  const splittedDate = date.split("/");

  return {
    value: value,
    last_updated: new Date(splittedDate[2], splittedDate[1], splittedDate[0])
  };
}

// Format Banxico data to a valid format to store
const formatBanxico = (data) => {
  const splittedDate = data.fecha.split("/");

  return {
    value: data.dato,
    last_updated: new Date(splittedDate[2], splittedDate[1], splittedDate[0])
  };
}

// Get fixer data from the API and send it back to the user
const getFixer = async () => {
  try {
    // Makes the request to the API server with the data we want to receive
    const result = await axios.get("http://data.fixer.io/api/latest", {
      params: {
        access_key: process.env.FIXER_TOKEN,
        base: "EUR",
        symbols: "USD"
      }
    });
    
    // Return formatted information
    return formatFixer(result.data);
  } catch (error) {
    console.log(error);

    return {};
  }
}

// Get Diario Oficial data from the web page doing some web scrapping
const getDiarioOficial = async () => {
  // Define options to connect to the web page and download the content
  const options = {
    uri: "http://www.banxico.org.mx/tipcamb/tipCamMIAction.do",
    transform: function (body) {
      return cheerio.load(body);
    }
  };

  try {
    // Get an object and stored in a jQuery-ish variable to use the smae selectors
    const $ = await rp(options);
  
    let date;
    let value;
    const rowNon = $(".renglonNon");
  
    // Get the first row of the table to get the data thend find all
    // the <td> elements and get the data from the ones we are interested on
    rowNon.find("td").each(function(index, elem) {
      if (index === 0) {
        date = $(this).text().replace(/\n| /g,"").trim();
      } else if (index === 2) {
        value = $(this).text().replace(/\n| /g,"").trim();;
      }
    });
  
    // Format data and send it back to the client
    return formatDiarioOficial(value, date);
  } catch (error) {
    console.log(error);

    return {};
  }
}

// Get Banxico information from the API and send it back to the client
const getBanxico = async () => {
  try {

    // Make the request with the token from Banxico API
    const result = await axios.get("https://www.banxico.org.mx/SieAPIRest/service/v1/series/sf43718//datos/oportuno", {
      params: {
        token: process.env.BANXICO_TOKEN
      }
    });

    const data = result.data.bmx.series[0].datos[0];

    // Format data and send it back to the client
    return formatBanxico(data);
  } catch (error) {
    console.log(error);

    return {};
  }
}

module.exports = {
  formatFixer,
  formatDiarioOficial,
  formatBanxico,
  getFixer,
  getDiarioOficial,
  getBanxico
};
