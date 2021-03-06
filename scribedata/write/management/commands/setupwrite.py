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

        tasks_fp = os.path.join(settings.BASE_DIR, 'media/csv/setup', options['tasks_fp'][0])

        # count all tasks and find out tasks per person
        with open(tasks_fp, 'r') as forcount_tasks_file:
            forcount_tasks_reader = csv.reader(forcount_tasks_file, delimiter=';')
            num_tasks = sum(1 for task in forcount_tasks_reader)-1  # minus header row
        num_users = User.objects.all().count()
        tasks_per_person = num_tasks // num_users
        num_dropped_tasks = num_tasks % num_users

        self.stdout.write('NUM_USERS=%d' % num_users)
        self.stdout.write('WRITE_NUM_TASKS=%d' % (num_tasks-num_dropped_tasks))
        self.stdout.write('WRITE_TASKS_PER_PERSON=%d' % tasks_per_person)
        self.stdout.write('WRITE_NUM_DROPPED_TASKS=%d' % num_dropped_tasks)

        # populate database and create file infrastructure
        with open(tasks_fp, 'r') as full_tasks_file:
            fieldnames = ['text']
            full_tasks_reader = csv.DictReader(full_tasks_file, fieldnames=fieldnames, delimiter=';')
            next(full_tasks_reader)  # pop header
            for user in User.objects.all():
                # create PersonWrite Object and /csv/write/person/ Directory
                p = PersonWrite.objects.create(name=user.username)
                person_dp = os.path.join(settings.BASE_DIR, 'media/csv/write/', p.name)
                os.makedirs(person_dp, exist_ok=True)

                with open(os.path.join(person_dp, 'tasks.csv'), 'w', newline='') as person_tasks_file:
                    fieldnames = ['text', 'person']
                    person_tasks_writer = csv.DictWriter(person_tasks_file, fieldnames=fieldnames, delimiter=';')

                    person_tasks_writer.writeheader()
                    for i in range(tasks_per_person):
                        person_tasks_writer.writerow({'text': next(full_tasks_reader)['text'], 'person': p.name})

                with open(os.path.join(person_dp, 'submits.csv'), 'w', newline='') as person_submits_file:
                    fieldnames = ['strokes', 'text', 'person']
                    person_submits_writer = csv.DictWriter(person_submits_file, fieldnames=fieldnames, delimiter=';')
                    person_submits_writer.writeheader()

        self.stdout.write(self.style.SUCCESS('Successfully initialized write-data infrastructure!'))
