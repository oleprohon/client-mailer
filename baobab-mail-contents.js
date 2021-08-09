class baobab {
	
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
		let content = `From: ${body.email} <br /><br />
	Message: <br />
	${body.message}`;

		return [body.subject, content];
	}
}

module.exports = baobab;
