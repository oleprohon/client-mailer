class i360 {
	
	default() {
		let content = ``;
		return ["Nouvelle demande (défaut)", content];
	}

	homepage() {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page d’accueil", content];
	}
	
	contact() {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page contact", content];
	}
	
	video360() {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page production vidéo 360", content];
	}
	
	virtualReality() {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page réalité virtuel", content];
	}
}

module.exports = i360;