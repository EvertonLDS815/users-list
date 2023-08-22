const { Schema, model } = require('mongoose');

const pessoaSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  age: {
    type: Number,
    require: true,
  },
  address: {
    type: String,
    require: true,
  },
});

module.exports = model('User', pessoaSchema);
