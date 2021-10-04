module.exports = (mongoose) => {
    const dropSchema = new mongoose.Schema({
        guildId: String,
        number: Number,
        dropMessageId: String,
        saleMessageId: String,
        boss: String,
        item: String,
        partySize: Number,
        party: [{ type: mongoose.ObjectId, ref: 'Member' }],
        price: Number,
        sold: Boolean,
    }, {
        versionKey: false,
    });

    dropSchema.index({ guildId: 1, number: 1 }, { unique: true });

    return mongoose.model('Drop', dropSchema);
};
