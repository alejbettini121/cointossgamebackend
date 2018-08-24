'use strict'

const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const refundSchema = new Schema({
  ticketID: {
    required: true,
    type: String
  },
  amount: {
    required: true,
    type: String
  },
  player: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

refundSchema.plugin(mongoosePaginate)
module.exports = mongoose.db.model('refundEvent', refundSchema)
