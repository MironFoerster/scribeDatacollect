from django.db import models

# Create your models here.
class PersonWrite(models.Model):
    name = models.CharField(max_length=50)
    current_index = models.IntegerField()
