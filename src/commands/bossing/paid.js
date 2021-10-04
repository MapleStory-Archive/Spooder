module.exports = {
    data: {
        name: 'paid',
        description: 'Mark payments for a user.',
        options: [{
            name: 'user',
            description: 'Input the user getting paid here.',
            type: 6,
            required: true,
        }],
    },
    async execute(interaction) {
        console.log(interaction);
    },
};
