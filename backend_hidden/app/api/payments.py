"""
Payment API endpoints for Stripe integration and credit management
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import (
    PaymentIntentRequest, PaymentIntentResponse, PaymentConfirmationRequest, 
    PaymentConfirmationResponse, CreditBalance, CreditTransactionResponse,
    JobCostCalculation
)
from app.services.payment_service import PaymentService
from app.auth import get_current_user
from typing import List

router = APIRouter(prefix="/payments", tags=["payments"])


@router.post("/create-payment-intent", response_model=PaymentIntentResponse)
async def create_payment_intent(
    request: PaymentIntentRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe payment intent for credit purchase"""
    try:
        payment_service = PaymentService(db)
        result = payment_service.create_payment_intent(request)
        
        return PaymentIntentResponse(
            client_secret=result.get("client_secret"),
            payment_intent_id=result.get("payment_intent_id"),
            amount=result.get("amount", 0)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/confirm-payment", response_model=PaymentConfirmationResponse)
async def confirm_payment(
    request: PaymentConfirmationRequest,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Confirm a Stripe payment and add credits"""
    try:
        payment_service = PaymentService(db)
        result = payment_service.confirm_payment(request)
        
        if not result["success"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=result.get("error", "Payment confirmation failed")
            )
        
        return PaymentConfirmationResponse(
            success=True,
            credits_added=result["credits_added"],
            new_balance=result["new_balance"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/credits", response_model=CreditBalance)
async def get_credit_balance(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user's current credit balance"""
    try:
        payment_service = PaymentService(db)
        balance = payment_service.get_user_credits(current_user["sub"])
        
        return CreditBalance(
            balance=balance,
            user_id=current_user["sub"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.get("/transactions", response_model=List[CreditTransactionResponse])
async def get_credit_transactions(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get user's credit transaction history"""
    try:
        payment_service = PaymentService(db)
        transactions = payment_service.get_credit_transactions(
            user_id=current_user["sub"],
            limit=limit,
            offset=offset
        )
        
        return transactions
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )


@router.post("/calculate-job-cost", response_model=JobCostCalculation)
async def calculate_job_cost(
    languages: List[str],
    duration: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Calculate the credit cost for a dubbing job"""
    try:
        payment_service = PaymentService(db)
        result = payment_service.calculate_job_cost(languages, duration)
        
        return JobCostCalculation(
            estimated_cost=result["estimated_cost"],
            languages=result["languages"],
            duration=result["duration"],
            breakdown=result["breakdown"]
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/can-afford-job")
async def can_afford_job(
    languages: List[str],
    duration: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Check if user can afford a dubbing job"""
    try:
        payment_service = PaymentService(db)
        result = payment_service.can_afford_job(
            user_id=current_user["sub"],
            languages=languages,
            duration=duration
        )
        
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/pricing-plans")
async def get_pricing_plans():
    """Get available pricing plans"""
    from app.services.payment_service import PRICING_PLANS
    
    return {
        "plans": PRICING_PLANS,
        "description": "Available credit packages for purchase"
    }
