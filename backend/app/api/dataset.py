from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def get_dataset():
    return {
        "name": "Fake and Real News Dataset",
        "version": "v1.0",
        "totalSamples": 44898,
        "fakeSamples": 22449,
        "realSamples": 22449,
        "duplicates": 0,
        "missingRecords": 0,
        "status": "Validated",
        "demo": True
    }

@router.post("/validate")
async def validate_dataset():
    return {
        "status": "valid",
        "checks": {
            "requiredColumns": True,
            "missingRecords": True,
            "duplicates": True,
            "labels": True,
            "classDistribution": True
        },
        "demo": True
    }
