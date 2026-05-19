const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const trackingLogSchema = new Schema({
    status: {
        type: String,
        required: true
    },

    city: {
        type: String,
        default: ""
    },

    address: {
        type: String,
        default: ""
    },

    message: {
        type: String,
        default: ""
    },

    time: {
        type: Date,
        default: Date.now
    }
}, { _id: false });

const shippedSchema = new Schema({
    booking: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },

    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },

    details: {
        type: String,
        default: ""
    },

    currentCity: {
        type: String,
        default: ""
    },

    currentAddress: {
        type: String,
        default: ""
    },

    deliveryAddress: {
        type: String,
        required: true
    },

    deliveryCity: {
        type: String,
        required: true
    },

    deliveryDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: [
            "shipped",
            "arrived_at_your_nearest_hub",
            "out_for_delivery",
            "delivered"
        ],
        default: "shipped"
    },

    // Tracking History
    trackingLogs: [trackingLogSchema]

}, {
    timestamps: true
});

module.exports = mongoose.model("Shipped", shippedSchema);