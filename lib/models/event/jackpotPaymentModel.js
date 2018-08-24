
const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const jackpotPaymentSchema = new Schema({
  ticketID: {
    required: true,
    type: String
  },
  player: {
    required: true,
    type: String
  },
  jackpotWin: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

jackpotPaymentSchema.plugin(mongoosePaginate)
module.exports = mongoose.db.model('jackpotPaymentEvent', jackpotPaymentSchema)