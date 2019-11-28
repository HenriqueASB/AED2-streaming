// server.js
const express = require('express')
    , app = express()
    , fs = require('fs')
    , getStat = require('util').promisify(fs.stat)
    , huffman = require('./src/huffman')
    , lzw = require('./src/Lempel-Ziv-Welch')
    , util = require('./src/feramentas')
    , request = require('request');

app.use(express.static('public'));

// 10 * 1024 * 1024 // 10MB
// usamos um buffer minúsculo! O padrão é 64k
const highWaterMark =  2;

app.get('/audio', async (req, res) => {

    const filePath = './audioMeioSec.ogg';
    const stat = await getStat(filePath);
    console.log(stat);    
    // informações sobre o tipo do conteúdo e o tamanho do arquivo
    res.writeHead(200, {
        'Content-Type': 'audio/ogg',
        'Content-Length': stat.size
    });

    
    var arquivo = await fs.readFileSync('./audioMeioSec.ogg', (err, data) => {
        if (err) throw err;
        return data;
    });
    
    
    const comprimidoHuff = huffman.encode(arquivo.toString('hex'));
    
    const comprimidoLzw = lzw.compress(comprimidoHuff);
       
    const descompLzw = lzw.decompress(comprimidoLzw);
    
    const descompHuff = huffman.decode(descompLzw);
    
    var buffer = Buffer.from(descompHuff,'hex');
    console.log(arquivo);
    console.log(buffer)
    
    var arquivo = await fs.writeFileSync('coconut.ogg', buffer, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
    
    const stream = fs.createReadStream('./coconut.ogg', { highWaterMark });
    
    // só exibe quando terminar de enviar tudo
    stream.on('end', () => console.log('acabou'));
    
    // faz streaming do audio 
    stream.pipe(res);
});


app.get('/select', (req, res) =>{
    console.log("aqui",req.query.nome)
    const nome = req.query.nome;
    var results = util.sql.execSQLQuery(`SELECT * FROM aed2.musicas where nome = '${nome}';`, res);
})

app.get('/insert', (req, res) =>{
    const nome = 'oi'
    var dados = Buffer.from("sadksdkhsadjkhdjhdsjkhd");
    var results = util.sql.execSQLQuery(`INSERT INTO aed2.musicas (nome, dados) VALUES ('${nome}', '${dados}');`, res);
})
app.get('/teste', (req, res) =>{
    
    request('http://localhost:3000/select?nome=teste', (err, res, body) => {
        // console.log(JSON.parse(body)[0].dados);
        });
        res.json('foi')


})

app.listen(3000, () => console.log('app is running'));