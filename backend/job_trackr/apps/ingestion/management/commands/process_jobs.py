# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/management/commands/process_jobs.py

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone

from apps.ingestion.models import IngestedJobPosting, IngestionStatus
from apps.ingestion.services.ingestion_processor import IngestionProcessor

BATCH_SIZE = 50


class Command(BaseCommand):
    help = "Process ingested job postings"

    def handle(self, *args, **options):
        processor = IngestionProcessor()

        success_count = 0
        failure_count = 0

        while True:
            with transaction.atomic():
                rows = list(
                    IngestedJobPosting.objects.select_for_update(skip_locked=True)
                    .filter(status=IngestionStatus.RECEIVED)
                    .order_by("ingested_at")[:BATCH_SIZE]
                )

                if not rows:
                    break

                for ing in rows:
                    try:
                        processor.process(ing)
                        success_count += 1

                    except Exception as exc:
                        failure_count += 1

                        ing.status = IngestionStatus.FAILED
                        ing.error_message = str(exc)[:1000]
                        ing.processed_at = timezone.now()
                        ing.save(
                            update_fields=[
                                "status",
                                "error_message",
                                "processed_at",
                                "updated_at",
                            ]
                        )

                        self.stderr.write(self.style.ERROR(f"[FAILED] {ing.pk}: {exc}"))

        self.stdout.write(
            self.style.SUCCESS(
                f"Processing complete. Success={success_count}, Failed={failure_count}"
            )
        )
