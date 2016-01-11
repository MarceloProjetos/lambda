/* global angular,hljs */
(function () {
    var springCloudAws = angular.module('springCloudAws', ['ngRoute']);

    springCloudAws.controller('SqsCtrl', function ($scope) {
        var self = this;
        self.list = [];

		var params = {
		    //This is where any header, path, or querystring request params go. The key is the parameter named as defined in the API
		    //param0: '',
		    //param1: ''
		};

		var create = {
		    "operation": "create", 
		    "table": "nfe", 
		    "data": { "chave": "xpto" }
		};

		var read = {
		    "operation": "read", 
		    "table": "nfe", 
		    "key": { "chave": "xpto" }
		};

		var list = {
		    "operation": "list", 
		    "table": "nfe"
		};

		var additionalParams = {
		    //If there are any unmodeled query parameters or headers that need to be sent with the request you can add them here
		    /*headers: {
		        param0: '',
		        param1: ''
		    },
		    queryParams: {
		        param0: '',
		        param1: ''
		    }*/
		};

		/*var apigClient = apigClientFactory.newClient({
		    accessKey: 'AKIAJIL7P6ZIPZCMC22Q',
		    secretKey: '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',
		    //sessionToken: 'SESSION_TOKEN', //OPTIONAL: If you are using temporary credentials you must include the session token
		    region: 'eu-west-1', // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
		    //apiKey: 'XYmm69qaps37RKHBDtuDI2OeSu3maVEC5I3ItZtB'
		});*/

		/*apigClient.post(params, list, additionalParams)
	    .then(function(result){
	        //This is where you would put a success callback
	        console.log(JSON.stringify(result));
	    }).catch( function(result){
	        //This is where you would put an error callback
	    });*/
	});

    springCloudAws.config(function ($routeProvider) {
        $routeProvider.when('/nfe', {templateUrl: '/template/nfe.html'});
        $routeProvider.otherwise({redirectTo: '/nfe'});
    });	
});