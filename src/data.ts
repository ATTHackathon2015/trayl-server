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
	
	add(phone: string, item: Item, done: ErrorCallback) {
		
	}
	
	travel(phone: string, data: TravelData, done: ErrorCallback) {
		this.users.update({phone: phone}, { $set: phone, $push: { travel: data }}, { upsert: true }, done);
	}
	
	connect(done: ErrorCallback) {
		done();
		// async.parallel([this.users.loadDatabase, this.items.loadDatabase], done);
	}
}