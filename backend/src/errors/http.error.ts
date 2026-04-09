export class HttpError extends Error {
	status: number;
	constructor(status: number, messagem: string) {
		super(messagem);
		this.status = status;
		Object.setPrototypeOf(this, HttpError.prototype);
	}
}

export const naoEncontrado = (msg = 'Não encontrado') => new HttpError(404, msg);
