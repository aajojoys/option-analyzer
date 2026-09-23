from django.http import HttpResponseNotFound

from visitor.view_utils import visitor_to_restrict, visitorinfo_collect

class VisitorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if visitor_to_restrict(request): return HttpResponseNotFound()
        request.client_ip = visitorinfo_collect(request)
        response = self.get_response(request)

        return response
