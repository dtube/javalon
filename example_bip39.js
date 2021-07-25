var javalon = require('./index.js')

let mnemonic = javalon.generateMnemonic()
let keypair = javalon.mnemonicToKeyPair(mnemonic)

console.log(mnemonic, keypair)

console.log(javalon.privToPub(keypair.priv) === keypair.pub)