# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/management/commands/seed_demo_jobs.py

from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError, CommandParser
from django.db import transaction

from apps.common.demo_data.constants import DEMO_USERNAME_PREFIX
from apps.users.models import User


def distribute_count(total: int, buckets: int) -> list[int]:
    quotient, remainder = divmod(total, buckets)

    return [quotient + (1 if index < remainder else 0) for index in range(buckets)]


def distribute_candidacies(
    total: int,
    posting_counts: list[int],
) -> list[int]:
    candidacy_counts = [0] * len(posting_counts)
    remaining = total

    while remaining:
        for index, posting_count in enumerate(posting_counts):
            if remaining == 0:
                break

            if candidacy_counts[index] < posting_count:
                candidacy_counts[index] += 1
                remaining -= 1

    return candidacy_counts


class Command(BaseCommand):
    help = "Seed demo users, job postings, and candidacies."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--users", type=int, default=3)
        parser.add_argument("--postings", type=int, default=330)
        parser.add_argument("--candidacies", type=int, default=165)
        parser.add_argument(
            "--reset",
            action="store_true",
            help="Delete existing demo data before seeding.",
        )

    @transaction.atomic
    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG:
            raise CommandError("This command can only be run with DEBUG=True.")

        try:
            from apps.jobs.demo_data.job_candidacy import DemoJobCandidacyFactory
            from apps.jobs.demo_data.job_posting import DemoJobPostingFactory
            from apps.users.demo_data.user import DemoUserFactory
        except ImportError as exc:
            raise CommandError(
                "The seed_demo_jobs command requires test dependencies. "
                "Install test dependencies before running this command, "
                "e.g. with the test dependency group."
            ) from exc

        users_count = options["users"]
        postings_count = options["postings"]
        candidacies_count = options["candidacies"]
        reset = options["reset"]

        if users_count <= 0:
            raise CommandError("Users count must be greater than 0.")

        if postings_count <= 0:
            raise CommandError("Postings count must be greater than 0.")

        if candidacies_count < 0:
            raise CommandError("Candidacies count must be greater than or equal to 0.")

        if users_count > postings_count:
            raise CommandError("Users count cannot be greater than postings count.")

        if candidacies_count > postings_count:
            raise CommandError(
                "Candidacies count cannot be greater than postings count."
            )

        demo_users = User.objects.filter(username__startswith=DEMO_USERNAME_PREFIX)

        if reset:
            deleted_users = demo_users.count()
            demo_users.delete()

            if deleted_users:
                self.stdout.write(
                    f"Deleted {deleted_users} existing demo users and their data."
                )

        elif demo_users.exists():
            raise CommandError(
                "Demo data already exists. Run the command with --reset to replace it."
            )

        users = DemoUserFactory.create_batch(users_count)

        posting_counts = distribute_count(
            postings_count,
            users_count,
        )
        candidacy_counts = distribute_candidacies(
            candidacies_count,
            posting_counts,
        )

        for user, posting_count, candidacy_count in zip(
            users,
            posting_counts,
            candidacy_counts,
            strict=True,
        ):
            postings = DemoJobPostingFactory.create_batch(
                posting_count,
                owner=user,
            )

            for posting in postings[:candidacy_count]:
                DemoJobCandidacyFactory(job_posting=posting)

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(users)} demo users, "
                f"{postings_count} job postings, "
                f"and {candidacies_count} candidacies."
            )
        )
