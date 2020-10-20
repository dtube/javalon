var CryptoJS = require('crypto-js')
var eccrypto = require('eccrypto')
var randomBytes = require('randombytes')
var secp256k1 = require('secp256k1')
var bs58 = require('bs58')
var GrowInt = require('growint')
var fetch = require('node-fetch')
var bwGrowth = 10000000
var vtGrowth = 360000000

function status(response) {   
    if (response.ok)
        return response
    return response.json().then(res => Promise.reject(res))
}

var avalon = {
    config: {
        api: ['https://avalon.d.tube:443'],
        //api: ['http://127.0.0.1:3002']
    },
    init: (config) => {
        avalon.config = config
    },
    getBlock: (number, cb) => {
        fetch(avalon.randomNode()+'/block/'+number, {
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
    getAccount: (name, cb) => {
        fetch(avalon.randomNode()+'/account/'+name, {
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
    getAccountHistory: (name, lastBlock, cb) => {
        fetch(avalon.randomNode()+'/history/'+name+'/'+lastBlock, {
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
    getVotesByAccount: (name, lastTs, cb) => {
        fetch(avalon.randomNode()+'/votes/all/'+name+'/'+lastTs, {
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
    getPendingVotesByAccount: (name, lastTs, cb) => {
        fetch(avalon.randomNode()+'/votes/pending/'+name+'/'+lastTs, {
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
    getClaimableVotesByAccount: (name, lastTs, cb) => {
        fetch(avalon.randomNode()+'/votes/claimable/'+name+'/'+lastTs, {
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
    getClaimedVotesByAccount: (name, lastTs, cb) => {
        fetch(avalon.randomNode()+'/votes/claimed/'+name+'/'+lastTs, {
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
    getAccounts: (names, cb) => {
        fetch(avalon.randomNode()+'/accounts/'+names.join(','), {
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
    getContent: (name, link, cb) => {
        fetch(avalon.randomNode()+'/content/'+name+'/'+link, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(status).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getFollowing: (name, cb) => {
        fetch(avalon.randomNode()+'/follows/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getFollowers: (name, cb) => {
        fetch(avalon.randomNode()+'/followers/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getRewardsPending: (name, cb) => {
        fetch(avalon.randomNode()+'/rewards/pending/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getRewardsClaimed: (name, cb) => {
        fetch(avalon.randomNode()+'/rewards/claimed/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
    },
    getRewardsClaimable: (name, cb) => {
        fetch(avalon.randomNode()+'/rewards/claimable/'+name, {
            method: 'get',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Content-Type': 'application/json'
            }
        }).then(res => res.json()).then(function(res) {
            cb(null, res)
        }).catch(function(err) {
            cb(err)
        })
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
            fetch(avalon.randomNode()+'/blog/'+username, {
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
        else 
            fetch(avalon.randomNode()+'/blog/'+username+'/'+author+'/'+link, {
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
    getNewDiscussions: (author, link, cb) => {
        if (!author && !link) 
            fetch(avalon.randomNode()+'/new', {
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
        else 
            fetch(avalon.randomNode()+'/new/'+author+'/'+link, {
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
    getHotDiscussions: (author, link, cb) => {
        if (!author && !link) 
            fetch(avalon.randomNode()+'/hot', {
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
        else 
            fetch(avalon.randomNode()+'/hot/'+author+'/'+link, {
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
    getTrendingDiscussions: (author, link, cb) => {
        if (!author && !link) 
            fetch(avalon.randomNode()+'/trending', {
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
        else 
            fetch(avalon.randomNode()+'/trending/'+author+'/'+link, {
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
    getFeedDiscussions: (username, author, link, cb) => {
        if (!author && !link) 
            fetch(avalon.randomNode()+'/feed/'+username, {
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
        else 
            fetch(avalon.randomNode()+'/feed/'+username+'/'+author+'/'+link, {
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
    getNotifications: (username, cb) => {
        fetch(avalon.randomNode()+'/notifications/'+username, {
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
    getSchedule: (cb) => {
        fetch(avalon.randomNode()+'/schedule', {
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
    getSupply: (cb) => {
        fetch(avalon.randomNode()+'/supply', {
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
    getLeaders: (cb) => {
        fetch(avalon.randomNode()+'/allminers', {
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
    getRewardPool: (cb) => {
        fetch(avalon.randomNode()+'/rewardpool', {
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
    getRewards: (name, cb) => {
        fetch(avalon.randomNode()+'/distributed/'+name, {
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
        var signature = secp256k1.sign(Buffer.from(tx.hash, 'hex'), bs58.decode(privKey))
        tx.signature = bs58.encode(signature.signature)
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
            growth:account.balance/(vtGrowth),
            max: account.maxVt
        }).grow(new Date().getTime()).v
    },
    bandwidth: (account) => {
        return new GrowInt(account.bw, {growth:account.balance/(bwGrowth), max:256000})
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
        ENABLE_NODE: 18
    }
}

if (typeof window != 'undefined') window.javalon = avalon
module.exports = avalon