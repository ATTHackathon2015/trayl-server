import * as express from 'express';
import {Express, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import Data from './data';

export default class Server {
	
	app: Express;
	
	data: Data;
	
	constructor(public port: number) {
		this.app = (<any>express).default();
		
		this.app.use(bodyParser.json());
		
		this.app.post('/add', this.add.bind(this));
		
		this.data = new Data('data.db');
	}
	
	add(req: Request, res: Response) {
		res.json({
			success: true,
			data: req.body
		});
	}
	
	listen() {
		this.data.connect((error: Error) => {
			if (error) {
				console.error(error);
				return;
			}
			this.app.listen(this.port, () => {
				console.log('[Server] Listening on port ' + this.port);
			});
		});
	}
}