from django.shortcuts import render
from write.models import PersonWrite
from split.models import PersonSplit
from django.contrib.auth.decorators import login_required
from django.db.models import Sum
from django.conf import settings

# Create your views here.
@login_required(login_url='/login/')
def index(request):
    split_state = 'Anfangen!' if PersonSplit.objects.get(name=request.user.username).current_task == 0 else 'Weitermachen!'
    write_state = 'Anfangen!' if PersonWrite.objects.get(name=request.user.username).current_task == 0 else 'Weitermachen!'
    split_global_percentage = (PersonSplit.objects.aggregate(Sum('current_task')) * 100) / settings.SPLIT_NUM_TASKS
    write_global_percentage = (PersonWrite.objects.aggregate(Sum('current_task')) * 100) / settings.WRITE_NUM_TASKS
    split_person_percentage = (PersonSplit.objects.get(name=request.user.username).current_task * 100) / settings.SPLIT_TASKS_PER_PERSON
    write_person_percentage = (PersonWrite.objects.get(name=request.user.username).current_task * 100) / settings.WRITE_TASKS_PER_PERSON
    context = {'split_button': split_state,
               'write_button': write_state,
               'split_global': split_global_percentage,
               'write_global': write_global_percentage,
               'split_person': split_person_percentage,
               'write_person': write_person_percentage,}
    return render(request, 'stats.html', context=context)
