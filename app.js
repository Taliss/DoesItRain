var Arrow = require('arrow'),
	server = new Arrow(),
	// hbs = Arrow.Middleware.getRendererEngine('hbs');
	ejs = require('ejs'),
	engine = {};

engine.ejs = ejs;
engine.createRenderer = function (content, filename, app) {
    return function(filename, opts, callback) {
        if (!content) {
            content = require('fs').readFileSync(filename, 'utf8').toString();
        }
        callback(null, ejs.render(content, opts));
    }
};
engine.extension = 'ejs';
server.middleware.registerRendererEngine(engine);

const http = require('http');
const openWeatherAPPID = 'd9f5b4e45c38241c2caa4d9f389825e5';

// create new collection from the results, mapped by day
function mapForecast (forecast) {
	let dayList = {};
	forecast.forEach((element, index) => {
		let day = element.dt_txt.substring(0,10);
		if (!dayList[day]) {
		dayList[day] = { list: [element], min: element.main.temp, max: element.main.temp }
		} else {
			dayList[day].list.push(element);
			if (element.main.temp < dayList[day].min) dayList[day].min = element.main.temp;
			if (element.main.temp > dayList[day].max) dayList[day].max = element.main.temp;
		}
	});

	// let dayArray = [];
	// for (let day in dayList) {
	// 	if (dayList.hasOwnProperty(day)) dayArray.push(dayList[day]);
	// }
	return dayList;
}

// lifecycle examples
server.on('starting', function () {
	server.logger.debug('server is starting!');
	let forecastAPI = new Arrow.API({
		group: 'forecast',
		path: '/api/forecast/:lat/:lon',
		method: 'GET',
		description: 'make internal call to get 5 day forecast',
		model: 'forecast',
		parameters: {
			lat: {description: 'Current user latitude', required: true},
			lon: {description: 'Current user longitude', required: true}
		},
		action: function (request, response, next) {
			let options = {
				host: 'api.openweathermap.org',
				path: `/data/2.5/forecast?lat=${request.params.lat}&lon=${request.params.lon}&appid=${openWeatherAPPID}`,
				method: 'GET',
			}
			http.request(options, (res) => {
				let forecastData = '';
				res.setEncoding('utf8');
				res.on('data', (chunk) => forecastData += chunk);
				res.on('end', () => {
					response.setHeader('Content-Type', 'application/json');
					let parsedData = JSON.parse(forecastData);
					parsedData.list = mapForecast(parsedData.list);
					response.send(JSON.stringify(parsedData));
					next(null, parsedData);
				});
			}).on('error', (err) => {
				next(err);
			}).end();
		}
	}, server.config, server);
	server.addAPI(forecastAPI);
	forecastAPI.bind(server.app);
});

server.on('started', function () {
	server.logger.debug('server started!');
});

// start the server
server.start();
