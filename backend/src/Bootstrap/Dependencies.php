<?php

declare(strict_types=1);

namespace App\Bootstrap;

use DI\ContainerBuilder;
use Psr\Container\ContainerInterface;

class Dependencies
{
    public static function createContainer(): ContainerInterface
    {
        $builder = new ContainerBuilder();

        $builder->useAutowiring(true);
        return $builder->build();
    }
}
