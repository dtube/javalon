# Javalon

## Install
#### Require style
Install with `npm install --save javalon` inside your project. Then just
```
const javalon = require('javalon')
```
#### CDN style
If you are working in the browser and want to load javalon from a CDN:
```
<script src="https://unpkg.com/javalon/bin/javalon.min.js"></script>
```

By default, javalon hits on the main avalon testnet (https://avalon.d.tube). You can eventually make javalon hit on your local node or any avalon node like so:

```
javalon.init({api: 'http://localhost:3001'})
```

## GET API

### GET single account
```
javalon.getAccount('alice', (err, account) => {
    console.log(err, account)
})
```

### GET many accounts
Just pass an array of usernames instead
```
javalon.getAccounts(['alice', 'bob'], (err, accounts) => {
    console.log(err, accounts)
})
```

### GET account transaction history
For the history, you also need to specify a block number. The api will return all blocks lower than the specified block where the user was involved in a transaction
```
javalon.getAccountHistory('alice', 0, (err, blocks) => {
    console.log(err, blocks)
})
```
### GET single content
```
javalon.getContent('alice', 'pocNl2YhZdM', (err, content) => {
    console.log(err, content)
})
```

### GET followers
```
javalon.getFollowers('alice', (err, followers) => {
    console.log(err, followers)
})
```

### GET following
```
javalon.getFollowers('alice', (err, followers) => {
    console.log(err, followers)
})
```

### GET contents by author
You can pass a username and permlink (identifying a content) in the 2nd and 3rd argument to 'get more'.
```
javalon.getDiscussionsByAuthor('alice', null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET contents by creation time
You can pass a username and a permlink to 'get more'.
```
javalon.getNewDiscussions('alice', null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET contents by popularity (hot)
You can pass a username and a permlink to 'get more'.
```
javalon.getHotDiscussions(null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET contents by feed
This lists the contents posted by the following of the passed username.

You can pass a username and a permlink in the 2nd and 3rd argument to 'get more'.
```
javalon.getFeedDiscussions('alice', null, null, (err, contents) => {
    console.log(err, contents)
})
```

### GET notifications
```
javalon.getNotifications('alice', (err, contents) => {
    console.log(err, contents)
})
```

### GET all votes by account
```
javalon.getVotesByAccount('alice', 0, (err, votes) => {
    console.log(err, votes)
})
```

### GET pending votes by account
```
javalon.getPendingVotesByAccount('alice', 0, (err, votes) => {
    console.log(err, votes)
})
```

### GET claimable votes by account
```
javalon.getClaimableVotesByAccount('alice', 0, (err, votes) => {
    console.log(err, votes)
})
```

### GET claimed votes by account
```
javalon.getClaimedVotesByAccount('alice', 0, (err, votes) => {
    console.log(err, votes)
})
```

### GET pending rewards by account
```
javalon.getPendingRewards('alice', (err, votes) => {
    console.log(err, votes)
})
```

### GET claimed rewards by account
```
javalon.getClaimedRewards('alice', (err, votes) => {
    console.log(err, votes)
})
```

### GET claimable rewards by account
```
javalon.getClaimableRewards('alice', (err, votes) => {
    console.log(err, votes)
})
```

## POST API

To send a transaction to the network, you will need multiple steps. First you need to define your transaction and sign it.

```
var newTx = {
    type: javalon.TransactionType.FOLLOW,
    data: {
        target: 'bob'
    }
}

newTx = javalon.sign(alice_key, 'alice', newTx)
```
After this step, the transaction is forged with a timestamp, hash, and signature. This transaction needs to be sent in the next 60 secs or will be forever invalid.

You can send it like so
```
javalon.sendTransaction(newTx, function(err, res) {
    cb(err, res)
})
```
The callback will return once your transaction has been included in a new block.

Alternatively, you can just want the callback as soon as the receiving node has it, you can do:
```
javalon.sendRawTransaction(newTx, function(err, res) {
    cb(err, res)
})
```

## Convenience

### Generate a keypair
```
console.log(javalon.keypair())
```

### Growing variables
Voting Power and Bandwidth are growing in time but the API will only return the latest update in the `vt` and `bw` fields of the accounts. To get the actual value, use votingPower() and bandwidth()
```
javalon.getAccount('alice', (err, account) => {
    console.log(javalon.votingPower(account))
    console.log(javalon.bandwidth(account)) 
})
```
