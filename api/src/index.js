import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"

const PORT = parseInt( process.env.PORT || 3_000 )
const GOOGLE_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET
const REDIRECT_URI = `http://localhost:${ PORT }/auth/callback`

console.log( PORT )
console.log( GOOGLE_CLIENT_ID )
console.log( GOOGLE_CLIENT_SECRET )
console.log( REDIRECT_URI )
