from django.core.management.base import BaseCommand
from ...views import createPredicate5W1H

class Command(BaseCommand):
    help = "createPredicate5W1H"

    def handle(self, *args, **options):
        print('Start runnning createPredicate5W1H')
        createPredicate5W1H()
        print('Finished runnning createPredicate5W1H')
    