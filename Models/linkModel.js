const mongoose = require('mongoose');

const linkSchema = mongoose.Schema({
    url: {
        type: String,
        required: true
    },
    count : {
        type : Number,
        default :1
    },
    params : [{
        type: String
    }]
});


module.exports = mongoose.model('links', linkSchema);