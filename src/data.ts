import NeDBDataStore from 'nedb';
import * as async from 'async';

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
	
	constructor() {
		this.users = new NeDBDataStore({
			filename: 'db/users.db',
			autoload: true
		});
		this.items = new NeDBDataStore({
			filename: 'db/items.db',
			autoload: true
		});
	}
	
	poll(done: AsyncResultCallback<Item[]>) {
		this.items.find<Item>({ resolved: false }, <any>{ _id: 0, resolved: 0, owner: 0 }, done);
	}
	
	add(phone: string, item: Item, done: ErrorCallback) {
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