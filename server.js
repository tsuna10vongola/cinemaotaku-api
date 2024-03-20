const express = require('express')
const mongoose = require('mongoose')
// const Product = require('./models/episodioModel')
mongoose.set('strictQuery', false);
const app = express()
app.use(express.json())
const port = 3000

mongoose.connect('mongodb+srv://sheriffvongola:NBNReL02k617MTrU@anime.as6tlgm.mongodb.net/')

const AnimeSchema = new mongoose.Schema({
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
    studio: String,
    movie: Boolean,
}, { timestamps: true });

const Anime = mongoose.model('Anime', AnimeSchema, 'animes');


app.get('/', async(req, res)=>{

    try{
        const animes = await Anime.find()
    if(!animes){
        return res.status(404).send('Anime não encontrado');
    }
    return res.send(animes)
    }
    
    catch(error){
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
})

app.get('/search', async (req, res) => {
    try {
        const search = req.query.anime; // Mudança aqui para corresponder ao parâmetro 'anime'
        const regex = new RegExp(search, 'i');

        if (!search) {
            return res.status(400).send('Por favor, forneça um termo de pesquisa');
        }
        
        const animes = await Anime.find({
            $or: [
                { title: { $regex: regex } },
                // { description: { $regex: regex } },
                // { studio: { $regex: regex } },
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
            studio: req.body.studio,
            movie: req.body.movie,
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
            studio: updatedAnime.studio,
            movie: updatedAnime.movie,
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
        studio: req.body.studio,
        movie: req.body.movie,
    })

    await anime.save()
    return res.send(anime)
})

app.listen(port, () => {
    console.log('App running')
})



const EpisodioSchema = new mongoose.Schema({
    number: { type: Number, required: true, unique: true }, // Adiciona a propriedade "id" para o número do episódio
    title: String,
    image: String,
    video: String,
    anime: String,
    download: String,
},
{ timestamps: true }
);

const Episodio = mongoose.model('Episodio', EpisodioSchema, 'episodios');

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
        // Verifica se já existe um episódio com o mesmo número para o anime específico
        const existingEpisode = await Episodio.findOne({ anime: animeId, number: number });
        if (existingEpisode) {
            return res.status(400).send('Um episódio com este número já existe para este anime');
        }
        
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
        const existingEpisode = await Episodio.findOne({ anime: req.params.animeId, number: req.body.number });
        if (existingEpisode && existingEpisode._id.toString() !== req.params.id) {
            return res.status(400).send('Um episódio com este número já existe para este anime');
        }

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

app.get('/recentes/animes', async (req, res) => {
    try {
        // Consulta para obter os últimos animes adicionados
        const recentAnimes = await Anime.find().sort({ createdAt: -1 })
        
        // Verificar se há animes recentes encontrados
        if (recentAnimes.length === 0) {
            return res.status(404).send('Nenhum anime recente encontrado');
        }

        return res.send(recentAnimes);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

app.get('/recentes/episodes', async (req, res) => {
    try {
        // Agregação para obter apenas o último episódio de cada anime
        const recentEpisodes = await Episodio.aggregate([
            { $sort: { anime: 1, createdAt: -1 } }, // Ordena os episódios por anime e data de criação descendente
            {
                $group: {
                    _id: '$anime', // Agrupa os episódios pelo campo 'anime'
                    latestEpisode: { $first: '$$ROOT' } // Projeta apenas o primeiro documento de cada grupo (último episódio)
                }
            },
            { $replaceRoot: { newRoot: '$latestEpisode' } } // Substitui o documento raiz pelo último episódio de cada grupo
        ]);

        // Verificar se há episódios recentes encontrados
        if (recentEpisodes.length === 0) {
            return res.status(404).send('Nenhum episódio recente encontrado');
        }

        return res.send(recentEpisodes);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para obter o último episódio dublado de cada anime
app.get('/recentes/episodes/dublados', async (req, res) => {
    try {
        const recentDubbedEpisodes = await Episodio.aggregate([
            { $lookup: { from: 'animes', localField: 'anime', foreignField: '_id', as: 'animeInfo' } },
            { $unwind: '$animeInfo' },
            { $match: { 'animeInfo.dub': true } }, // Filtra apenas os episódios cujo anime está dublado
            { $sort: { anime: 1, createdAt: -1 } },
            {
                $group: {
                    _id: '$anime', 
                    latestEpisode: { $first: '$$ROOT' } // Aqui corrigimos para pegar o primeiro episódio de cada grupo (último episódio dublado)
                }
            },
            { $replaceRoot: { newRoot: '$latestEpisode' } } 
        ]);

        if (recentDubbedEpisodes.length === 0) {
            return res.status(404).send('Nenhum episódio dublado recente encontrado');
        }

        return res.send(recentDubbedEpisodes);
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para obter o último episódio legendado de cada anime
app.get('/recentes/episodes/legendados', async (req, res) => {
    try {
        const recentSubtitledEpisodes = await Episodio.aggregate([
            { $lookup: { from: 'animes', localField: 'anime', foreignField: '_id', as: 'animeInfo' } },
            { $unwind: '$animeInfo' },
            { $match: { 'animeInfo.dub': false } }, // Filtra apenas os episódios cujo anime não está dublado
            { $sort: { anime: 1, createdAt: -1 } },
            {
                $group: {
                    _id: '$anime', 
                    latestEpisode: { $first: '$$ROOT' } // Aqui corrigimos para pegar o primeiro episódio de cada grupo (último episódio legendado)
                }
            },
            { $replaceRoot: { newRoot: '$latestEpisode' } } 
        ]);

        if (recentSubtitledEpisodes.length === 0) {
            return res.status(404).send('Nenhum episódio legendado recente encontrado');
        }

        return res.send(recentSubtitledEpisodes);
    } catch (error) {
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