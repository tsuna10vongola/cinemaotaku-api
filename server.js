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

// Rota para obter a lista de animes com paginação
app.get('/anime-list-page', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 32; // Limite de animes por página
        const skip = (page - 1) * limit; // Pular os documentos das páginas anteriores

        // Obter o número total de animes que não são filmes
        const totalAnimes = await Anime.countDocuments({ movie: { $ne: true } });

        // Obter a lista de animes que não são filmes da página atual
        const animeList = await Anime.find({ movie: { $ne: true } }).sort({ title: 1 }).skip(skip).limit(limit);

        return res.json({ totalAnimes, animeList });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});

// Rota para obter a lista de animes com paginação
app.get('/movie-list-page', async (req, res) => {
    try {
        const page = req.query.page || 1;
        const limit = 32; // Limite de animes por página
        const skip = (page - 1) * limit; // Pular os documentos das páginas anteriores

        // Obter o número total de animes que são filmes
        const totalAnimes = await Anime.countDocuments({ movie: true });

        // Obter a lista de animes que são filmes da página atual
        const animeList = await Anime.find({ movie: true }).sort({ title: 1 }).skip(skip).limit(limit);

        return res.json({ totalAnimes, animeList });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});



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

        const episodios = req.body; // Obter os episódios diretamente de req.body

        // Verificar no banco de dados se já existem episódios com as mesmas propriedades
        const existingEpisodes = await Episodio.find({ anime: animeId, number: { $in: episodios.map(ep => ep.number) } });
        if (existingEpisodes.length > 0) {
            const existingNumbers = existingEpisodes.map(ep => ep.number);
            const duplicateNumbers = existingNumbers.join(', ');
            return res.status(400).send(`Os números de episódio duplicados encontrados são: ${duplicateNumbers}`);
        }

        const existingVideos = await Episodio.find({ anime: animeId, video: { $in: episodios.map(ep => ep.video) } });
        if (existingVideos.length > 0) {
            const existingNumbers = existingVideos.map(ep => ep.video);
            const duplicateNumbers = existingNumbers.join(', ');
            return res.status(400).send(`Os videos de episódio duplicados encontrados são: ${duplicateNumbers}`);
        }

        const existingImages = await Episodio.find({ anime: animeId, image: { $in: episodios.map(ep => ep.image) } });
        if (existingImages.length > 0) {
            const existingNumbers = existingImages.map(ep => ep.image);
            const duplicateNumbers = existingNumbers.join(', ');
            return res.status(400).send(`As thumbnails de episódio duplicados encontrados são: ${duplicateNumbers}`);
        }

        // Conjuntos para armazenar números, vídeos e imagens enviados nas requisições
        const numbersSet = new Set();
        const videosSet = new Set();
        const imagesSet = new Set();

        // Verificar duplicatas nos episódios enviados na requisição
        for (const episode of episodios) {
            const number = episode.number; // Defina a variável number dentro do loop
        
            if (numbersSet.has(number)) {
                return res.status(400).send(`Dois episódios com o mesmo número ${number} foram enviados na requisição`);
            }
            numbersSet.add(number);
        
            if (videosSet.has(episode.video)) {
                return res.status(400).send(`Dois episódios com o mesmo vídeo ${episode.video} foram enviados na requisição`);
            }
            videosSet.add(episode.video);
        
            if (imagesSet.has(episode.image)) {
                return res.status(400).send(`Dois episódios com a mesma imagem ${episode.image} foram enviados na requisição`);
            }
            imagesSet.add(episode.image);
        }
        

        // Salvar o episódio se não houver duplicatas
        const savedEpisodes  = await Episodio.insertMany(episodios.map(ep => ({
            number: ep.number,
            title: ep.title,
            image: ep.image,
            video: ep.video,
            download: ep.download,
            anime: animeId
        })));

        // await episodio.save();

        return res.status(201).send(savedEpisodes );
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});





// Rota para atualizar vários episódios de um anime
app.put('/:animeId/episodios', async (req, res) => {
    try {
        const animeId = req.params.animeId;
        const episodesToUpdate = req.body;

        // Array para armazenar os IDs dos episódios atualizados
        const updatedEpisodesIds = [];

        // Itera sobre cada episódio a ser atualizado
        for (const episode of episodesToUpdate) {
            const episodeNumber = episode.number;

            // Procura pelo episódio a ser atualizado usando o número do episódio e o ID do anime
            const updatedEpisode = await Episodio.findOneAndUpdate(
                { anime: animeId, number: episodeNumber }, // Filtro para encontrar o episódio
                episode, // Novos dados a serem atualizados
                { new: true } // Opção para retornar o documento atualizado
            );

            if (updatedEpisode) {
                updatedEpisodesIds.push(updatedEpisode); // Adiciona os episódios atualizados ao array
            }
        }

        // Verifica se algum episódio foi atualizado
        if (updatedEpisodesIds.length === 0) {
            return res.status(404).send('Nenhum episódio encontrado para atualização');
        }

        return res.send(updatedEpisodesIds); // Retorna os IDs dos episódios atualizados
    } catch(error) {
        console.error(error);
        return res.status(500).send('Erro Interno do Servidor');
    }
});



// Rota para atualizar um episódio específico de um anime pelo número do episódio
app.put('/:animeId/episodios/:id', async (req, res) => {
    try {
        // const existingEpisode = await Episodio.findOne({ anime: req.params.animeId, number: req.body.number });
        // if (existingEpisode && existingEpisode._id.toString() !== req.params.id) {
        //     return res.status(400).send('Um episódio com este número já existe para este anime');
        // }

        // const existingVideo = await Episodio.findOne({ anime: req.params.animeId, video: req.body.video });
        // if (existingVideo && existingVideo._id.toString() !== req.params.id) {
        //     return res.status(400).send('Um episódio com este video já existe para este anime');
        // }

        // const existingImage = await Episodio.findOne({ anime: req.params.animeId, image: req.body.image });
        // if (existingImage && existingImage._id.toString() !== req.params.id) {
        //     return res.status(400).send('Um episódio com esta imagem já existe para este anime');
        // }


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
// Rota para obter os últimos episódios dublados de cada anime
app.get('/recentes/episodes/dublados', async (req, res) => {
    try {
        const recentDubbedEpisodes = await Episodio.aggregate([
            { $lookup: { from: 'animes', localField: 'anime', foreignField: '_id', as: 'animeInfo' } },
            { $unwind: '$animeInfo' },
            { $match: { 'animeInfo.dub': true } }, // Filter dubbed episodes
            {
                $sort: { 'animeInfo.createdAt': -1, createdAt: -1 } // Sort by anime creation & episode creation (desc)
            },
            {
                $group: {
                    _id: '$anime',
                    latestEpisode: { $first: '$$ROOT' } // Get the first episode (latest dubbed)
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

// Rota para obter os últimos episódios legendados de cada anime
app.get('/recentes/episodes/legendados', async (req, res) => {
    try {
        const recentSubtitledEpisodes = await Episodio.aggregate([
            { $lookup: { from: 'animes', localField: 'anime', foreignField: '_id', as: 'animeInfo' } },
            { $unwind: '$animeInfo' },
            { $match: { 'animeInfo.dub': false } }, // Filter subtitled episodes
            {
                $sort: { 'animeInfo.createdAt': -1, createdAt: -1 } // Sort by anime creation & episode creation (desc)
            },
            {
                $group: {
                    _id: '$anime',
                    latestEpisode: { $first: '$$ROOT' } // Get the first episode (latest subtitled)
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