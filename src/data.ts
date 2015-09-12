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
		this.users = new NeDBDataStore('users.db');
		this.items = new NeDBDataStore('items.db');
	}
	
	travel(phone: string, data: TravelData, done: ErrorCallback) {
		let query = {phone: phone};
		this.users.findOne<User>(query, (err: Error, document: User) => {
			if (err) {
				done(err);
				return;
			}
			
			if (document) {
				this.users.update(query, { $push: { travel: data }}, {}, done);
			} else {
				this.users.insert<User>({
					phone: phone,
					items: [],
					travel: [data]
				}, done);
			}
		});
	}
	
	connect(done: ErrorCallback) {
		async.parallel([this.users.loadDatabase, this.items.loadDatabase], done);
	}
}