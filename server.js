// server.js
const express = require('express')
    , app = express()
    , fs = require('fs')
    , getStat = require('util').promisify(fs.stat)
    , huffman = require('./huffman')
    , lzw = require('./Lempel-Ziv-Welch');

app.use(express.static('public'));

// 10 * 1024 * 1024 // 10MB
// usamos um buffer minúsculo! O padrão é 64k
const highWaterMark =  2;

app.get('/audio', async (req, res) => {

    const filePath = './audioMeioSec.ogg';
    const stat = await getStat(filePath);
    console.log(stat);    
    // console.log(huffman.encode('hdhfhffhfdhfjdfhjhadfjkhjkhjhjkhajkhadfsjkhadfjkajkhkhdf'));
    // informações sobre o tipo do conteúdo e o tamanho do arquivo
    res.writeHead(200, {
        'Content-Type': 'audio/ogg',
        'Content-Length': stat.size
    });

    const stream = fs.createReadStream(filePath, { highWaterMark });

    var arquivo = await fs.readFileSync('./audioMeioSec.ogg', (err, data) => {
        if (err) throw err;
        // console.log(data);
        return data;
    });
    // const huf = huffman.encode(arquivo.toString('hex'));
    // const dec = huffman.decode(huf);
    const comp = lzw.compress(arquivo.toString('hex'));
    const decomp = lzw.decompress(comp);
    var buffer = Buffer.from(decomp,'hex');
    console.log(arquivo);
    console.log(buffer)

    fs.writeFile('coconut.ogg', buffer, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });

    // só exibe quando terminar de enviar tudo
    stream.on('end', () => console.log('acabou'));

    // faz streaming do audio 
    stream.pipe(res);
});

app.listen(3000, () => console.log('app is running'));