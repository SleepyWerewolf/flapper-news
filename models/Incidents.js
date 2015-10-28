var mongoose = require('mongoose');

var IncidentSchema = new mongoose.Schema({
    building_type: String,
    address: String,
    cross_streets: { type: [String] },
    gps_loc: { type: [Number], index: '2d' },
    moniker: String
});

mongoose.model('Incident', IncidentSchema);
