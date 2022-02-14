from django.db import models

# Create your models here.
class PersonSplit(models.Model):
    name = models.CharField(max_length=50)
    current_index = models.IntegerField()
    rejected_index_string = models.CharField(max_length=500)
