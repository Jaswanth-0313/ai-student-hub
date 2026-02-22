const https = require('https')
const fs = require('fs')
const path = require('path')

const outDirs = [
  path.join(__dirname, '..', 'frontend', 'src', 'assets', 'logos'),
  path.join(__dirname, '..', 'frontend', 'public', 'assets', 'tools'),
  path.join(__dirname, '..', 'public', 'assets', 'tools')
]
outDirs.forEach(d=>{ if(!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }) })

const logos = {
  chatgpt: [
    'https://upload.wikimedia.org/wikipedia/commons/0/04/OpenAI_Logo.svg',
    'https://chat.openai.com/favicon.ico'
  ],
  gamma: [
    'https://gamma.app/favicon.ico',
    'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/gamma.svg'
  ],
  lovable: [
    'https://via.placeholder.com/120?text=Lovable'
  ],
  figma: [
    'https://www.figma.com/favicon.ico',
    'https://upload.wikimedia.org/wikipedia/commons/3/33/Figma-logo.svg'
  ],
  canva: [
    'https://www.canva.com/favicon.ico',
    'https://upload.wikimedia.org/wikipedia/commons/2/2f/Canva_Logo.svg'
  ],
  notion: [
    'https://www.notion.so/favicon.ico'
  ],
  perplexity: [
    'https://perplexity.ai/favicon.ico'
  ],
  github: [
    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
    'https://github.com/favicon.ico'
  ],
  leetcode: [
    'https://leetcode.com/favicon.ico'
  ]
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest)
    const client = url.startsWith('https') ? https : null
    if (!client) return reject(new Error('Only https supported'))
    client.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        // follow redirect
        return download(res.headers.location, dest).then(resolve).catch(reject)
      }
      if (res.statusCode !== 200) {
        file.close()
        fs.unlinkSync(dest)
        return reject(new Error(`Failed to download ${url} - status ${res.statusCode}`))
      }
      res.pipe(file)
      file.on('finish', () => file.close(() => resolve()))
    }).on('error', (err) => {
      try { file.close() } catch(e){}
      try { fs.unlinkSync(dest) } catch(e){}
      reject(err)
    })
  })
}

;(async ()=>{
  for (const [key, urls] of Object.entries(logos)){
    let saved = false
    for (const url of urls){
      try{
        const ext = path.extname(new URL(url).pathname) || '.png'
        const name = `${key}${ext}`
        for (const out of outDirs){
          const dest = path.join(out, name)
          await download(url, dest)
        }
        console.log('Saved', key, 'from', url)
        saved = true
        break
      }catch(err){
        console.warn('Failed to fetch', url, err.message)
        continue
      }
    }
    if(!saved){
      // fallback placeholder
      const placeholderUrl = `https://via.placeholder.com/120?text=${encodeURIComponent(key)}`
      try{
        const ext = '.png'
        const name = `${key}${ext}`
        for (const out of outDirs){
          const dest = path.join(out, name)
          await download(placeholderUrl, dest)
        }
        console.log('Saved placeholder for', key)
      }catch(err){
        console.error('Failed to save placeholder for', key, err.message)
      }
    }
  }
  console.log('Logo fetch complete')
})()
