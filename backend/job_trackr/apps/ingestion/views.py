# SPDX-License-Identifier: AGPL-3.0-or-later
# File: backend/job_trackr/apps/ingestion/views.py

from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import IngestedJobPosting, IngestionStatus
from .serializers import IngestedJobPostingInputSerializer
from .services.fingerprint import compute_fingerprint


class IngestJobPostingsView(APIView):
    """
    Receives extracted job postings from FastAPI
    """

    def post(self, request):
        serializer = IngestedJobPostingInputSerializer(
            data=request.data,
            many=True,
        )
        serializer.is_valid(raise_exception=True)

        validated = serializer.validated_data
        if not isinstance(validated, list):
            raise TypeError("Expected list payload")

        created = 0
        duplicates = 0

        for job in validated:
            fingerprint = compute_fingerprint(
                platform=job["platform"],
                job_key=job.get("job_key"),
                canonical_url=job.get("canonical_url"),
                title=job["title"],
                company=job["company"],
            )

            _, created_flag = IngestedJobPosting.objects.get_or_create(
                fingerprint=fingerprint,
                defaults={
                    **job,
                    "status": IngestionStatus.RECEIVED,
                },
            )

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
