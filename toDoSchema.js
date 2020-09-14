const mongoose = require('mongoose');
const Schema  = mongoose.Schema;

const toDoSchema = new Schema({
    title:{
        type: String,
        required: true
    },
    from:{
        type: String,
        required: true
    },
    time:{
        type: String,
        required: true
    }
}, {timestamps: true});

const Todo = mongoose.model('Todo', toDoSchema);
module.exports = Todo;