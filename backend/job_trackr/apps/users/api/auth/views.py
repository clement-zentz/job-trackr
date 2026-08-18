# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/auth/views.py

from collections.abc import Sequence
from typing import cast

from django.contrib.auth import authenticate, login, logout
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_protect, ensure_csrf_cookie
from rest_framework.authentication import BaseAuthentication, SessionAuthentication
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_204_NO_CONTENT
from rest_framework.views import APIView

from apps.users.models import User

from .serializers import LoginSerializer, UserReadSerializer


@method_decorator(ensure_csrf_cookie, name="dispatch")
class CsrfView(APIView):
    authentication_classes: Sequence[type[BaseAuthentication]] = ()
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        return Response(status=HTTP_204_NO_CONTENT)


@method_decorator(csrf_protect, name="dispatch")
class LoginView(APIView):
    authentication_classes: Sequence[type[BaseAuthentication]] = ()
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        credentials = cast(dict[str, str], serializer.validated_data)

        user = authenticate(
            request=request._request,
            username=credentials["username"],
            password=credentials["password"],
        )

        if user is None:
            raise ValidationError(
                {"non_field_errors": ["Invalid username or password."]}
            )

        authenticated_user = cast(User, user)  # type: ignore[redundant-cast]

        login(request._request, authenticated_user)

        return Response(
            UserReadSerializer(authenticated_user).data,
            status=HTTP_200_OK,
        )


class LogoutView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        logout(request._request)

        return Response(status=HTTP_204_NO_CONTENT)


class CurrentUserView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        user = cast(User, request.user)

        return Response(
            UserReadSerializer(user).data,
            status=HTTP_200_OK,
        )
