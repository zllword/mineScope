var url = require('url'); //解析操作url
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var Q = require('q');
/*
  TaoBao Product
*/
var graper = {};
graper.getTaobao = function (url) {
  var defer = Q.defer();
  if(!url) {
    defer.reject('url is null');
    return defer.promise;
  };
  superagent.get(url)
    .end(function (err, res) {
        var $ = cheerio.load(res.text);
        //通过CSS selector来筛选数据
        var product = {};

        var mainpic = $('.tb-main-pic').find('img')[0];
        product.image = mainpic.attribs.src;
        product.title = $('.tb-main-title')[0].attribs['data-title'];
        product.subtitle = $('.tb-subtitle').text();
        product.price = $('.tb-rmb-num').text();
        defer.resolve(product);
    });
  return defer.promise;
}
/*
var targetUrl = 'https://item.taobao.com/item.htm?id=40357588223&ali_trackid=2:mm_33755591_0_0:1459847498_265_499980915&spm=a310p.7395725.1998460392.1.pg029V&ali_trackid=2:mm_33755591_0_0:1459847498_265_499980915&spm=a310p.7395725.1998460392.1.pg029V';
// var targetUrl = '';
graper.getTaobao(targetUrl)
  .then(function(product){
    console.log(product)
  })
  .catch(function(err){
    console.log(err);
  });

function getYouku (url) {

}
*/
module.exports = graper;
