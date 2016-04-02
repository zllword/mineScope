var url = require('url'); //解析操作url
var superagent = require('superagent'); //这三个外部依赖不要忘记npm install
var cheerio = require('cheerio');
var eventproxy = require('eventproxy');
var targetUrl = 'http://www.feicuig.com';

superagent.get(targetUrl)
    .end(function (err, res) {
        var $ = cheerio.load(res.text);
        //通过CSS selector来筛选数据
        $('img').each(function (idx, element) {
            console.log(element);
        });
    });
