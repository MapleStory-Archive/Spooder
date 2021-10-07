module.exports = (mongoose) => {
    const memberSchema = new mongoose.Schema({
        guildId: String,
        userId: String,
        name: String,
        drops: [{ type: mongoose.ObjectId, ref: 'Drop' }],
        paychecks: [{ type: mongoose.ObjectId, ref: 'Drop', autopopulate: true }],
    }, {
        versionKey: false,
    });

    memberSchema.virtual('payment').get(function() {
        let payment = 0;

        this.paychecks.forEach(drop => {
            payment += drop.split;
        });

        return payment;
    });

    memberSchema.plugin(require('mongoose-autopopulate'));

    return mongoose.model('Member', memberSchema);
};
