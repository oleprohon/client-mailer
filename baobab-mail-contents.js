class baobab {
	
	default() {
		let content = ``;
		return ["Nouvelle demande (défaut)", content];
	}

	homepage() {
		let content = `From: ${body.email} <br /><br />
	Message: <br />
	${body.message}`;

		return [body.subject, content];
	}
}

module.exports = baobab;