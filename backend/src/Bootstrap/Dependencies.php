<?php

declare(strict_types=1);

namespace App\Bootstrap;

use DI\ContainerBuilder;
use PDO;
use Psr\Container\ContainerInterface;
use App\Database\Database;

class Dependencies
{
    public static function createContainer(): ContainerInterface
    {
        $builder = new ContainerBuilder();

        $builder->addDefinitions([
            PDO::class => fn(): PDO => Database::create(),
        ]);

        $builder->useAutowiring(true);
        return $builder->build();
    }
}
