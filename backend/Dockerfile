FROM php:8.3-fpm-alpine

# Install system dependencies and PHP extensions
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    postgresql-dev \
    oniguruma-dev \
    bash \
    icu-dev

RUN docker-php-ext-install pdo pdo_pgsql gd xml mbstring intl

# Copy PHP configuration for optimization
COPY docker-php.ini /usr/local/etc/php/conf.d/app.ini

# Increase PHP-FPM performance settings
RUN echo "[www]\npm = dynamic\npm.max_children = 20\npm.start_servers = 5\npm.min_spare_servers = 2\npm.max_spare_servers = 10" >> /usr/local/etc/php-fpm.d/www.conf

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy project files
COPY . /var/www

# Install Composer packages with optimization
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set proper permissions
RUN mkdir -p storage/framework/cache storage/framework/views storage/logs && \
    chmod -R 775 storage bootstrap/cache

# Copy entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["php-fpm", "--nodaemonize"]
