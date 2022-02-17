import csv
import os
from django.contrib.auth.models import User
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings
from write.models import PersonWrite

class Command(BaseCommand):
    help = 'resetting and creating all write-data infrastructure'

    def add_arguments(self, parser):
        parser.add_argument('tasks_fp', nargs=1)

    def handle(self, *args, **options):
        # delete all existing PersonWrites
        PersonWrite.objects.all().delete()

        tasks_fp = options['tasks_fp']

        # count all tasks and find out tasks per person
        forcount_tasks_reader = csv.reader(tasks_fp, delimiter=';')
        num_tasks = sum(1 for task in forcount_tasks_reader)-1  # minus header row
        num_users = User.objects.all().count()
        tasks_per_person = num_tasks // num_users
        num_dropped_tasks = num_tasks % num_users

        self.stdout.write('There are %d persons!' % num_users)
        self.stdout.write('There are %d write tasks!' % num_tasks)
        self.stdout.write('Every person will get %d write tasks!' % tasks_per_person)
        self.stdout.write('%d write tasks will get dropped!' % num_dropped_tasks)

        # populate database and create file infrastructure
        full_tasks_reader = csv.DictReader(tasks_fp, delimiter=';')  # automatically pops header?
        try:
            for user in User.objects.all():
                p = PersonWrite.objects.create(name=user.username)
                person_dp = os.path.join(settings.BASE_DIR, 'static/csv/write/', p.name)
                os.makedirs(person_dp, exist_ok=True)

                with open(os.path.join(person_dp, 'tasks.csv'), 'w') as person_tasks_file:
                    fieldnames = ['text', 'person']
                    person_tasks_writer = csv.DictWriter(person_tasks_file, fieldnames=fieldnames, delimiter=';')

                    person_tasks_writer.writeheader()
                    for i in range(tasks_per_person):
                        person_tasks_writer.writerow({'text': next(full_tasks_reader)['text'], 'person': p.name})

                with open(os.path.join(person_dp, 'submits.csv'), 'w') as person_submits_file:
                    fieldnames = ['strokes', 'text', 'person']
                    person_submits_writer = csv.DictWriter(person_submits_file, fieldnames=fieldnames, delimiter=';')
                    person_submits_writer.writeheader()

        except:
            raise CommandError('There was a Problem... and this exception handling is huge garbage...')

        self.stdout.write(self.style.SUCCESS('Successfully initialized write-data infrastructure!'))
