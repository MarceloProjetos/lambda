/* global angular,hljs */
(function () {
    var springCloudAws = angular.module('SpringCloudAws', ['ngRoute']);

    // Global stuff
    springCloudAws.directive('active', function ($location) {
        return {
            link: function (scope, element) {
                function makeActiveIfMatchesCurrentPath() {
                    if ($location.path().indexOf(element.find('a').attr('href').substr(1)) > -1) {
                        element.addClass('active');
                    } else {
                        element.removeClass('active');
                    }
                }

                scope.$on('$routeChangeSuccess', function () {
                    makeActiveIfMatchesCurrentPath();
                });
            }
        };
    });

    springCloudAws.service('SourceCodeService', function ($http) {
        this.getSourceCode = function (path) {
            return $http.get('source?path=' + path);
        };
    });

    springCloudAws.directive('sourceCode', function (SourceCodeService, $timeout) {
        return {
            restrict: 'E',
            templateUrl: 'templates/source-box.tpl.html',
            scope: {
                path: '@'
            },
            link: function (scope, element) {
                SourceCodeService.getSourceCode(scope.path).then(function (response) {
                    scope.code = response.data.content;
                    scope.link = response.data.url;
                    scope.title = response.data.name;
                    $timeout(function () {
                        hljs.highlightBlock(element.find('code')[0]);
                    });
                });
            }
        }
    });

    // SQS
    springCloudAws.service('SqsService', function ($http) {
        this.sendMessage = function (message) {
            return $http.post('sqs/message-processing-queue', message);
        };
    });

    springCloudAws.controller('SqsCtrl', function (SqsService, $scope) {
        var self = this;
        self.model = {};
        self.responses = [];

        function initMessageToProcess() {
            self.model.messageToProcess = {
                message: undefined,
                priority: 2
            };
        }

        self.sendMessage = function () {
            SqsService.sendMessage(self.model.messageToProcess);
            initMessageToProcess();
        };

        function initView() {
            initMessageToProcess();

            var sock = new SockJS('/sqs-messages');
            sock.onmessage = function (e) {
                var jsonResponse = JSON.parse(e.data);
                self.responses.reverse().push(jsonResponse);

                if (self.responses.length > 10) {
                    self.responses = self.responses.slice(self.responses.length - 10);
                }

                self.responses = self.responses.reverse();
                $scope.$apply();
            };
        }

        initView();
    });

    springCloudAws.filter('priority', function () {
        return function (input) {
            switch (input) {
                case 1:
                    return 'Low';
                case 2:
                    return 'Medium';
                case 3:
                    return 'High';
            }
        }
    });

    // SNS
    springCloudAws.service('SnsService', function ($http) {
        this.send = function (message) {
            return $http.post('sns/send', message);
        };
    });

    springCloudAws.controller('SnsCtrl', function (SnsService, $scope) {
        var self = this;
        self.responses = [];

        function initModel() {
            self.model = {
                message: undefined,
                subject: undefined
            };
        }

        self.send = function () {
            SnsService.send(self.model);
            initModel();
        };

        function initView() {
            initModel();

            var sock = new SockJS('/sns-messages');
            sock.onmessage = function (e) {
                var jsonResponse = JSON.parse(e.data);
                self.responses.reverse().push(jsonResponse);

                if (self.responses.length > 10) {
                    self.responses = self.responses.slice(self.responses.length - 10);
                }

                self.responses = self.responses.reverse();
                $scope.$apply();
            };
        }

        initView();
    });

    // RDS
    springCloudAws.service('PersonService', function ($http) {
        this.add = function (person) {
            return $http.post('persons', person);
        };

        this.getAll = function () {
            return $http.get('persons');
        }
    });

    springCloudAws.controller('RdsCtrl', function (PersonService) {
        var self = this;
        self.persons = [];

        function refresh() {
            PersonService.getAll().then(function (response) {
                self.persons = response.data;
            });
        }

        refresh();

        function initView() {
            self.model = {
                firstName: undefined,
                lastName: undefined
            };
        }

        initView();

        self.add = function () {
            PersonService.add(self.model).then(function () {
                refresh();
            });
            initView();
        };
    });

    // ElastiCache
    springCloudAws.service('ElastiCacheService', function ($http) {
        this.getValue = function (key) {
            return $http.get('cachedService?key=' + key, {headers: {Accept: 'text/plain'}});
        };
    });

    springCloudAws.controller('ElastiCacheCtrl', function ($scope, ElastiCacheService) {
        var self = this;
        self.loading = false;

        self.getValue = function () {
            self.value = '';
            self.loading = true;
            ElastiCacheService.getValue(self.key).then(function (response) {
                self.loading = false;
                self.value = response.data;
            });
        };
    });

    // EC2
    springCloudAws.service('Ec2Service', function ($http) {
        this.getProperties = function () {
            return $http.get('info');
        };
    });

    springCloudAws.controller('Ec2Ctrl', function (Ec2Service) {
        var self = this;

        Ec2Service.getProperties().then(function (response) {
            self.properties = response.data;
        });
    });

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

        var apigClient = apigClientFactory.newClient({
            accessKey: 'AKIAJIL7P6ZIPZCMC22Q',
            secretKey: '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',
            //sessionToken: 'SESSION_TOKEN', //OPTIONAL: If you are using temporary credentials you must include the session token
            region: 'us-east-1', // OPTIONAL: The region where the API is deployed, by default this parameter is set to us-east-1
            apiKey: 'XYmm69qaps37RKHBDtuDI2OeSu3maVEC5I3ItZtB'
        });

        apigClient.apiPost(params, list, additionalParams)
        .then(function(result){
            //This is where you would put a success callback
            console.log(JSON.stringify(result));
            self.list = result.data.Items;
            $scope.$apply();
        }).catch( function(result){
            //This is where you would put an error callback
        });
    });

    springCloudAws.config(function ($routeProvider) {
        $routeProvider.when('/home', {templateUrl: 'pages/home.tpl.html'});
        $routeProvider.when('/sqs', {templateUrl: 'template/nfe.html'});
        $routeProvider.when('/sns', {templateUrl: 'pages/sns.tpl.html'});
        $routeProvider.when('/elasticache', {templateUrl: 'pages/elasticache.tpl.html'});
        $routeProvider.when('/rds', {templateUrl: 'pages/rds.tpl.html'});
        $routeProvider.when('/ec2', {templateUrl: 'pages/ec2.tpl.html'});
        $routeProvider.otherwise({redirectTo: '/sqs'});
    });
}());