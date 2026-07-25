<?php

declare(strict_types=1);

namespace App\Bootstrap;

use App\Controller\HealthController;
use Slim\App;

class Routes
{
    public static function register(App $app): void
    {

        $app->get(
            '/api/health',
            HealthController::class . ':index'
        );
    }
}
