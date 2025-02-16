"""
Basic building blocks for generic class based views.

We don't bind behaviour to http method handlers yet,
which allows mixin classes to be composed in interesting ways.
"""
from django.db.models.query import prefetch_related_objects

from rest_framework import status
from rest_framework.response import Response
from rest_framework.settings import api_settings

from consts import *

class CreateModelMixin:
    """
    Create a model instance.
    """
    def create(self, request, *args, **kwargs):
        data = {
            'author': request.user.id if request.user.id is not None else 1,
            JSON_FIELDS: request.data,
        }
        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        return Response(serializer.data[JSON_FIELDS], status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save()

    def get_success_headers(self, data):
        try:
            return {'Location': str(data[api_settings.URL_FIELD_NAME])}
        except (TypeError, KeyError):
            return {}


class ListModelMixin:
    """
    List a queryset.
    """
    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        # print(serializer.data)
        for v in serializer.data:
            v[JSON_FIELDS]['@id'] = self.id_prefix + str(v['id']) + "/?format=json"
        resp = [v[JSON_FIELDS] for v in serializer.data]
        return Response(resp)


# based on https://github.com/MattBroach/DjangoRestMultipleModels/blob/master/drf_multiple_model/mixins.py#L100
class ListModelMixinMulti:
    """
    List a queryset for ObjectMultipleModelAPIViewSet.
    """
    def list(self, request, *args, **kwargs):
        querylist = self.get_querylist()

        results = self.get_empty_results()

        for query_data in querylist:
            self.check_query_data(query_data)

            queryset = self.load_queryset(query_data, request, *args, **kwargs)

            # Run the paired serializer
            context = self.get_serializer_context()
            data = query_data['serializer_class'](queryset, many=True, context=context).data

            label = self.get_label(queryset, query_data)

            # Add the serializer data to the running results tally
            results = self.add_to_results(data, label, results)

        formatted_results = self.format_results(results, request)

        if self.is_paginated:
            try:
                formatted_results = self.paginator.format_response(formatted_results)
            except AttributeError:
                raise NotImplementedError(
                    "{} cannot use the regular Rest Framework or Django paginators as is. "
                    "Use one of the included paginators from `drf_multiple_models.pagination "
                    "or subclass a paginator to add the `format_response` method."
                    "".format(self.__class__.__name__)
                )

        resp = {}
        for k, v in formatted_results.items():
            resp[k] = []
            for vv in v:
                vv[JSON_FIELDS]['@id'] = self.id_prefix[:-4] + k + "/" + str(vv['id']) + "/?format=json"
                resp[k].append(vv[JSON_FIELDS])
        return Response(resp)


class RetrieveModelJsonFieldMixin:
    """
    Retrieve a model instance.z
    """
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        # print(serializer.data[JSON_FIELDS])
        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        return Response(serializer.data[JSON_FIELDS])


class UpdateModelMixin:
    """
    Update a model instance.
    """
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if len(request.data) == 0 or '@id' not in request.data or '@type' not in request.data:
            if len(request.data) == 0:
                error_message = "DATA_EMPTY"
            elif '@id' not in request.data:
                error_message = "ID_MISSING"
            elif '@type' not in request.data:
                error_message = "TYPE_MISSING"
            return Response({'message': error_message, JSON_FIELDS: instance.fields}, status=400)
        data = {
            'author': request.user.id if request.user.id is not None else 1,
            JSON_FIELDS: request.data,
        }
        serializer = self.get_serializer(instance, data=data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        queryset = self.filter_queryset(self.get_queryset())
        if queryset._prefetch_related_lookups:
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance,
            # and then re-prefetch related objects
            instance._prefetched_objects_cache = {}
            prefetch_related_objects([instance], *queryset._prefetch_related_lookups)

        serializer.data[JSON_FIELDS]['@id'] = self.id_prefix + str(serializer.data['id']) + "/?format=json"
        return Response(serializer.data[JSON_FIELDS])

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)


class DestroyModelMixin:
    """
    Destroy a model instance.
    """
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    def perform_destroy(self, instance):
        instance.delete()
