<?php

declare(strict_types=1);

namespace App\Bootstrap;

use DI\ContainerBuilder;
use PDO;
use Psr\Container\ContainerInterface;
use App\Database\Database;
use App\Repository\ParcelRepository;
use App\Service\ParcelService;

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
}
