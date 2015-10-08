// You can find more information on DynamoDB's API through: http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/Welcome.html


var self = {
	
        table_name: 'INGI2145_thanh',

	//---- Handles client requests and performs necessary operations---
	handle_request: function(db, parsed_request, res, list_of_attributes, caching_mode)
	{
		switch(parsed_request.pathname) {
			case '/query':
				query_key = Object.keys(parsed_request.query)
				if(query_key == 'id'){
				   NOMA = parsed_request.query.id;
				   self.queryByID(db, res, NOMA, list_of_attributes, caching_mode, caching_mode);}
				else if(query_key == 'name'){
				   name = parsed_request.query.name;
				   self.queryByName(db, res, name, list_of_attributes);}
				else {
                                      res.write('Unidentified GET param: '+query_key[0]+'\n');
                                      res.end();
                                }
				break;
			case '/list':
				self.scanTable(db, res);
				break;
			case '/unenroll':
				NOMA = parsed_request.query.id
				self.queryByID(db, res, NOMA, list_of_attributes, caching_mode, false, {callback:self.unenrollStudent, args:[caching_mode]});
				break;
			case '/set':
				attr = parsed_request.query.attr
				value = parsed_request.query.value
				self.scanTable(db, res, {callback:self.addAttribute, args:[attr, value, caching_mode]});
				break;
			default:
				res.write('Unidentified GET request path: '+parsed_request.pathname+'\n');
                                res.end();
		  }
	},

	//---- Query Table for a specific user by his/her ID---
	queryByID: function(db, resp, NOMA, attribute_list, cache_search, cache_update, success)
	{
          //perform lookup in cache first
		if(cache_search)
		{
			MemcacheClient.get(NOMA, function(err, result) {
                               	resp.write("--> Sending cache query for student with NOMA: "+NOMA+"\n");
				if (!err) {
					// Key found, display value
					resp.write("Cache hit,  key="+NOMA+", value="+result[NOMA]+"\n");
					if(success) self.callNextFunction(db, resp, success, [result[NOMA].NOMA.N, result[NOMA].Name.S]);
					else resp.end();
				}
				else {
					// Key not found, fetch value from DB
					resp.write("Cache miss, key "+NOMA+". Fetching from DB...\n");
					// recall the queryByID function, but this time don't check cache first (hence the passed 'false' attribute)
					self.queryByID(db, resp, NOMA, attribute_list, false, cache_update, success);
				}
			});
		}
          //don't perform cache lookup
          else
          {
			db.query({
			AttributesToGet: attribute_list,
			TableName : self.table_name,
			//IndexName : "ByNOMA",
			KeyConditions : 
			{"NOMA" : { "AttributeValueList" : [{"N" : NOMA}], "ComparisonOperator" : "EQ"}}},
			function(err, data) {
			  resp.write("--> Sending DB query for student with NOMA: "+NOMA+"\n"); // successful response
				if (err) {
					resp.write("An error occured: "+err.toString()+"\n"); // an error occurred
					resp.end();
				}
				else {
					if(data.Items.length == 0) {
						resp.write("Key not found. Skipping operation..\n");
						resp.end();
					}
					else {
					 resp.write("Received the following data:\n");
					 resp.write(JSON.stringify(data.Items[0])+"\n");
					 if(cache_update) self.addCacheEntry(resp, data.Items[0].NOMA.N, data.Items[0], !success);
					 if(success) self.callNextFunction(db, resp, success, [data.Items[0].NOMA.N, data.Items[0].Name.S]);
					 else resp.end();
					}
				}
			});
          }
	},
	
	//---- Query Table for a specific user by his/her name---
	queryByName: function(db, resp, student_name, attribute_list)
	{
		db.query({
				AttributesToGet: attribute_list,
				TableName : self.table_name,
				IndexName : "ByName",
				KeyConditions :
				{"Name" : { "AttributeValueList" : [{"S" : student_name}], "ComparisonOperator" : "EQ"}}
			},
			function(err, data) {
				if (err) {
					resp.write("An error occured:"+err.toString()+"\n");   // an error occurred
				}
				else
				{
					resp.write("--> Sending DB query for student with name: "+student_name+"\n");       // successful response
					if(data.Items.length == 0) resp.write("Key not found. Skipping operation..\n");
					else {
						resp.write("Received the following data:\n");
						resp.write(JSON.stringify(data.Items[0])+"\n");
					}
				}
				resp.end();
			}
		);
	},
	  
	//---- Retrieve all Table items (up-to a hardcoded limit of 100) ---
	//success is a callback that is passed in case we want to call another function with the retrieved data
	scanTable: function(db, resp, success)
	{
		//resp.write("Attempting to fetch all entries from table\n");
		db.scan({ "TableName": self.table_name,"Limit": 100},
		function(err, data) {
			//console.log(resp);
			if (err) resp.write("An error occured: "+err.toString()+"\n"); // an error occurred
			else
			{
				resp.write("Retreived "+data.Items.length.toString()+" items from the table\n");   // successful response
				resp.write("List of retrieved items: "+JSON.stringify(data.Items)+'\n');  // Uncomment to print all retrieved user data
			}
			if(success) self.callNextFunction(db, resp, success, [data]);
			else resp.end();
		});
	},

	//--- Update all Table items with a new attribute and corresponding value---
	addAttribute: function(db, resp, attr, value, cache_update, records_to_update)
	{
		finished_requests = 0;
		last_request = false;     
		resp.write("--> Adding defined field to table entries\n");
                var attr_value_dict = {};
                attr_value_dict[attr] = {"Value":{"S":value}, "Action": "PUT"};
		var arrayLength = records_to_update.Items.length;
		for (var i = 0; i < arrayLength; i++) {
			//resp.write(last_request);
			db.updateItem(
			{
				"TableName":self.table_name,
				"Key":{ "NOMA": {"N":records_to_update.Items[i].NOMA.N},
						"Name": {"S":records_to_update.Items[i].Name.S}},
				"AttributeUpdates": attr_value_dict,
				"ReturnValues" : "ALL_NEW"
			},
			function(err, data) {
				if (err) {
					resp.write("An error has occured:"+err.toString()+"\n"); // an error occurred
					if(last_request) resp.end();
				}
				else {
					finished_requests = finished_requests + 1;
					if(finished_requests == arrayLength) last_request = true;
					resp.write("Student with NOMA:"+data.Attributes.NOMA.N+" has been modified\n"); // successful response
					if(cache_update) self.updateCacheEntry(resp, data.Attributes.NOMA.N, data.Attributes, last_request);
					else if(last_request) resp.end();
					//if(cache_callback) cache_callback(data.Attributes.NOMA.N, data.Attributes); // invoke callback
				}
			});
		}	
	},

	//--- Delete student by his/her name---
        //[TO-REMOVE] This should be removed in tutorial version, replaced with dynamodb api for record deletions (link: http://docs.aws.amazon.com/amazondynamodb/latest/APIReference/Welcome.html)
	unenrollStudent: function(db, resp, cache_update, NOMA, Name)
	{
		resp.write("--> Attempting to delete student with NOMA: "+NOMA+"\n");
		db.deleteItem(
			{
				"TableName":self.table_name,
				"Key":{"NOMA"   : {"N":NOMA}, "Name" : {"S":Name}}
			},
			function(err, data) {
				if (err) {
					resp.write("Unable to delete student, err:"+err.toString()+"\n"); // an error occurred
					resp.end();
				}
				else {
					resp.write("Student successfully deleted\n");
					if(cache_update) self.deleteCacheEntry(resp, NOMA, true);
					else resp.end();
				}
			}
		);
	},
	
	//Checks cache, and updates it if there's a hit
	updateCacheEntry: function(resp, queryParam, value, end_response)
	{
		MemcacheClient.get(queryParam, function(err, result) {
			if (!err) {
				// Key found, update cache with new value
				resp.write("Found existing cache entry. Updating to:,  key="+queryParam+", value="+value+"\n");
				self.addCacheEntry(resp, queryParam, value, end_response);
			}
			else {
				// Key not found, do nothing
				resp.write("Couldn't find existing cache entry for key: "+queryParam+". Nothing to do here.\n");
				if(end_response) resp.end();
			}
		});
	},

	//Adds cache entry
	addCacheEntry: function(resp, queryParam, value, end_response)
	{
		value = JSON.stringify(value);
		MemcacheClient.set(queryParam, value, { flags: 0, exptime: 60}, function(err, status) {
			if (!err) {
				resp.write("Stored key="+queryParam+", value="+value+"\n");
			}
			else resp.write("Couldn't store key="+queryParam+", value="+value+", error="+err.toString()+"\n");
			if(end_response) resp.end();
		});
	},

	//Delete cache entry
        //[TO-REMOVE] This should be removed in tutorial version, replaced with mc api for cache deletions (url: http://overclocked.com/mc)
	deleteCacheEntry: function(resp, delKey, end_response)
	{
		MemcacheClient.del(delKey, function(err, status) {
			if (!err) {
				resp.write("Deleted item with key="+delKey+"\n");
			}
			else {
				resp.write("Couldn't delete item with key="+delKey+", error="+err.toString()+"\n");
			}
			if(end_response) resp.end();
		});
	},
	
	//--- Calls next function in the callback queue---
	callNextFunction: function(db, resp, next, extra_args)
	{
		if(next.callback) {
			next.args.unshift(db, resp);
			next.args = next.args.concat(extra_args);
			next.callback.apply(this, next.args); //invoke callback
		}
	}
};

module.exports = self; //Export module
