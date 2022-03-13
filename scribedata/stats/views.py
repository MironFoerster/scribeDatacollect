from django.shortcuts import render
from write.models import PersonWrite
from split.models import PersonSplit
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.conf import settings

# Create your views here.
@login_required(login_url='/')
def index(request):
    split_state = 'Anfangen!' if PersonSplit.objects.get(name=request.user.username).current_task == 0 else ('Weiter!' if PersonSplit.objects.get(name=request.user.username).current_task != settings.SPLIT_TASKS_PER_PERSON else 'Fertig')
    write_state = 'Anfangen!' if PersonWrite.objects.get(name=request.user.username).current_task == 0 else ('Weiter!' if PersonWrite.objects.get(name=request.user.username).current_task != settings.WRITE_TASKS_PER_PERSON else 'Fertig')
    split_global_sum = PersonSplit.objects.aggregate(Sum('current_task'))['current_task__sum']
    split_global_percentage = (split_global_sum * 100) / settings.SPLIT_NUM_TASKS
    split_global_text = str(split_global_sum)+'/'+str(settings.SPLIT_NUM_TASKS)
    write_global_sum = PersonWrite.objects.aggregate(Sum('current_task'))['current_task__sum']
    write_global_percentage = (write_global_sum * 100) / settings.WRITE_NUM_TASKS
    write_global_text = str(write_global_sum)+'/'+str(settings.WRITE_NUM_TASKS)
    split_person_num = PersonSplit.objects.get(name=request.user.username).current_task
    split_person_percentage = (split_person_num * 100) / settings.SPLIT_TASKS_PER_PERSON
    split_person_text = str(split_person_num)+'/'+str(settings.SPLIT_TASKS_PER_PERSON)
    write_person_num = PersonWrite.objects.get(name=request.user.username).current_task
    write_person_percentage = (write_person_num * 100) / settings.WRITE_TASKS_PER_PERSON
    write_person_text = str(write_person_num)+'/'+str(settings.WRITE_TASKS_PER_PERSON)
    context = {'split_button': split_state,
               'write_button': write_state,
               'split_global': split_global_percentage,
               'split_global_text': split_global_text,
               'write_global': write_global_percentage,
               'write_global_text': write_global_text,
               'split_person': split_person_percentage,
               'split_person_text': split_person_text,
               'write_person': write_person_percentage,
               'write_person_text': write_person_text,}
    return render(request, 'stats.html', context=context)
