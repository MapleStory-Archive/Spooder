module.exports = (mongoose) => {
    const guildSchema = new mongoose.Schema({
        id: { type: String, unique: true },
        name: String,
    }, {
        versionKey: false,
    });

    return mongoose.model('Guild', guildSchema);
};
