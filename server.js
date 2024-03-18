const express = require('express')
const mongoose = require('mongoose')
// const Product = require('./models/episodioModel')
mongoose.set('strictQuery', false);
const app = express()
app.use(express.json())
const port = 3000

mongoose.connect('mongodb+srv://sheriffvongola:NBNReL02k617MTrU@anime.as6tlgm.mongodb.net/')

const Anime = mongoose.model('Anime', {
    _id: { type: String, required: true },
    title: String,
    english: String,
    description: String,
    image: String,
    trailer: String,
    season: String,
    dub: Boolean,
    time: String,
    genres: String,
    completed: Boolean,
    studio: String
})

app.get('/', async(req, res) => {
    try {
        const search = req.query.search;
        const regex = new RegExp(search, 'i');

        const animes = await Anime.find({
            $or: [
                { title: { $regex: regex } },
                { studio: { $regex: regex } },
                { english: { $regex: regex } },
                
                // Adicione outros campos relevantes aqui
            ]
        });

        if (!animes || animes.length === 0) {
            return res.status(404).send('Nenhum anime encontrado');
        }

        return res.send(animes);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});




app.get('/:id', async (req, res) => {
    try {
        const anime = await Anime.findById(req.params.id);
        if (!anime) {
            return res.status(404).send('Anime não encontrado');
        }
        return res.send(anime);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

app.delete('/:id', async (req, res) => {
    try {
        const deletedAnime = await Anime.findByIdAndRemove(req.params.id);
        if (!deletedAnime) {
            return res.status(404).send('Anime não encontrado');
        }
        return res.send(deletedAnime);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});


// Rota para atualizar anime ja existente
app.put('/:id', async (req, res) => {
    try {
        const updatedAnime = await Anime.findByIdAndUpdate(req.params.id, {
            _id: req.body._id,
            title: req.body.title,
            english: req.body.english,
            description: req.body.description,
            image: req.body.image,
            trailer: req.body.trailer,
            season: req.body.season,
            dub: req.body.dub,
            time: req.body.time,
            genres: req.body.genres,
            completed: req.body.completed,
            studio: req.body.studio
        }, {
            new: true
        });

        if (!updatedAnime) {
            return res.status(404).send('Anime não encontrado');
        }

        const responseAnime = {
            _id: updatedAnime._id,
            title: updatedAnime.title,
            english: updatedAnime.english,
            description: updatedAnime.description,
            image: updatedAnime.image,
            trailer: updatedAnime.trailer,
            season: updatedAnime.season,
            dub: updatedAnime.dub,
            time: updatedAnime.time,
            genres: updatedAnime.genres,
            completed: updatedAnime.completed,
            studio: updatedAnime.studio
        };

        return res.send(responseAnime);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para criar um anime
app.post('/', async (req, res) => {
    const anime = new Anime({
        _id: req.body._id,
        title: req.body.title,
        english: req.body.english,
        description: req.body.description,
        image: req.body.image,
        trailer: req.body.trailer,
        season: req.body.season,
        dub: req.body.dub,
        time: req.body.time,
        genres: req.body.genres,
        completed: req.body.completed,
        studio: req.body.studio
    })

    await anime.save()
    return res.send(anime)
})

app.listen(port, () => {
    console.log('App running')
})



const EpisodioSchema = new mongoose.Schema({
    number: { type: Number, required: true }, // Adiciona a propriedade "id" para o número do episódio
    title: String,
    image: String,
    video: String,
    anime: String,
    download: String,
});

const Episodio = mongoose.model('Episodio', EpisodioSchema);

// Rota para obter um episódio de um anime específico
app.get('/:animeId/episodios/:id', async (req, res) => {
    try {
        const episodio = await Episodio.findOne({
            anime: req.params.animeId,
            number: req.params.id
        }).populate('anime'); // Popula os dados do anime associado ao episódio
        
        if (!episodio) {
            return res.status(404).send('Episódio não encontrado');
        }
        
        return res.send(episodio);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para obter todos os episódios de um anime específico
app.get('/:animeId/episodios', async (req, res) => {
    try {
        // Encontra todos os episódios associados ao anime específico
        const episodios = await Episodio.find({ anime: req.params.animeId }).sort({ number: 1 });
        
        // Verifica se há episódios encontrados
        if (episodios.length === 0) {
            return res.status(404).send('Nenhum episódio encontrado para este anime');
        }
        
        return res.send(episodios);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});


// Rota para criar um novo episódio associado a um anime específico
app.post('/:animeId/episodios', async (req, res) => {
    try {
        const animeId = req.params.animeId;
        const anime = await Anime.findById(animeId);
        if (!anime) {
            return res.status(404).send('Anime não encontrado');
        }

        const { number, title, image, video, download } = req.body;

        const episodio = new Episodio({
            number: number,
            title: title,
            image: image,
            video: video,
            download: download,
            anime: animeId
        });

        await episodio.save();

        return res.status(201).send(episodio);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para atualizar um episódio específico de um anime pelo número do episódio
app.put('/:animeId/episodios/:id', async (req, res) => {
    try {
        const episodio = await Episodio.findOneAndUpdate(
            { anime: req.params.animeId, number: req.params.id },
            req.body,
            { new: true }
        );

        if (!episodio) {
            return res.status(404).send('Episódio não encontrado para este anime');
        }

        return res.send(episodio);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para excluir um episódio específico de um anime pelo número do episódio
app.delete('/:animeId/episodios/:id', async (req, res) => {
    try {
        const deletedEpisodio = await Episodio.findOneAndRemove({
            anime: req.params.animeId,
            number: req.params.id
        });

        if (!deletedEpisodio) {
            return res.status(404).send('Episódio não encontrado para este anime');
        }

        return res.send(deletedEpisodio);
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});



// const AWS = require('aws-sdk');

// AWS.config.update({
//     accessKeyId: 'AKIA6GBMBE645KYG6Q6G',
//     secretAccessKey: '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',
//     region: 'sa-east-1'
//   });

//   const s3 = new AWS.S3();

// // Função para gerar uma URL assinada para o vídeo
// async function generateSignedUrl(video) {
//     const params = {
//         Bucket: 'cinemaotaku',
//         Key: video,
//       Expires: 7200 // Expira em 2 horas
//     };
    
//     return new Promise((resolve, reject) => {
//         s3.getSignedUrl('getObject', params, (err, url) => {
//         if (err) {
//           reject(err);
//         } else {
//           resolve(url);
//         }
//       });
//     });
//   }