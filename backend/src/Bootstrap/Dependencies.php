<?php

declare(strict_types=1);

namespace App\Bootstrap;

use DI\ContainerBuilder;
use PDO;
use Psr\Container\ContainerInterface;
use App\Database\Database;
use App\Repository\ParcelRepository;
use App\Service\ParcelService;
use Slim\App;

class Dependencies
{
    public static function createContainer(): ContainerInterface
    {
        $builder = new ContainerBuilder();

        $builder->useAutowiring(true);
        $builder->addDefinitions([
            PDO::class => fn(): PDO => Database::create(),
            ParcelRepository::class => fn(ContainerInterface $container): ParcelRepository =>
            new ParcelRepository($container->get(PDO::class)),
            ParcelService::class => fn(ContainerInterface $container): ParcelService =>
            new ParcelService($container->get(ParcelRepository::class)),
        ]);

        return $builder->build();
    }

    public static function registerMiddleware(App $app): void
    {
        $app->addBodyParsingMiddleware();

        $app->add(function ($request, $handler) {
            $response = $handler->handle($request);
            return $response
                ->withHeader('Access-Control-Allow-Origin', '*')
                ->withHeader('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type, Accept, Origin, Authorization')
                ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        });
    }
}
