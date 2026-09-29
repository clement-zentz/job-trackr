# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/api/views.py

from typing import cast

from rest_framework import generics
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated

from apps.users.models import User

from .serializers import UserAccountSerializer


class UserAccountView(generics.RetrieveUpdateAPIView[User]):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]
    serializer_class = UserAccountSerializer

    # Account settings are naturally partial updates. Keeping PUT disabled
    # avoids implying that clients should replace the complete user resource.
    http_method_names = ["get", "patch", "head", "options"]

    def get_object(self) -> User:
        user = cast(User, self.request.user)
        self.check_object_permissions(self.request, user)
        return user
