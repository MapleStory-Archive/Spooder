module.exports = {
    data: {
        name: '',
        description: '',
        options: [{
            name: '',
            description: '',
            type: '',
            required: true,
        }],
    },
    async execute(interaction) {
        console.log(interaction);
    },
};
