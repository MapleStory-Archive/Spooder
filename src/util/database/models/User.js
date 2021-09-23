module.exports = (mongoose) => {
    const userSchema = new mongoose.Schema({
        id: { type: String, unique: true },
        username: String,
        discriminator: String,
    }, {
        versionKey: false,
    });

    return mongoose.model('User', userSchema);
};
