### Remind Of This Bot
This is a NOSTR bot used to remind people of notes or events on NOSTR

You'll be able to summon the bot by going to your favorite client and tagging the bot 
like `@RemindMeOfThis in 2 weeks` or `@RemindMeOfThis in two weeks` etc. I have some regular expressions that are used to parse the requests. 

## Uses Prisma client with MongoDB

Create model in `schema.prisma`
run `npx prisma db push` followed by `npx prisma generate` to update the prisma client locally.

## .ENV file

```
PUBLIC_KEY_NPUB='npub1rmndxyxnwd0n6dje3h75ywlngurdwe9nqy8vrqras32z4p7fpe9qm5s5ad'
PUBLIC_KEY='1ee6d310d3735f3d36598dfd423bf34706d764b3010ec1807d84542a87c90e4a'
PRIVATE_KEY='your private key here'
PORT = 4000
RELAYWS = wss://nostr-pub.wellorder.net/,wss://relay.damus.io/,wss://nostr.mutinywallet.com
ENV = 'development'
DATABASE_URL="mongodburl"

```
