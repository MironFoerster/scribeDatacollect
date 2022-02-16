import json
from django.contrib.auth import login, logout
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.models import User
from django.core.exceptions import ObjectDoesNotExist


# Create your views here.
def index(request):
    context = {}
    return render(request, 'intro.html', context=context)


def login_view(request):
    data = json.loads(request.body)
    try:
        user = User.objects.get(username=data['username'].replace('.', ''))
        login(request, user)
        login_info = {'succ': True, 'msg': 'Login erfolgreich!'}
    except ObjectDoesNotExist:
        login_info = {'succ': False, 'msg': 'Name ist ungültig!'}
    return JsonResponse(login_info)


def logout_view(request):
    logout(request)
    logout_info = {'msg': 'Logout erfolgreich!'}
    return JsonResponse(logout_info)
