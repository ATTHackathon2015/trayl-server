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
		
		this.addPost('travel');
		
		this.data = new Data();
	}
	
	addPost(url: string) {
		this.app.post('/' + url, this[url].bind(this));
	}
	
	travel(req: Request, res: Response) {
		this.data.travel(req.body.phone, req.body.data, (error?: Error) => {
			if (error) {
				res.json({
					success: false,
					error: error
				});
			} else {
				res.json({
					success: true
				});
			}
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