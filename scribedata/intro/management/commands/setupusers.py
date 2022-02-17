import csv
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError


class Command(BaseCommand):
    help = 'resetting and creating all Users from csv file'

    def add_arguments(self, parser):
        parser.add_argument('users_fp', nargs=1)

    def handle(self, *args, **options):
        users_fp = options['users_fp']
        # delete all existing users
        User.objects.all().delete()

        try:
            with open(users_fp) as users_file:
                users_reader = csv.reader(users_file)
                for username in users_reader:
                    User.objects.create_user(username[0])  # username is list
        except FileNotFoundError:
            raise CommandError('File "%s" does not exist!' % users_fp)

        self.stdout.write(self.style.SUCCESS('Successfully initialized Users from "%s"!' % users_fp))
