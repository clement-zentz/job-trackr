# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/views.py

from typing import Any, cast

from django.db import IntegrityError, transaction
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .auth import IngestionApiKeyAuthentication
from .models import IngestedJobPosting, IngestionStatus
from .serializers import IngestedJobPostingInputSerializer
from .services.fingerprint import compute_fingerprint


class IngestJobPostingsView(APIView):
    """
    Receives extracted job postings from FastAPI
    """

    authentication_classes = [IngestionApiKeyAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = IngestedJobPostingInputSerializer(
            data=request.data,
            many=True,
        )
        serializer.is_valid(raise_exception=True)

        validated = cast(list[dict[str, Any]], serializer.validated_data)

        created = 0
        duplicates = 0

        for job in validated:
            fingerprint = compute_fingerprint(
                platform=job["platform"],
                job_key=job.get("job_key"),
                canonical_url=job.get("canonical_url"),
                title=job["title"],
                company=job["company"],
                location=job.get("location"),
            )

            try:
                with transaction.atomic():
                    # NOTE: Using per-row get_or_create for correctness and clear deduplication
                    # semantics. Can be optimized to bulk ingestion if batch sizes grow.
                    _, created_flag = IngestedJobPosting.objects.get_or_create(
                        fingerprint=fingerprint,
                        defaults={
                            **job,
                            "status": IngestionStatus.RECEIVED,
                        },
                    )
            except IntegrityError:
                # A concurrent request inserted the same fingerprint
                created_flag = False

            if created_flag:
                created += 1
            else:
                duplicates += 1

        return Response(
            {
                "received": len(validated),
                "created": created,
                "duplicates": duplicates,
            },
            status=status.HTTP_201_CREATED,
        )
