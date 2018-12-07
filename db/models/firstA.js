const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// First Schema
const FirstSchema = new Schema({
    measurement: {
        type: String,
        required: true,
    },
    nedn: {
        type: String,
        required: true
    },
    moid: {
        type: String,
        required: true
    },
    day: {
        type: Date,
        required: true
    },
    values: [{}]
});

FirstSchema.index({
    "day": -1,
    "measurement": 1,
    "nedn": 1,
    "moid": 1
}, {
    background: true,
    unique: true
});

// Issue model
const First = mongoose.model('First', FirstSchema);

module.exports = First;
