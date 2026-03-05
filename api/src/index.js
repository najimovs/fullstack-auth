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

await fastify.register(cors, {
	origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
	credentials: true
})

await fastify.register( cookie )

fastify.get( "/", async function handler ( request, reply ) {

	return {
		hello: "world"
	}
} )

fastify.get( "/auth/google", async ( request, reply ) => {

	const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${ GOOGLE_CLIENT_ID }&redirect_uri=${ REDIRECT_URI }&scope=openid email profile&response_type=code`

	reply.redirect( googleAuthUrl )
} )

fastify.get( "/auth/callback", async ( request, reply ) => {

	const { code } = request.query

	const tokenResponse = await fetch( "https://oauth2.googleapis.com/token", {
		method: "POST",
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: new URLSearchParams( {
			client_id: GOOGLE_CLIENT_ID,
			client_secret: GOOGLE_CLIENT_SECRET,
			code,
			grant_type: "authorization_code",
			redirect_uri: REDIRECT_URI,
		} )
	} )

	const tokenData = await tokenResponse.json()

	if ( !tokenResponse.ok ) {

		return reply.code( 400 ).send( { error: "Token exchange failed" } )
	}

	const userResponse = await fetch( "https://www.googleapis.com/oauth2/v2/userinfo", {
		headers: {
			Authorization: `Bearer ${ tokenData.access_token }`,
		}
	} )

	const userInfo = await userResponse.json()

	if ( !userResponse.ok ) {

		return reply.code( 400 ).send( { error: "Failed to get user info" } )
	}

	const userId = userInfo.id

	usersDb[ userId ] = {
		id: userId,
		name: userInfo.name,
		email: userInfo.email,
		picture: userInfo.picture,
	}

	const sessionId = Math.random().toString( 36 ).substring( 2 )

	sessions[ sessionId ] = userId

	reply.setCookie( "session_id", sessionId, {
		httpOnly: true,
		sameSite: "lax",
		path: "/"
	} )

	reply.redirect( "http://localhost:5173" )
} )

fastify.get( "/me", async ( request, reply ) => {

	const sessionId = request.cookies.session_id

	if ( !sessionId || !sessions[ sessionId ] ) {

		return reply.code( 401 ).send( { error: "Not authenticated" } )
	}

	const userId = sessions[sessionId]
	const user = usersDb[userId]

	if ( !user)  {

		return reply.code( 404 ).send( { error: "User not found" } )
	}

	return user
} )

fastify.post( "/logout", async ( request, reply ) => {

	const sessionId = request.cookies.session_id

	if ( sessionId && sessions[ sessionId ] ) {

		delete sessions[ sessionId ]
	}

	reply.clearCookie( "session_id" )

	return {
		message: "Logged out",
	}
} )

try {

	await fastify.listen( { port: PORT } )
}
catch ( err ) {

	fastify.log.error( err )

	process.exit( 1 )
}
