import NeDBDataStore from 'nedb';
import * as async from 'async';
import schema, {Validator} from 'js-schema';

interface Location {
	lat: number;
	long: number;
}

interface TravelData {
	owner?: string;
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

interface ResolveData {
	id: string;
	resolved: boolean;
}

export default class Data {
	
	items: NeDBDataStore;
	travels: NeDBDataStore;
	
	schemas: {
		item: Validator;
		travel: Validator;
		resolve: Validator;
	};
	
	constructor() {
		this.travels = new NeDBDataStore({
			filename: 'db/travels.db',
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
			}),
			resolve: schema({
				id: String,
				resolved: Boolean
			})
		};
	}
	
	poll(done: AsyncResultCallback<Item[]>) {
		this.items.find<Item>({ resolved: false }, <any>{ resolved: 0, owner: 0 }, done);
	}
	
	validate(phone: string, done: ErrorCallback, data?, schema?: Validator) {
		if (typeof phone != 'string') {
			done(new Error('phone (' + phone + ') is not a string'));
			return true;
		}
		
		if (data) {
			let validate = schema.errors(data);
			if (validate) {
				done(new Error(JSON.stringify(validate)));
				return true;
			}
		}
		return false;
	}
	
	getItems(phone: string, done: AsyncResultCallback<Item[]>) {
		if (this.validate(phone, <ErrorCallback>done)) {
			return;
		}
		
		this.items.find<Item>({ owner: phone }, <any>{ owner: 0 }, done);
	}
	
	getTravels(phone: string, done: AsyncResultCallback<TravelData[]>) {
		if (this.validate(phone, <ErrorCallback>done)) {
			return;
		}
		
		this.travels.find<TravelData>({ owner: phone }, <any>{ _id: 0, owner: 0 }, done);
	}
	
	resolve(phone: string, data: ResolveData, done: ErrorCallback) {
		if (this.validate(phone, <ErrorCallback>done, data, this.schemas.resolve)) {
			return;
		}
		
		this.items.update({ _id: data.id, owner: phone }, {
			$set: {
				resolved: data.resolved
			}
		}, {}, done);
	}
	
	add(phone: string, item: Item, done: ErrorCallback) {
		if (this.validate(phone, <ErrorCallback>done, item, this.schemas.item)) {
			return;
		}
		
		item.owner = phone;
		item.resolved = false;
		this.items.insert<Item>(item, done);
	}
	
	travel(phone: string, data: TravelData, done: ErrorCallback) {
		if (this.validate(phone, <ErrorCallback>done, data, this.schemas.travel)) {
			return;
		}
		
		data.owner = phone;
		this.travels.insert<TravelData>(data, done);
	}
	
	connect(done: ErrorCallback) {
		done();
		// async.parallel([this.users.loadDatabase, this.items.loadDatabase], done);
	}
}