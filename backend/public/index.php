<?php

declare(strict_types=1);

use App\Bootstrap\Dependencies;
use App\Bootstrap\Routes;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$container = Dependencies::createContainer();
AppFactory::setContainer($container);

$app = AppFactory::create();

$app->addErrorMiddleware(true, true, true);

Routes::register($app);

$app->run();
