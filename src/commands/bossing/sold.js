module.exports = {
    data: {
        name: 'sold',
        description: 'Mark an item drop as sold.',
        options: [{
            name: 'drop',
            description: 'Input the drop ID here.',
            type: 4,
            required: true,
        }, {
            name: 'price',
            description: 'Input the price the drop was sold for.',
            type: 4,
            require: true,
        }],
    },
    async execute(interaction) {
        console.log(interaction);
    },
};
