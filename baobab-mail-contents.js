class baobab {
	
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
		let content = `From: ${body.email} <br /><br />
	Message: <br />
	${body.message}`;

		return [body.subject, content];
	}
}

module.exports = baobab;