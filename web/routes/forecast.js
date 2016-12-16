var Arrow = require('arrow');
// CURRENTLY HARDCODED VALUES FOR THE CENTER OF THE UNIVERSE !!!
let [lat, lon] = [42.1928, 24.3336];

var ForecastRoute = Arrow.Router.extend({
	name: 'forecast',
	path: '/',
	method: 'GET',
	description: 'this is a web route to the forecast of the current user',
	action: function (req, resp, next) {
		req.server.getAPI('/api/forecast/:lat/:lon', 'GET').execute({lat:lat, lon: lon}, function (err, results) {
			if (err) {
				next(err);
			} else {
				resp.render('forecast', JSON.parse(results));
				next(null);
			}
		});
		/**
		 * by default, routes are sync. to make them async, add a next in the action above as
		 * the last parameter and then call next when completed
		 */
	}
});

module.exports = ForecastRoute;
