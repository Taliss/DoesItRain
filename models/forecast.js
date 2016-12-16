var Arrow = require('arrow');

let forecast = Arrow.createModel('forecast',{
	fields: {
		latitude: {type:String, required: true},
		longitude: {type:String, required: true},
	},
	connector: 'memory',
	autogen:false,
});

module.exports = forecast;