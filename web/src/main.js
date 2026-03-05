import "./main.css"

const API_URL = "http://localhost:3000"

document.getElementById( "login-btn" ).addEventListener( "click", () => {

	window.location.href = `${ API_URL }/auth/google`
} )

document.getElementById( "logout-btn" ).addEventListener( "click", async () => {

	await fetch( `${ API_URL }/logout`, {
		method: "POST",
		credentials: "include",
	} )

	showLogin()
} )

checkAuth()

//

function showLogin() {

	document.getElementById( "login-section" ).style.display = "block"
	document.getElementById( "user-section" ).style.display = "none"
}

function showUser( user ) {

	document.getElementById( "login-section" ).style.display = "none"
	document.getElementById( "user-section" ).style.display = "block"
	document.getElementById( "user-name" ).textContent = user.name
	document.getElementById( "user-avatar" ).src = user.picture
}

async function checkAuth() {

	try {

		const response = await fetch( `${ API_URL }/me`, {
			credentials: "include",
		} )

		if ( response.ok ) {

			const user = await response.json()
			showUser(user)
		}
		else {

			showLogin()
		}
	} catch ( error ) {

		showLogin()
	}
}
