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
		this.addPost('add');
		
		this.addGet('poll');
		this.app.get('/', this.poll.bind(this));
		
		this.data = new Data();
	}
	
	addGet(url: string) {
		this.app.get('/' + url, this[url].bind(this));
	}
	
	addPost(url: string) {
		this.app.post('/' + url, this[url].bind(this));
	}
	
	poll(req: Request, res: Response) {
		this.data.poll((error: Error, result) => {
			if (error) {
				res.json({
					success: false,
					error: error
				});
			} else {
				res.json({
					success: true,
					data: result
				});
			}
		});
	}
	
	add(req: Request, res: Response) {
		this.data.add(req.body.phone, req.body.data, (error?: Error) => {
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