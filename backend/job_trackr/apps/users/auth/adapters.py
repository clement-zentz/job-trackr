# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/users/auth/adapters.py

from typing import Any, cast

from allauth.account.adapter import DefaultAccountAdapter
from allauth.core.exceptions import ImmediateHttpResponse
from allauth.headless.internal.restkit.response import ErrorResponse
from django.core.exceptions import ValidationError
from django.db import IntegrityError, transaction
from django.http import HttpRequest

from apps.users.models import User


# django-allauth does not provide typing information for this base class.
class AccountAdapter(DefaultAccountAdapter):  # type: ignore[misc]
    def save_user(
        self,
        request: HttpRequest,
        user: User,
        form: Any,
        commit: bool = True,
    ) -> User:
        username = form.cleaned_data.get("username")

        if isinstance(username, str):
            normalized_username = username.lower()

            try:
                form.fields["username"].run_validators(normalized_username)
            except ValidationError as exc:
                form.add_error("username", exc)

                raise ImmediateHttpResponse(
                    response=ErrorResponse(
                        request,
                        input=form,
                    )
                ) from exc

            form.cleaned_data["username"] = normalized_username

        try:
            with transaction.atomic():
                return cast(
                    User,
                    super().save_user(
                        request,
                        user,
                        form,
                        commit=commit,
                    ),
                )
        except IntegrityError as exc:
            username = form.cleaned_data.get("username")

            if (
                isinstance(username, str)
                and User.objects.filter(username=username).exists()
            ):
                form.add_error(
                    "username",
                    self.validation_error("username_taken"),
                )

                raise ImmediateHttpResponse(
                    response=ErrorResponse(
                        request,
                        input=form,
                    )
                ) from exc

            raise
