from django.db import models

# Create your models here.
class PersonSplit(models.Model):
    name = models.CharField(max_length=50)
    current_task = models.IntegerField()
    rejected_task_string = models.CharField(max_length=500)
