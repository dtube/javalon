var javalon = require('./index.js')

var message = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum."

var keys = [
    javalon.keypair(), // recipient
    javalon.keypair() // sender
]

javalon.encrypt(keys[0].pub, message, keys[1].priv, function(err, encrypted) {
    if (err) throw err
    console.log(encrypted)
    javalon.decrypt(keys[0].priv, encrypted, function(err, decrypted) {
        if (err) throw err
        console.log(decrypted)
    })
})