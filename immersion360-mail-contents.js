class i360 {
	
	static loadContent(whichForm, body) {
		if (typeof this[whichForm] === "undefined") {
			return this.default(body);
		}
		return this[whichForm](body);
	}
	
	static default(body) {
		let content = ``;
		return ["Nouvelle demande (défaut)", content];
	}

	static homepage(body) {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page d’accueil", content];
	}
	
	static contact(body) {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page contact", content];
	}
	
	static video360(body) {
		let content = `
Nom: ${body.name} <br />
Courriel: ${body.email} <br />
Téléphone: ${body.phone} <br />
Industrie: ${body.industry} <br />
Message: <br />
${body.message}`;

		return ["Nouvelle demande de la page production vidéo 360", content];
	}
	
	static virtualReality(body) {
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
