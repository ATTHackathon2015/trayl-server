import * as express from 'express';
import {Express, Request, Response} from 'express';
import * as bodyParser from 'body-parser';
import Data from './data';

export default class Server {
	
	app: Express;
	
	data: Data;
	
	errorRespond: (error?: Error) => void;
	resultRespond: (error: Error, result) => void;
	
	constructor(public port: number) {
		this.errorRespond = function (error?: Error)  { // this is res: Response
			let res = <Response>this;
			if (error) {
				res.json({
					success: false,
					error: error.toString()
				});
			} else {
				res.json({
					success: true
				});
			}
		};
		this.resultRespond = function (error: Error, result) { // this is res: Response
			let res = <Response>this;
			
			if (error) {
				res.json({
					success: false,
					error: error.toString()
				});
			} else {
				res.json({
					success: true,
					data: result
				});
			}
		};
		
		this.app = (<any>express).default();
		
		this.app.use(bodyParser.json());
		
		this.app.all('/', function(req, res, next) {
			res.header("Access-Control-Allow-Origin", "*");
			res.header("Access-Control-Allow-Headers", "X-Requested-With");
			next();
		});
		
		this.addPost('travel');
		this.addPost('add');
		
		this.addGet('poll');
		this.app.get('/', this.poll.bind(this));
		
		this.addPost('travels');
		this.addPost('items');
		this.addPost('resolve');
		
		this.data = new Data();
	}
	
	addGet(url: string) {
		this.app.get('/' + url, this[url].bind(this));
	}
	
	addPost(url: string) {
		this.app.post('/' + url, this[url].bind(this));
	}
	
	resolve(req: Request, res: Response) {
		this.data.resolve(req.body.phone, req.body.data, this.errorRespond.bind(res));
	}
	
	travels(req: Request, res: Response) {
		this.data.getTravels(req.body.phone, this.resultRespond.bind(res));
	}
	
	items(req: Request, res: Response) {
		this.data.getItems(req.body.phone, this.resultRespond.bind(res));
	}
	
	poll(req: Request, res: Response) {
		this.data.poll(this.resultRespond.bind(res));
	}
	
	add(req: Request, res: Response) {
		this.data.add(req.body.phone, req.body.data, this.errorRespond.bind(res));
	}
	
	travel(req: Request, res: Response) {
		this.data.travel(req.body.phone, req.body.data, this.errorRespond.bind(res));
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