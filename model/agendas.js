const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const portSchema = new Schema({
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
  cpf: {
    type: String,
    require: true,
  },
});

module.exports = mongoose.model('Agendas', portSchema);
