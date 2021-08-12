import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const modelSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  hour_price: {
    type: Number,
    required: true,
  },
  vehicles: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Vehicle',
    },
  ],
});

const Model = mongoose.model('Model', modelSchema);

export default Model;
