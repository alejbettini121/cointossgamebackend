'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const donateSchema = new Schema({
  amount: {
    required: true,
    type: String
  },
  donator: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

donateSchema.plugin(mongoosePaginate)
module.exports = mongoose.db.model('DonateEvent', donateSchema)