const mongoose = require("mongoose");
const feedBackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min:1,
    max:5
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  profilePic:{
    type:String,
    default:""
  }
},{
    timestamps: true,
  
});

module.exports = mongoose.model("FeedBack", feedBackSchema);