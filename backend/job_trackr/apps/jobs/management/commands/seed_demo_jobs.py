# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/jobs/management/commands/seed_demo_jobs.py

from typing import Any

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError, CommandParser


class Command(BaseCommand):
    help = "Seed demo job postings and candidacies."

    def add_arguments(self, parser: CommandParser) -> None:
        parser.add_argument("--postings", type=int, default=50)
        parser.add_argument("--candidacies", type=int, default=25)

    def handle(self, *args: Any, **options: Any) -> None:
        if not settings.DEBUG:
            raise CommandError("This command can only be run with DEBUG=True.")

        try:
            from apps.jobs.demo_data.job_candidacy import DemoJobCandidacyFactory
            from apps.jobs.demo_data.job_posting import DemoJobPostingFactory
        except ImportError as exc:
            raise CommandError(
                "The seed_demo_jobs command requires test dependencies. "
                "Install test dependencies before running this command, "
                "e.g. with the test dependency group."
            ) from exc

        postings_count = options["postings"]
        candidacies_count = options["candidacies"]

        if postings_count <= 0:
            raise CommandError("Postings count must be greater than 0.")

        if candidacies_count < 0:
            raise CommandError("Candidacies count must be greater than or equal to 0.")

        if candidacies_count > postings_count:
            raise CommandError(
                "Candidacies count cannot be greater than postings count."
            )

        postings = DemoJobPostingFactory.create_batch(postings_count)

        for posting in postings[:candidacies_count]:
            DemoJobCandidacyFactory(job_posting=posting)

        self.stdout.write(
            self.style.SUCCESS(
                f"Created {len(postings)} job postings and {candidacies_count} candidacies."
            )
        )
