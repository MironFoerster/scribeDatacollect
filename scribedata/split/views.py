import csv
import json

from django.shortcuts import render
from django.http import JsonResponse
from .models import PersonSplit
from django.core.exceptions import ObjectDoesNotExist


# Create your views here.
def index(request):
    context = {}
    return render(request, 'split.html', context=context)

def data(request):
    try:
        p = PersonSplit.objects.get(name=request.user.username)
    except ObjectDoesNotExist:
        return JsonResponse({'err': 'ObjectDoesNotExist', 'msg': 'Du bist nicht eingeloggt!'})

    # process submit
    submit = json.loads(request.body)
    #check if submit is valid
    if all(key in submit.keys() for key in ['index', 'data', 'reject']):
        if submit['index'] == p.current_task:
            p.current_task += 1
            if not submit['reject']:
                with open('../static/csv/split_submits.csv') as f:
                    fieldnames = ['data', 'person']
                    submits_writer = csv.DictWriter(f, fieldnames=fieldnames)
                    submits_writer.writerow({'data': submit['data'], 'person': p.name})
                msg = 'Erfolgreich in den Datensatz eingetragen!'
            else:
                msg = 'Erfolgreich aus dem Datensatz entfernt!'
        else:
            msg = 'Dieser Eintrag war schon vorhanden!'


    # send next task
    with open('../static/csv/setup/split_tasks.csv') as f:
        tasks_reader = csv.DictReader(f)
        # skip csv header
        next(tasks_reader)
        # skip already completed tasks
        for i in range(p.current_task):
            next(tasks_reader)
        # read current task
        current_task_data = next(tasks_reader)

    response = {
        'id': p.current_task,
        'data': current_task_data,
        'msg': msg
    }
    return JsonResponse(response)
