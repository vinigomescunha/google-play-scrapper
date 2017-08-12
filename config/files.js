var scrapperConf = require('./scrapperConf');
var scrapper = require('google-play-scraper');
var pollingInterval = 300000; // 5 minutes polling interval
var Mustache = require('mustache');
module.exports = {
  'index.json': function (source, response) { // adiciono dados em cima de mustache template
    scrapper.app(scrapperConf).then(
      function (data) {
        var h = data['histogram'];
        data.screenshots[0] = data.screenshots[Math.floor((Math.random() * (6 - 0) + 1))];
        data['realScore'] = ((1 * h[1]) + (2 * h[2]) + (3 * h[3]) + (4 * h[4]) + (5 * h[5])) / (h[1] + h[2] + h[3] + h[4] + h[5]);
        data['lastUpdate'] = new Date();
        data['nextUpdate'] = new Date(data['lastUpdate'].getTime() + pollingInterval);
        response.write('');
        response.write(Mustache.render(source, {
          data: JSON.stringify(data)
        }));
        response.end();
      },
      function (error) {
        console.log('Ocorreu um erro, APPID: ' + appID, error, scrapperConf);
        response.write('');
        response.write('{error:true}');
        response.end();
      });
  },
  'reviews.json': function (source, response) {
    scrapperConf['fullDetail'] = true;
    scrapperConf['page'] = 0;
    scrapperConf['sort'] = scrapper.sort.NEWEST; //{ NEWEST: 0, RATING: 1, HELPFULNESS: 2 }
    scrapper.reviews(scrapperConf).then(
      function (data) {
        response.write('');
        response.write(Mustache.render(source, {
          data: JSON.stringify(data)
        }));
        response.end();
      },
      function (error) {
        response.write('');
        response.write('{error:true}');
        response.end();
      });
  },
  'config.json': function (source, response) { // arquivo nao existe
    response.write('');
    response.write(JSON.stringify({
      'pollingInterval': pollingInterval
    }));
    response.end();
  },
  'about.txt': function (source, response) { // tratamento em cima de um arquivo
    response.write('');
    response.write('vinigomescunha\ngithub.com/vinigomescunha');
    response.end();
  }
}