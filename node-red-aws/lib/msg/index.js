"use strict";


module.exports = {
	parse: function(event) {
		var parseItem = function(item) {
			if (item.Records && item.Records instanceof Array) {
				return item.Records.map(parseItem);
			} else if (item.Records) {
				return parseItem(item.Records);
			} else if (item.Sns && item.Sns.Message) {
				return JSON.parse(item.Sns.Message)
			} else if (item.Message) {
				return JSON.parse(event.Message);
			} else {
				return item;
			}
		}
		if (event instanceof Array) {
			return event.map(parseItem);
		} else {
			return parseItem(event);
		}
		
	}
}