module.exports = (mongoose) => {
    const memberSchema = new mongoose.Schema({
        guildId: String,
        userId: String,
        name: String,
    }, {
        versionKey: false,
    });

    return mongoose.model('Member', memberSchema);
};
