import NeDBDataStore from 'nedb';
import * as async from 'async';
import schema, {Validator} from 'js-schema';

interface Location {
	lat: number;
	long: number;
}

interface TravelData {
	location: Location;
	time: number;
}

interface Item {
	_id?: string;
	resolved: boolean;
	owner?: string;
	title: string;
	description: string;
	contact: string;
	lost: boolean;
	location: Location;
}

interface User {
	_id?: string;
	phone: string;
	items: string[];
	travel: TravelData[];
}

export default class Data {
	
	users: NeDBDataStore;
	items: NeDBDataStore;
	
	schemas: {
		item: Validator;
		travel: Validator;
	};
	
	constructor() {
		this.users = new NeDBDataStore({
			filename: 'db/users.db',
			autoload: true
		});
		this.items = new NeDBDataStore({
			filename: 'db/items.db',
			autoload: true
		});
		
		this.schemas = {
			item: schema({
				title: String,
				description: String,
				contact: String,
				lost: Boolean,
				location: [{
					lat: Number,
					long: Number
				}]
			}),
			travel: schema({
				time: Number,
				location: [{
					lat: Number,
					long: Number
				}]
			})
		};
	}
	
	poll(done: AsyncResultCallback<Item[]>) {
		this.items.find<Item>({ resolved: false }, <any>{ resolved: 0, owner: 0 }, done);
	}
	
	add(phone: string, item: Item, done: ErrorCallback) {
		if (typeof phone != 'string') {
			done(new Error('phone (' + phone + ') is not a string'));
			return;
		}
		
		let validate = this.schemas.item.errors(item);
		if (validate) {
			done(new Error(JSON.stringify(validate)));
			return;
		}
		
		item.owner = phone;
		item.resolved = false;
		this.items.insert<Item>(item, (err: Error, document: Item) => {
			if (err) {
				done(err);
				return;
			}
			this.users.update({ phone: phone }, {
				$set: { phone: phone },
				$push: { items: document._id }
			}, { upsert: true }, done);
		});
	}
	
	travel(phone: string, data: TravelData, done: ErrorCallback) {
		if (typeof phone != 'string') {
			done(new Error('phone (' + phone + ') is not a string'));
			return;
		}
		
		let validate = this.schemas.travel.errors(data);
		if (validate) {
			done(new Error(JSON.stringify(validate)));
			return;
		}
		
		this.users.update({ phone: phone }, {
			$set: { phone: phone },
			$push: { travel: data }
		}, { upsert: true }, done);
	}
	
	connect(done: ErrorCallback) {
		done();
		// async.parallel([this.users.loadDatabase, this.items.loadDatabase], done);
	}
}