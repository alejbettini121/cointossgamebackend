const mongoose = require('../../../config/dbConnection')
const mongoosePaginate = require('mongoose-paginate')
const Schema = mongoose.Schema

const paymentSchema = new Schema({
  success: {
    required: true,
    type: Boolean
  },
  user: {
    required: true,
    type: String
  },
  amount: {
    required: true,
    type: String
  }
},
{
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

paymentSchema.plugin(mongoosePaginate)
module.exports = mongoose.db.model('paymentEvent', paymentSchema)