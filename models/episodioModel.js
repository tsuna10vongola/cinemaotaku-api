const mongoose = require('mongoose')

const animeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Please enter the anime name"]
        },
        episode: {
            type: Number,
            required: true,
        },
        video: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true
    }
)


const Anime = mongoose.model('Anime', animeSchema);

module.exports = Anime;