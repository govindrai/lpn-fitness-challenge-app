var mongoose = require('mongoose'),
	Participation = require('./../models/participation'),
	Schema = mongoose.Schema;

var pointSchema = new Schema({
	participationId: {
		type: [{Schema.Types.ObjectId, ref: 'Participation'}],
		required: true
	},
	activityId: {
		type: [{Schema.Types.ObjectId, ref: 'Activity'}],
		required: true
	},
	unitsExercised: {
		type: Number,
		required: true
	},
	scale: {
		type: Number,
		required: true
	},
	points: {
		type: Number,
		required: true
	}
});

var Point = mongoose.model('Point', pointSchema);

module.exports = Point;
