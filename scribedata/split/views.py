import json
import csv
import os
from .models import PersonSplit
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required


def index(request):
    context = {}
    return render(request, 'split.html', context=context)

@login_required(login_url='/login/')
def data(request):
    p = PersonSplit.objects.get(name=request.user.username)

    # PROCESS SUBMIT
    submit = json.loads(request.body)
    # check if submit is containing data or is only requesting a task
    if all(key in submit.keys() for key in ['index', 'data', 'reject']):
        # if submit corresponds to the current task
        if submit['index'] == p.current_task:
            p.current_task += 1
            p.save()

            if not submit['reject']:
                with open(os.path.join('../static/csv/split/', p.name, 'submits.csv'), 'a') as f:
                    fieldnames = ['strokes', 'text', 'person']
                    submits_writer = csv.DictWriter(f, fieldnames=fieldnames)
                    for row in submit['data']:
                        submits_writer.writerow({'strokes': row['strokes'], 'text': row['text'], 'person': row['person']})
                msg = 'Erfolgreich in den Datensatz eingetragen!'
            else:
                p.rejected_tasks_string += str(submit['index']+',')
                msg = 'Erfolgreich aus dem Datensatz entfernt!'
        else:
            msg = 'Dieser Eintrag war schon vorhanden!'
    else:  # only requesting a task
        msg = 'Es wurden keine Daten gesendet!'

    # SEND NEXT TASK
    with open(os.path.join('../static/csv/write/', p.name, 'tasks.csv'), 'r') as f:
        tasks_reader = csv.DictReader(f)
        # skip csv header
        next(tasks_reader)
        # skip already completed tasks
        for i in range(p.current_task):
            next(tasks_reader)
        # read current task
        task = next(tasks_reader)
        task_data = {'strokes': task['strokes'], 'text': task['text'], 'person': task['person']}

    response = {
        'id': p.current_task,
        'data': task_data,
        'msg': msg
    }
    return JsonResponse(response)
