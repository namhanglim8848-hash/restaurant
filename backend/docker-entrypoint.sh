#!/bin/bash
set -e

# Run migrations only if RUN_MIGRATIONS is set
if [ "$RUN_MIGRATIONS" = "true" ]; then
    php artisan migrate --force
    php artisan db:seed --force
fi

# Execute the main command
exec "$@"
