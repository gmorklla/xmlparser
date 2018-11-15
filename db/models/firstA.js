const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// First Schema
const FirstSchema = new Schema({
    _id: mongoose.Schema.Types.ObjectId,
    created: {
        type: Date,
        default: Date.now
    },
    updated: {
        type: Date,
        default: Date.now
    },
    measurement: {
        type: String,
        required: true
    },
    nedn: {
        type: String,
        required: true
    },
    vn: {
        type: String,
        required: true
    },
    cbt: {
        type: Date,
        required: true
    },
    events: [{
        mts: {
            type: Number,
            required: true
        },
        mv: [{
            moid: {
                type: String
            },
            r: {
                type: Number
            }
        }],
        index: true
    }]
});

FirstSchema.index({
    "measurement": 1,
    "nedn": 1,
    "cbt": -1,
    "events.mts": 1
}, {
    background: true,
    expireAfterSeconds: 86400
});

// Issue model
const First = mongoose.model('First', FirstSchema);

module.exports = First;
