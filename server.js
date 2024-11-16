import fastify from "fastify";
import cors from '@fastify/cors'
import { Musica, Playlist } from "./database/models.js";
import database from "./database/db.js";


const server = fastify({logger: false})
server.register(cors, {
    origin: ['*']
})

server.get('/', async (request, reply)=>{
    return 'burro'
})


server.get('/musicas', async (request, reply)=>{
  
  const {search, category} = request.query
  console.log(search)
  let result
  if(search || category){
    if(search && !category){
      result = await database.query(`SELECT * FROM Musicas WHERE title LIKE '%${search}%' OR music LIKE '%${search}%';`)
      
    }
    else if(!search && category){
      result = await database.query(`SELECT * FROM Musicas WHERE category = '${category}';`)
    }
    else if (search && category){
      result = await database.query(`SELECT * FROM Musicas WHERE title LIKE '%${search}%' OR music LIKE '%${search}%' AND category = '${category}';`)
    } 
  }
  else{
    result = await database.query('SELECT * FROM Musicas')
  }
  reply.send(result[0])
  return JSON.stringify(result[0])
})


server.get('/musicas/:id', async (request, reply)=>{
  const {id} = request.params
   const result = await database.query('SELECT * FROM Musicas WHERE id='+id)
   let tmp = result[0]
   const newResult = {meta: {id:tmp[0].id, title:tmp[0].title, category: tmp[0].category}, musica:tmp[0].music} 
   reply.send(newResult)
})


server.post('/musicas', async (request, reply)=>{
   const body = request.body
   console.log(body)
   const saving = true
   let createdMusica
   try{

   saving?createdMusica = await Musica.create({title: body.title, music: JSON.stringify(body.music), category:body.category}):()=>{}
   
   }
   catch(err){
    console.log(err)
   }
   console.log(createdMusica.toJSON())
   return createdMusica.toJSON()

})

server.put('/musicas/:id', async (request, reply)=>{
  const {id} = request.params
  const musicData = request.body
  const result = await Musica.findByPk(id)
  console.log(musicData)
  
  try{
    result.set(
      {
        title: musicData.title,
        category: musicData.category,
        music: JSON.stringify(musicData.music)
      }
    )

    result.save()
  }
  catch(err){
    return {'error': 'Impossivel editar produto'}
  }
  
  return JSON.stringify({'status': 'changed'})
})

server.delete('/musicas/:id', async (request, reply)=>{
  const {id} = request.params
  console.log('qqr coisa sla')
  try{
    database.query('DELETE From Musicas WHERE id='+id)
  }
  catch(err){
    return {'error': 'Impossivel apagar produto'}
  }
  
  return JSON.stringify({'status': 'deleted'})
})

const start = async () => {
    try {
      await server.listen({ port: 3001, host:'192.168.175.56' });
      console.log('Servidor rodando em http://localhost:3001');
    } catch (err) {
      server.log.error(err);
      process.exit(1);
    }
  };
  
  start();