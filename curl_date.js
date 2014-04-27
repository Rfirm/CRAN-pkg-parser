var request = require('request');
var stage = require('node-stage');
var jsdom = require('jsdom');
var mkdirp = require('mkdirp');
var fs = require('fs');
var url = require('url');

// origin: http://mirror.fcaglp.unlp.edu.ar/CRAN/web/packages/available_packages_by_date.html

var origin = 'http://mirror.fcaglp.unlp.edu.ar/CRAN/web/packages/available_packages_by_date.html';

request.get({
	uri: origin
}, function(err, res, body) {
	if(!err && res.statusCode == 200) {
		create_fs();
		jsdom.env(
			body,
			["http://code.jquery.com/jquery.min.js"],
			function (errors, window) {
				var $ = window.$;
				var pkg_arr = [];
				$("table > tr").each(function(i) {
					var pkg_obj = {};
					if(i > 1) {
						$(this).children('td').each(function(i) {
							var $inner = $(this).html();
							if(i === 0) {
								// date 
								pkg_obj.date = $inner;
							}else if (i === 1) {
								// package
								var $href = $(this).find('a').attr('href');
								var $val = $(this).find('a').html();
								var url_resolve = url.resolve(origin, $href);
								pkg_obj.package = $val;
								pkg_obj.href = url_resolve;
							}else if (i === 2) {
								// title
								pkg_obj.title = $inner;
							}
						})
						pkg_arr.push(pkg_obj);
					}
				})
				fs.writeFileSync('./data/pkg.json', JSON.stringify(pkg_arr))
				stage.success('DONE!!!!!!!!!!!')
			}
		);
    }else {
      stage.error('Request error!')
    } 
})

// create folder if is not exist
function create_fs() {
  mkdirp(__dirname + '/data/', function (err) {
    if (err) {
      stage.error(err)
    } else { 
      stage.process('success create folder: ./data/')
    }
  })
}