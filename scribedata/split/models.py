from django.db import models

# Create your models here.
class PersonSplit(models.Model):
    name = models.CharField(max_length=50)
    current_task = models.IntegerField(default=0)
    rejected_tasks_string = models.CharField(max_length=500, default='')
