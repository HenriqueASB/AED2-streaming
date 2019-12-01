//Aqui são importadas as dependencias que usaremos durante o codigo 
//express é o servidor web
const express = require('express')
// aqui eu seto o servidor na variavel app que vai ser o objeto do nosso aplicativo 
    , app = express()
// fs é uma biblioteca de manipulaçao de arquivos
    , fs = require('fs')
// aqui eu estou usando a função promisify para criar uma versão da função stat da fs que é sincrona
    , getStat = require('util').promisify(fs.stat)
// aqui importo os algoritimos de compressão que foram implementados 
    , huffman = require('./src/huffman')
    , lzw = require('./src/Lempel-Ziv-Welch');

// nessa linha se inicia o programa usando a função use para setar uma permição estatica publica para a aplicação 
app.use(express.static('public'));

// aqui é definido o tamanho do buffer 
// usamos um buffer minúsculo! O padrão é 64k, esse tamanha é para simular bara de carregamento 
const highWaterMark =  2;

// aqui se cria uma rota de API do tipo GET para a aplicação que vai retornar o stream de audio
app.get('/audio', async (req, res) => {

    // caminho do arquivo 
    const filePath = './audioMeioSec.ogg';
    // pego as informaçoes do arquivo e coloco em stat
    const stat = await getStat(filePath);
    // imprime stat no console
    console.log(stat);    
    // informações sobre o tipo do conteúdo e o tamanho do arquivo
    res.writeHead(200, {
        'Content-Type': 'audio/ogg',
        'Content-Length': stat.size
    });

    // aqui o arquivo é lido e retorna um array de bytes
    var arquivo = await fs.readFileSync('./audioMeioSec.ogg', (err, data) => {
        if (err) throw err;
        return data;
    });
    
    // é feita a compressão com o algoritimo de huffman, e o array de bytes é convertido para string 
    const comprimidoHuff = huffman.encode(arquivo.toString('hex'));
    // é feita a compressão com o algoritimo lzw 
    const comprimidoLzw = lzw.compress(comprimidoHuff);
    // é feita a descompreção com o algoritimo lzw       
    const descompLzw = lzw.decompress(comprimidoLzw);
    // é feita a compressão com o algoritimo huffman    
    const descompHuff = huffman.decode(descompLzw);
    // aqui a string é convertida de volta em um array de bytes 
    var buffer = Buffer.from(descompHuff,'hex');
    console.log(arquivo);
    console.log(buffer)
    // se escreve um arqivo novo com o array resultante para comprovar que não há percas na compreção 
    var arquivo = await fs.writeFileSync('coconut.ogg', buffer, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
    });
    // aqui o arquivo noco é lido e a stream é gerada
    const stream = fs.createReadStream('./coconut.ogg', { highWaterMark });
    
    // só exibe quando terminar de enviar tudo
    stream.on('end', () => console.log('acabou'));
    
    // faz streaming do audio 
    stream.pipe(res);
});

// esse comando coloca o app para escultar requisiçoes na porta 3000
app.listen(3000, () => console.log('app is running'));