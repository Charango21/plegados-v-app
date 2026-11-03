import os

from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'Creates or updates the initial production staff users.'

    def handle(self, *args, **options):
        admin_username = os.environ.get('ADMIN_USERNAME')
        admin_password = os.environ.get('ADMIN_PASSWORD')
        employee_username = os.environ.get('EMPLOYEE_USERNAME')
        employee_password = os.environ.get('EMPLOYEE_PASSWORD')

        if not any((admin_username, admin_password, employee_username, employee_password)):
            self.stdout.write('No initial user credentials configured; skipping.')
            return

        if not all((admin_username, admin_password, employee_username, employee_password)):
            raise CommandError(
                'ADMIN_USERNAME, ADMIN_PASSWORD, EMPLOYEE_USERNAME and '
                'EMPLOYEE_PASSWORD must be configured together.'
            )

        User = get_user_model()
        self._create_or_update_user(
            User,
            username=admin_username,
            password=admin_password,
            email=os.environ.get('ADMIN_EMAIL', 'admin@plegadosverdini.com'),
            role=User.Role.JEFE,
            is_staff=True,
            is_superuser=True,
        )
        self._create_or_update_user(
            User,
            username=employee_username,
            password=employee_password,
            email=os.environ.get('EMPLOYEE_EMAIL', 'empleado@plegadosverdini.com'),
            role=User.Role.EMPLEADO,
            is_staff=False,
            is_superuser=False,
        )

    def _create_or_update_user(self, User, **user_data):
        password = user_data.pop('password')
        username = user_data['username']
        user, created = User.objects.get_or_create(
            username=username,
            defaults={key: value for key, value in user_data.items() if key != 'username'},
        )

        for key, value in user_data.items():
            setattr(user, key, value)
        user.set_password(password)
        user.save()

        action = 'created' if created else 'updated'
        self.stdout.write(self.style.SUCCESS(f'Initial user {username} {action}.'))
