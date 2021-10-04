module.exports = {
    data: {
        name: 'paycheck',
        description: 'Check your or another player\'s paycheck.',
        options: [{
            name: 'user',
            description: 'Input the user here.',
            type: 6,
            required: false,
        }],
    },
    async execute(interaction) {
        console.log(interaction);
    },
};
