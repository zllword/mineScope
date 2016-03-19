var Waterline = require('waterline');

var User = waterline.Collection.extend({
  attributes : {
    email: {
      type: 'string',
      required: true,
      unique: true
    },
    password: {
      type: 'string',
      required: true,
    },
    name: {
      type: 'string',
    },
    gender: {
      type: 'boolean'
    },
    phone: {
      type: 'string',
    },
    age: {
      type: 'integer',
    },
    lastLoginDate: {
      type: 'datetime',
    },
  }
})
modules.export = User;
