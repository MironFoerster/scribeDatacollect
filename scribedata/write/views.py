import json
import csv
import os
from django.conf import settings
from .models import PersonWrite
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required

@login_required(login_url='/')
def index(request):
    context = {}
    return render(request, 'write.html', context=context)

@login_required(login_url='/')
def data(request):
    p = PersonWrite.objects.get(name=request.user.username)

    # PROCESS SUBMIT
    submit = json.loads(request.body)
    # check if submit is containing data or is only requesting a task
    if all(key in submit.keys() for key in ['index', 'data']):
        # if submit corresponds to the current task
        if submit['index'] == p.current_task:
            p.current_task += 1
            p.save()

            with open(os.path.join(settings.BASE_DIR, 'media/csv/write/', p.name, 'submits.csv'), 'a', newline='') as f:
                fieldnames = ['strokes', 'text', 'person']
                submits_writer = csv.DictWriter(f, fieldnames=fieldnames, delimiter=';')
                for word in submit['data']:
                    submits_writer.writerow({'strokes': word['strokes'], 'text': word['text'], 'person': word['person']})
            msg = 'Erfolgreich in den Datensatz eingetragen!'
        else:
            msg = 'Dieser Eintrag war schon vorhanden!'
    else:  # only requesting a task
        msg = 'Es wurden keine Daten empfangen!'

    # SEND NEXT TASK
    if PersonWrite.objects.get(name=request.user.username).current_task == settings.WRITE_TASKS_PER_PERSON:
        task_data = []
        task_index = -1
        msg = 'finished'
    else:
        with open(os.path.join(settings.BASE_DIR, 'media/csv/write/', p.name, 'tasks.csv'), 'r') as f:
            fieldnames = ['text', 'person']
            tasks_reader = csv.DictReader(f, fieldnames=fieldnames, delimiter=';')
            # skip csv header
            next(tasks_reader)
            # skip already completed tasks
            for i in range(p.current_task):
                next(tasks_reader)
            # read current task
            task = next(tasks_reader)
            task_data = {'text': task['text'], 'person': task['person']}
            task_index = p.current_task

    response = {
        'index': task_index,
        'data': task_data,
        'msg': msg
    }
    return JsonResponse(response)
