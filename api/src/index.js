import Fastify from "fastify"
import cors from "@fastify/cors"
import cookie from "@fastify/cookie"

const PORT = parseInt( process.env.PORT || 3_000 )
const GOOGLE_CLIENT_ID = process.env.GOOGLE_AUTH_CLIENT_ID
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_AUTH_CLIENT_SECRET
const REDIRECT_URI = `http://localhost:${ PORT }/auth/callback`

const usersDb = {}
const sessions = {}

const fastify = Fastify( {
	logger: true,
} )

await fastify.register( cors, {
	origin: [
		"http://localhost:5173",
		"http://127.0.0.1:5173",
	],
	credentials: true,
} )

await fastify.register( cookie )

fastify.get( "/", async function handler ( request, reply ) {

	return {
		hello: "world"
	}
} )

try {

	await fastify.listen( { port: PORT } )
}
catch ( err ) {

	fastify.log.error( err )

	process.exit( 1 )
}
