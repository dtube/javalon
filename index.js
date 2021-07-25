const CryptoJS = require('crypto-js')
const eccrypto = require('eccrypto')
const randomBytes = require('randombytes')
const secp256k1 = require('secp256k1')
const bs58 = require('bs58')
const GrowInt = require('growint')
const fetch = require('node-fetch')
const bip39 = require('bip39')
const bip32 = require('bip32')

let avalon = {
    config: {
        api: ['https://avalon.d.tube'],
        bwGrowth: 10000000,
        vtGrowth: 360000000
    },
    init: (config) => {
        avalon.config = Object.assign(avalon.config,config)
    },
    getBlockchainHeight: (cb) => {
        avalon.get('/count',cb)
    },
    getBlock: (number, cb) => {
        avalon.get('/block/'+number,cb)
    },
    getAccount: (name, cb) => {
        avalon.get('/account/'+name,cb)
    },
    getAccountHistory: (name, lastBlock, cb) => {
        avalon.get('/history/'+name+'/'+lastBlock,cb)
    },
    getVotesByAccount: (name, lastTs, cb) => {
        avalon.get('/votes/all/'+name+'/'+lastTs,cb)
    },
    getPendingVotesByAccount: (name, lastTs, cb) => {
        avalon.get('/votes/pending/'+name+'/'+lastTs,cb)
    },
    getClaimableVotesByAccount: (name, lastTs, cb) => {
        avalon.get('/votes/claimable/'+name+'/'+lastTs,cb)
    },
    getClaimedVotesByAccount: (name, lastTs, cb) => {
        avalon.get('/votes/claimed/'+name+'/'+lastTs,cb)
    },
    getAccounts: (names, cb) => {
        avalon.get('/accounts/'+names.join(','),cb)
    },
    getContent: (name, link, cb) => {
        avalon.get('/content/'+name+'/'+link,cb)
    },
    getFollowing: (name, cb) => {
        avalon.get('/follows/'+name,cb)
    },
    getFollowers: (name, cb) => {
        avalon.get('/followers/'+name,cb)
    },
    getPendingRewards: (name, cb) => {
        avalon.get('/rewards/pending/'+name,cb)
    },
    getClaimedRewards: (name, cb) => {
        avalon.get('/rewards/claimed/'+name,cb)
    },
    getClaimableRewards: (name, cb) => {
        avalon.get('/rewards/claimable/'+name,cb)
    },
    generateCommentTree: (root, author, link) => {
        var replies = []
        var content = null
        if (author === root.author && link === root.link)
            content = root
        else
            content = root.comments[author+'/'+link]

        if (!content || !content.child || !root.comments) return []
        for (var i = 0; i < content.child.length; i++) {
            var comment = root.comments[content.child[i][0]+'/'+content.child[i][1]]
            comment.replies = avalon.generateCommentTree(root, comment.author, comment.link)
            comment.ups = 0
            comment.downs = 0
            if (comment.votes)
                for (let i = 0; i < comment.votes.length; i++) {
                    if (comment.votes[i].vt > 0)
                        comment.ups += comment.votes[i].vt
                    if (comment.votes[i].vt < 0)
                        comment.downs -= comment.votes[i].vt
                }

            comment.totals = comment.ups - comment.downs
            replies.push(comment)
        }
        replies = replies.sort(function(a,b) {
            return b.totals-a.totals
        })
        return replies
    },
    getDiscussionsByAuthor: (username, author, link, cb) => {
        if (!author && !link)
            avalon.get('/blog/'+username,cb)
        else
            avalon.get('/blog/'+username+'/'+author+'/'+link,cb)
    },
    getNewDiscussions: (author, link, cb) => {
        if (!author && !link)
            avalon.get('/new',cb)
        else
            avalon.get('/new/'+author+'/'+link,cb)
    },
    getHotDiscussions: (author, link, cb) => {
        if (!author && !link)
            avalon.get('/hot',cb)
        else
            avalon.get('/hot/'+author+'/'+link,cb)
    },
    getTrendingDiscussions: (author, link, cb) => {
        if (!author && !link) 
            avalon.get('/trending',cb)
        else 
            avalon.get('/trending/'+author+'/'+link,cb)
    },
    getFeedDiscussions: (username, author, link, cb) => {
        if (!author && !link)
            avalon.get('/feed/'+username,cb)
        else
            avalon.get('/feed/'+username+'/'+author+'/'+link,cb)
    },
    getNotifications: (username, cb) => {
        avalon.get('/notifications/'+username,cb)
    },
    getSchedule: (cb) => {
        avalon.get('/schedule',cb)
    },
    getSupply: (cb) => {
        avalon.get('/supply',cb)
    },
    getLeaders: (cb) => {
        avalon.get('/allminers',cb)
    },
    getRewardPool: (cb) => {
        avalon.get('/rewardpool',cb)
    },
    getRewards: (name, cb) => {
        avalon.get('/distributed/'+name,cb)
    },
    get: (method,cb) => {
        fetch(avalon.randomNode()+method, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(error) {
            cb(error)
        })
    },
    keypair: () => {
        let priv, pub
        do {
            priv = Buffer.from(randomBytes(32).buffer)
            pub = secp256k1.publicKeyCreate(priv)
        } while (!secp256k1.privateKeyVerify(priv))

        return {
            pub: bs58.encode(pub),
            priv: bs58.encode(priv)
        }
    },
    generateMnemonic: () => {
        return bip39.generateMnemonic()
    },
    mnemonicToKeyPair: (mnemonic) => {
        const seed = bip39.mnemonicToSeedSync(mnemonic)
        const bip32key = bip32.fromSeed(seed)
        return {
            pub: bs58.encode(bip32key.publicKey),
            priv: bs58.encode(bip32key.privateKey)
        }
    },
    privToPub: (priv) => {
        return bs58.encode(
            secp256k1.publicKeyCreate(
                bs58.decode(priv)))
    },
    sign: (privKey, sender, tx) => {
        if (typeof tx !== 'object')
            try {
                tx = JSON.parse(tx)
            } catch(e) {
                console.log('invalid transaction')
                return
            }


        tx.sender = sender
        // add timestamp to seed the hash (avoid transactions reuse)
        tx.ts = new Date().getTime()
        // hash the transaction
        tx.hash = CryptoJS.SHA256(JSON.stringify(tx)).toString()
        // sign the transaction
        let signature = secp256k1.ecdsaSign(Buffer.from(tx.hash, 'hex'), bs58.decode(privKey))
        tx.signature = bs58.encode(signature.signature)
        return tx
    },
    signMultisig: (privKeys = [], sender, tx) => {
        if (typeof tx !== 'object')
            try {
                tx = JSON.parse(tx)
            } catch(e) {
                console.log('invalid transaction')
                return
            }

        if (!tx.sender)
            tx.sender = sender
        if (!tx.ts)
            tx.ts = new Date().getTime()
        if (!tx.hash)
            tx.hash = CryptoJS.SHA256(JSON.stringify(tx)).toString()
        if (!tx.signature || !Array.isArray(tx.signature))
            tx.signature = []
        
        for (let k in privKeys) {
            let sign = secp256k1.ecdsaSign(Buffer.from(tx.hash, 'hex'), bs58.decode(privKeys[k]))
            tx.signature.push([bs58.encode(sign.signature),sign.recid])
        }
        return tx
    },
    sendTransaction: (tx, cb) => {
        // sends a transaction to a node
        // waits for the transaction to be included in a block
        // 200 with head block number if confirmed
        // 408 if timeout
        // 500 with error if transaction is invalid
        fetch(avalon.randomNode()+'/transactWaitConfirm', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tx)
        }).then(function(res) {
            if (res.status === 500 || res.status === 408) 
                res.json().then(function(err) {
                    cb(err)
                })
            else if (res.status === 404)
                cb({error: 'Avalon API is down'})
            else 
                res.text().then(function(headBlock) {
                    cb(null, parseInt(headBlock))
                })
        })
    },
    sendRawTransaction: (tx, cb) => {
        // sends the transaction to a node
        // 200 with head block number if transaction is valid and node added it to mempool
        // 500 with error if transaction is invalid
        fetch(avalon.randomNode()+'/transact', {
            method: 'post',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(tx)
        }).then(function(res) {
            if (res.status === 500)
                res.json().then(function(err) {
                    cb(err)
                })
            else
                res.text().then(function(headBlock) {
                    cb(null, parseInt(headBlock))
                })
        })
    },
    sendTransactionDeprecated: (tx, cb) => {
        // old and bad way of checking if a transaction is confirmed in a block
        avalon.sendRawTransaction(tx, function(error, headBlock) {
            if (error) 
                cb(error)
            else 
                setTimeout(function() {
                    avalon.verifyTransaction(tx, headBlock, 5, function(error, block) {
                        if (error) console.log(error)
                        else cb(null, block)
                    })
                }, 1500)
        })
    },
    verifyTransaction: (tx, headBlock, retries, cb) => {
        var nextBlock = headBlock+1
        fetch(avalon.randomNode()+'/block/'+nextBlock, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.text()).then(function(text) {
            try {
                var block = JSON.parse(text)
            } catch (error) {
                // block is not yet available, retrying in 1.5 secs
                if (retries <= 0) return
                retries--
                setTimeout(function(){avalon.verifyTransaction(tx, headBlock, retries, cb)}, 1500)
                return
            }

            var isConfirmed = false
            for (let i = 0; i < block.txs.length; i++)
                if (block.txs[i].hash === tx.hash) {
                    isConfirmed = true
                    break
                }


            if (isConfirmed)
                cb(null, block)
            else if (retries > 0) {
                retries--
                setTimeout(function(){avalon.verifyTransaction(tx, nextBlock, retries, cb)},3000)
            } else
                cb('Failed to find transaction up to block #'+nextBlock)

        })
    },
    encrypt: (pub, message, ephemPriv, cb) => {
        // if no ephemPriv is passed, a new random key is generated
        if (!cb) {
            cb = ephemPriv
            ephemPriv = avalon.keypair().priv
        }
        try {
            if (ephemPriv)
                ephemPriv = bs58.decode(ephemPriv)
            var pubBuffer = bs58.decode(pub)
            eccrypto.encrypt(pubBuffer, Buffer.from(message), {
                ephemPrivateKey: ephemPriv
            }).then(function(encrypted) {
                // reducing the encrypted buffers into base 58
                encrypted.iv = bs58.encode(encrypted.iv)
                // compress the sender's public key to compressed format
                // shortens the encrypted string length
                encrypted.ephemPublicKey = secp256k1.publicKeyConvert(encrypted.ephemPublicKey, true)
                encrypted.ephemPublicKey = bs58.encode(encrypted.ephemPublicKey)
                encrypted.ciphertext = bs58.encode(encrypted.ciphertext)
                encrypted.mac = bs58.encode(encrypted.mac)
                encrypted = [
                    encrypted.iv,
                    encrypted.ephemPublicKey,
                    encrypted.ciphertext,
                    encrypted.mac
                ]
                
                // adding the _ separator character
                encrypted = encrypted.join('_')
                cb(null, encrypted)
            }).catch(function(error) {
                cb(error)
            })
        } catch (error) {
            cb(error)
        }
    },
    decrypt: (priv, encrypted, cb) => {
        try {
            // converting the encrypted string to an array of base58 encoded strings
            encrypted = encrypted.split('_')
            
            // then to an object with the correct property names
            var encObj = {}
            encObj.iv = bs58.decode(encrypted[0])
            encObj.ephemPublicKey = bs58.decode(encrypted[1])
            encObj.ephemPublicKey = secp256k1.publicKeyConvert(encObj.ephemPublicKey, false)
            encObj.ciphertext = bs58.decode(encrypted[2])
            encObj.mac = bs58.decode(encrypted[3])

            // and we decode it with our private key
            var privBuffer = bs58.decode(priv)
            eccrypto.decrypt(privBuffer, encObj).then(function(decrypted) {
                cb(null, decrypted.toString())
            }).catch(function(error) {
                cb(error)
            })
        } catch (error) {
            cb(error)
        }
    },
    randomNode: () => {
        var nodes = avalon.config.api
        if (typeof nodes === 'string') return nodes
        else return nodes[Math.floor(Math.random()*nodes.length)]
    },
    votingPower: (account) => {
        return new GrowInt(account.vt, {
            growth:account.balance/(avalon.config.vtGrowth),
            max: account.maxVt
        }).grow(new Date().getTime()).v
    },
    bandwidth: (account) => {
        return new GrowInt(account.bw, {growth:account.balance/(avalon.config.bwGrowth), max:256000})
            .grow(new Date().getTime()).v
    },
    TransactionType: {
        NEW_ACCOUNT: 0,
        APPROVE_NODE_OWNER: 1,
        DISAPROVE_NODE_OWNER: 2,
        TRANSFER: 3,
        COMMENT: 4,
        VOTE: 5,
        USER_JSON: 6,
        FOLLOW: 7,
        UNFOLLOW: 8,
        // RESHARE: 9, // not sure
        NEW_KEY: 10,
        REMOVE_KEY: 11,
        CHANGE_PASSWORD: 12,
        PROMOTED_COMMENT: 13,
        TRANSFER_VT: 14,
        TRANSFER_BW: 15,
        LIMIT_VT: 16,
        CLAIM_REWARD: 17,
        ENABLE_NODE: 18,
        TIPPED_VOTE: 19,
        NEW_WEIGHTED_KEY: 20,
        SET_SIG_THRESHOLD: 21,
        SET_PASSWORD_WEIGHT: 22
    }
}

if (typeof window != 'undefined') window.javalon = avalon
module.exports = avalon
