const { buscarQuestoesFepese, buscarQuestoesIbade, buscarVideosCanalYoutube } = require('./scrapingUtils');

async function testarQuestoesFepese() {
  console.log('Testando scraping de questões FEPESE para tema: português');
  const questoes = await buscarQuestoesFepese('português');
  console.log('Resultado FEPESE:', questoes);
}

async function testarQuestoesIbade() {
  console.log('Testando scraping de questões IBADE para tema: português');
  const questoes = await buscarQuestoesIbade('português');
  console.log('Resultado IBADE:', questoes);
}

async function testarVideosCanal() {
  console.log('Testando scraping de vídeos do canal Pedagoflix para tema: educação');
  const videos = await buscarVideosCanalYoutube('Pedagoflix', 'educação');
  console.log('Resultado vídeos Pedagoflix:', videos);
}

(async () => {
  await testarQuestoesFepese();
  await testarQuestoesIbade();
  await testarVideosCanal();
  process.exit(0);
})(); 