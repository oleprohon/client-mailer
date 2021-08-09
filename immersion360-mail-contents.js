class i360 {
	
	loadContent(whichForm, body) {
		if (typeof this[whichForm] === "undefined") {
			return this.default(body);
		}
		return this[whichForm](body);
	}
	
	default(body) {
		let content = ``;
		return ["Nouvelle demande (défaut)", content];
	}

	homepage(body) {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page d’accueil", content];
	}
	
	contact(body) {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page contact", content];
	}
	
	video360(body) {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page production vidéo 360", content];
	}
	
	virtualReality(body) {
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