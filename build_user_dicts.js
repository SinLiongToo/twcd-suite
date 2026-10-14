const fs = require('fs');

async function run() {
  console.log('1. Fetching CHHITJIA_JITIAN...');
  const html = await fetch('https://raw.githubusercontent.com/SinLiongToo/CHHITJIA_JITIAN/main/index.html').then(r => r.text());
  const startTag = '<script id="dict-data" type="application/json">';
  const endTag = '</script>';
  const startIdx = html.indexOf(startTag);
  if (startIdx === -1) throw new Error('dict-data start not found');
  const endIdx = html.indexOf(endTag, startIdx + startTag.length);
  if (endIdx === -1) throw new Error('dict-data end not found');
  const jsonStr = html.substring(startIdx + startTag.length, endIdx);
  const chhitjiaRaw = JSON.parse(jsonStr);
  console.log('CHHITJIA raw entries:', Object.keys(chhitjiaRaw).length);

  const chhitjiaCompact = {};
  for (const [w, info] of Object.entries(chhitjiaRaw)) {
    const reading = (info.readings || [])[0] || {};
    const rom = reading.rom || '';
    const examples = (reading.examples || []).slice(0, 2).map(e => ({
      t: e.title || '',
      h: e.han || '',
      r: e.rom || ''
    }));
    chhitjiaCompact[w] = { r: rom, e: examples };
  }
  console.log('Sample CHHITJIA 南北:', chhitjiaCompact['南北']);

  console.log('2. Fetching laigoakho_Tejinsiu medical glossary...');
  const md = await fetch('https://raw.githubusercontent.com/SinLiongToo/laigoakho_Tejinsiu_ebook/main/docs/05_glossary/medical_glossary.md').then(r => r.text());
  const laigoakho = [];
  const lines = md.split('\n');
  for (const l of lines) {
    if (!l.startsWith('|') || l.includes('白話字') || l.includes(':---')) continue;
    const parts = l.split('|').map(s => s.trim());
    if (parts.length >= 4) {
      const poj = parts[1].replace(/,$/, '').trim();
      const han = parts[2].trim();
      const eng = parts[3].trim();
      const note = (parts[4] || '').trim();
      if (poj && (han || eng)) {
        laigoakho.push({ p: poj, h: han, e: eng, n: note });
      }
    }
  }
  console.log('laigoakho entries:', laigoakho.length);
  console.log('Sample laigoakho 0-2:', laigoakho.slice(0, 3));

  console.log('3. Fetching hok_kok_ebook (杜信龍《護國 評論集》)...');
  const hokkokRaw = await fetch('https://raw.githubusercontent.com/SinLiongToo/hok_kok_ebook/main/dict_data.json').then(r => r.json());
  console.log('hok_kok raw entries:', Object.keys(hokkokRaw).length);

  const hokkokCompact = {};
  for (const [w, info] of Object.entries(hokkokRaw)) {
    const reading = (info.readings || [])[0] || {};
    const rom = reading.rom || '';
    const examples = (reading.examples || []).slice(0, 3).map(e => ({
      t: e.title || '',
      h: e.han || '',
      r: e.rom || ''
    }));
    hokkokCompact[w] = {
      r: rom,
      c: info.total || reading.count || 1,
      p: !!info.phrase,
      e: examples
    };
  }
  console.log('Sample hok_kok beh:', hokkokCompact['beh']);

  // Save to data/
  fs.writeFileSync('data/chhitjia.json', JSON.stringify(chhitjiaCompact), 'utf8');
  fs.writeFileSync('data/laigoakho.json', JSON.stringify(laigoakho), 'utf8');
  fs.writeFileSync('data/hokkok.json', JSON.stringify(hokkokCompact), 'utf8');

  // Also package as client-side JS bundle
  const bundleJs = `window.USER_DICTS = {
  chhitjia: ${JSON.stringify(chhitjiaCompact)},
  laigoakho: ${JSON.stringify(laigoakho)},
  hokkok: ${JSON.stringify(hokkokCompact)}
};\n`;
  fs.writeFileSync('data_user_dicts.js', bundleJs, 'utf8');
  console.log('Generated data_user_dicts.js successfully!');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
