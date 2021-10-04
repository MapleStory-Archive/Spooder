module.exports = (mongoose) => {
    const memberSchema = new mongoose.Schema({
        guildId: String,
        userId: String,
        name: String,
        drops: [{ type: mongoose.ObjectId, ref: 'Drop' }],
    }, {
        versionKey: false,
    });

    return mongoose.model('Member', memberSchema);
};
