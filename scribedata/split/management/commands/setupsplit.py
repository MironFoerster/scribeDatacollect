import csv
import os
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from split.models import PersonSplit

class Command(BaseCommand):
    help = 'resetting and creating all split-data infrastructure'

    def add_arguments(self, parser):
        parser.add_argument('tasks_fp', nargs=1)

    def handle(self, *args, **options):
        # delete all existing PersonSplits
        PersonSplit.objects.all().delete()

        tasks_fp = options['tasks_fp']

        # count all tasks and find out tasks per person
        forcount_tasks_reader = csv.reader(tasks_fp, delimiter=';')
        num_tasks = sum(1 for task in forcount_tasks_reader)-1  # minus header row
        num_users = User.objects.all().count()
        tasks_per_person = num_tasks // num_users
        num_dropped_tasks = num_tasks % num_users

        self.stdout.write('There are %d persons!' % num_users)
        self.stdout.write('There are %d split tasks!' % num_tasks)
        self.stdout.write('Every person will get %d split tasks!' % tasks_per_person)
        self.stdout.write('%d split tasks will get dropped!' % num_dropped_tasks)

        full_tasks_reader = csv.reader(tasks_fp, delimiter=';')
        next(full_tasks_reader)  # skip header

        try:
            for user in User.objects.all():
                person_dp = os.path.join(settings.BASE_DIR, 'static/csv/work/', user.username)
                os.makedirs(person_dp, exist_ok=True)

                with open(os.path.join(person_dp, 'split_tasks.csv'), 'w') as person_tasks_file:
                    person_tasks_writer = csv.writer(person_tasks_file, delimiter=';')

                    person_tasks_writer.writerow(['data'])  # write header
                    for i in range(tasks_per_person):
                        person_tasks_writer.writerow(next(full_tasks_reader))

        except:
            raise CommandError('There was a Problem... and this exception handling is huge garbage...')

        self.stdout.write(self.style.SUCCESS('Successfully initialized split-data infrastructure!'))
