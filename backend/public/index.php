<?php

declare(strict_types=1);

use App\Bootstrap\Dependencies;
use App\Bootstrap\Routes;
use Slim\Factory\AppFactory;

require __DIR__ . '/../vendor/autoload.php';

$app = AppFactory::create();

$displayErrors = true;

$app->addErrorMiddleware(
    $displayErrors,
    true,
    true
);

Dependencies::register($app);
Routes::register($app);

$app->run();
