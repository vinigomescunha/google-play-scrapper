var config = {
  timeouts: {
    geralTimeout: 10000,
    singleTimeout: 5000
  },
  errorStatus: {
    'infos': {
      title: 'Ocorreu um erro',
      content: 'Verifique os dados, ou se tem proxy configurado ou se esta conectado a internet'
    },
    'comments': {
      title: 'Ocorreu um erro',
      content: 'Deu erro ao carregar os comentarios'
    },
    'loading': {
      title: 'Carregando....',
      content: 'Espere ate terminar de buscar os dados'
    },
    'config': {
      title: 'Ocorreu um erro',
      content: 'Erro ao carregar configuracao do servidor'
    }
  }
};
var app = angular.module('meuScrapperGooglePlay', []);
app.config(['$httpProvider', function ($httpProvider) {
  $httpProvider.defaults.timeout = config.geralTimeout; // timeout do provider http geral
}]);
app.filter("noResenhaCompleta",
  function () {
    return function (value) {
      return value ? value.substring(0, value.lastIndexOf("Resenha completa")) : value;
    }
  });
app.controller('meuController', function ($scope, $http, $interval) {
  $scope.info = {
    comments: []
  };
  $scope.displayErrorStatus = function (status) {
    $scope.info = config.errorStatus[status];
    $scope.info.error = true;
  };
  // obtem comentarios mais recentes
  $scope.getComments = function () {
    $http.get("reviews.json", config.singleTimeout).then(function (response) {
      $scope.info.comments = response.data;
    }, function (e) {
      $scope.displayErrorStatus('comments');
    });
  };
  // obtem dados do google play
  $scope.getInfo = function () {
    $http.get("index.json", config.singleTimeout).then(function (response) {
      $scope.info = response.data;
      $scope.info.error = false;
      $scope.getComments();
    }, function (e) {
      $scope.displayErrorStatus('infos');
    });
  };
  // faz o polling com intervalo predefinido no server
  $scope.polling = function () {
    $interval(function () {
      $scope.getInfo();
    }, config.pollingInterval);
  };
  // obtem configuracao de tempo do poller e inicia
  $scope.bootstrap = function () {
    $http.get("config.json", config.singleTimeout).then(function (response) {
      config.pollingInterval = response.data.pollingInterval; // tempo de poller do ackend
      $scope.getInfo(); // first execution
      $scope.polling(); // polling interval
    }, function (e) {
      $scope.displayErrorStatus('config');
    });
  };
  // ainda nao tem os dados por isso nao tem infos pra apresentar
  $scope.displayErrorStatus('loading');
  $scope.bootstrap();
});