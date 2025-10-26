"""
Payment service for Stripe integration and credit management
"""
import stripe
import uuid
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from datetime import datetime

from app.config import settings
from app.models import UserCredits, CreditTransaction
from app.schemas import (
    PaymentIntentRequest, PaymentConfirmationRequest,
    CreditTransactionResponse, JobCostCalculation
)

# Initialize Stripe
stripe.api_key = settings.stripe_secret_key

# Pricing plans configuration
PRICING_PLANS = {
    "creator": {
        "credits": 50,
        "price_cents": 2900,  # $29
        "name": "Creator Pack"
    },
    "professional": {
        "credits": 250,
        "price_cents": 9900,  # $99
        "name": "Professional Pack"
    },
    "enterprise": {
        "credits": 1000,
        "price_cents": 29900,  # $299
        "name": "Enterprise Pack"
    }
}

# Credit calculation rates (credits per second of audio)
CREDIT_RATES = {
    "base_rate": 0.1,  # Base rate per second
    "language_multiplier": {
        "common": 1.0,  # English, Spanish, French, German
        "uncommon": 1.2,  # Less common languages
        "rare": 1.5  # Very rare languages
    }
}

# Language classification for pricing
LANGUAGE_CLASSIFICATION = {
    "common": ["en", "es", "fr", "de", "it", "pt", "ru", "ja", "ko", "zh"],
    "uncommon": ["ar", "hi", "th", "vi", "pl", "tr", "nl", "sv", "da", "no"],
    "rare": ["af", "am", "az", "be", "bg", "bn", "bs", "ca", "cs", "cy", "et", "eu", "fa", "fi", "gl", "gu", "he", "hr", "hu", "hy", "id", "is", "ka", "kk", "km", "kn", "ky", "lo", "lt", "lv", "mk", "ml", "mn", "mr", "ms", "my", "ne", "pa", "ro", "si", "sk", "sl", "sq", "sr", "sw", "ta", "te", "tg", "tl", "uk", "ur", "uz", "vi", "zu"]
}


class PaymentService:
    """Service for handling payments and credit management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_payment_intent(self, request: PaymentIntentRequest) -> Dict[str, Any]:
        """
        Create a Stripe payment intent for credit purchase
        
        Args:
            request: Payment intent request with plan and user_id
            
        Returns:
            Dict containing client_secret, payment_intent_id, and amount
        """
        try:
            # Validate plan
            if request.plan not in PRICING_PLANS:
                raise ValueError(f"Invalid plan: {request.plan}")
            
            plan_config = PRICING_PLANS[request.plan]
            
            # Create Stripe payment intent
            intent = stripe.PaymentIntent.create(
                amount=plan_config["price_cents"],
                currency="usd",
                metadata={
                    "user_id": request.user_id,
                    "plan": request.plan,
                    "credits": plan_config["credits"]
                },
                automatic_payment_methods={
                    "enabled": True,
                },
            )
            
            return {
                "client_secret": intent.client_secret,
                "payment_intent_id": intent.id,
                "amount": plan_config["price_cents"]
            }
            
        except stripe.error.StripeError as e:
            raise Exception(f"Stripe error: {str(e)}")
        except Exception as e:
            raise Exception(f"Payment intent creation failed: {str(e)}")
    
    def confirm_payment(self, request: PaymentConfirmationRequest) -> Dict[str, Any]:
        """
        Confirm a Stripe payment and add credits to user account
        
        Args:
            request: Payment confirmation request with payment_intent_id and user_id
            
        Returns:
            Dict containing success status, credits_added, and new_balance
        """
        try:
            # Retrieve payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(request.payment_intent_id)
            
            # Verify payment was successful
            if intent.status != "succeeded":
                return {
                    "success": False,
                    "error": f"Payment not successful. Status: {intent.status}"
                }
            
            # Verify user_id matches
            if intent.metadata.get("user_id") != request.user_id:
                return {
                    "success": False,
                    "error": "Payment intent user mismatch"
                }
            
            # Get plan configuration
            plan = intent.metadata.get("plan")
            if plan not in PRICING_PLANS:
                return {
                    "success": False,
                    "error": "Invalid plan in payment intent"
                }
            
            credits_to_add = PRICING_PLANS[plan]["credits"]
            
            # Check if this payment has already been processed
            existing_transaction = self.db.query(CreditTransaction).filter(
                and_(
                    CreditTransaction.stripe_payment_intent_id == request.payment_intent_id,
                    CreditTransaction.user_id == request.user_id
                )
            ).first()
            
            if existing_transaction:
                return {
                    "success": False,
                    "error": "Payment already processed"
                }
            
            # Add credits to user account
            result = self._add_credits(
                user_id=request.user_id,
                amount=credits_to_add,
                transaction_type="purchase",
                stripe_payment_intent_id=request.payment_intent_id,
                description=f"Credit purchase - {PRICING_PLANS[plan]['name']}",
                metadata={
                    "plan": plan,
                    "stripe_amount": intent.amount,
                    "stripe_currency": intent.currency
                }
            )
            
            return {
                "success": True,
                "credits_added": credits_to_add,
                "new_balance": result["new_balance"]
            }
            
        except stripe.error.StripeError as e:
            return {
                "success": False,
                "error": f"Stripe error: {str(e)}"
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Payment confirmation failed: {str(e)}"
            }
    
    def get_user_credits(self, user_id: str) -> int:
        """
        Get user's current credit balance
        
        Args:
            user_id: User ID
            
        Returns:
            Current credit balance
        """
        try:
            user_credits = self.db.query(UserCredits).filter(
                UserCredits.user_id == user_id
            ).first()
            
            if not user_credits:
                # Create initial credit record with 0 balance
                user_credits = UserCredits(
                    user_id=user_id,
                    balance=0
                )
                self.db.add(user_credits)
                self.db.commit()
                return 0
            
            return user_credits.balance
            
        except Exception as e:
            raise Exception(f"Failed to get user credits: {str(e)}")
    
    def _add_credits(self, user_id: str, amount: int, transaction_type: str, 
                    stripe_payment_intent_id: Optional[str] = None,
                    description: str = "", metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Add credits to user account and create transaction record
        
        Args:
            user_id: User ID
            amount: Credits to add (positive integer)
            transaction_type: Type of transaction
            stripe_payment_intent_id: Stripe payment intent ID (if applicable)
            description: Transaction description
            metadata: Additional transaction metadata
            
        Returns:
            Dict containing new_balance
        """
        try:
            # Get or create user credits record
            user_credits = self.db.query(UserCredits).filter(
                UserCredits.user_id == user_id
            ).first()
            
            if not user_credits:
                user_credits = UserCredits(
                    user_id=user_id,
                    balance=0
                )
                self.db.add(user_credits)
            
            # Update balance
            user_credits.balance += amount
            user_credits.updated_at = datetime.utcnow()
            
            # Create transaction record
            transaction = CreditTransaction(
                id=f"txn_{uuid.uuid4().hex[:16]}",
                user_id=user_id,
                amount=amount,
                transaction_type=transaction_type,
                stripe_payment_intent_id=stripe_payment_intent_id,
                description=description,
                transaction_metadata=metadata or {}
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            return {
                "new_balance": user_credits.balance
            }
            
        except Exception as e:
            self.db.rollback()
            raise Exception(f"Failed to add credits: {str(e)}")
    
    def deduct_credits(self, user_id: str, amount: int, transaction_type: str,
                      description: str = "", metadata: Optional[Dict] = None) -> Dict[str, Any]:
        """
        Deduct credits from user account and create transaction record
        
        Args:
            user_id: User ID
            amount: Credits to deduct (positive integer)
            transaction_type: Type of transaction
            description: Transaction description
            metadata: Additional transaction metadata
            
        Returns:
            Dict containing success status and new_balance
        """
        try:
            # Get user credits
            user_credits = self.db.query(UserCredits).filter(
                UserCredits.user_id == user_id
            ).first()
            
            if not user_credits:
                return {
                    "success": False,
                    "error": "User has no credit account"
                }
            
            # Check if user has sufficient credits
            if user_credits.balance < amount:
                return {
                    "success": False,
                    "error": "Insufficient credits",
                    "current_balance": user_credits.balance,
                    "required": amount
                }
            
            # Update balance
            user_credits.balance -= amount
            user_credits.updated_at = datetime.utcnow()
            
            # Create transaction record (negative amount for deduction)
            transaction = CreditTransaction(
                id=f"txn_{uuid.uuid4().hex[:16]}",
                user_id=user_id,
                amount=-amount,  # Negative for deduction
                transaction_type=transaction_type,
                description=description,
                transaction_metadata=metadata or {}
            )
            
            self.db.add(transaction)
            self.db.commit()
            
            return {
                "success": True,
                "new_balance": user_credits.balance
            }
            
        except Exception as e:
            self.db.rollback()
            return {
                "success": False,
                "error": f"Failed to deduct credits: {str(e)}"
            }
    
    def get_credit_transactions(self, user_id: str, limit: int = 50, 
                              offset: int = 0) -> List[CreditTransactionResponse]:
        """
        Get user's credit transaction history
        
        Args:
            user_id: User ID
            limit: Maximum number of transactions to return
            offset: Number of transactions to skip
            
        Returns:
            List of credit transactions
        """
        try:
            transactions = self.db.query(CreditTransaction).filter(
                CreditTransaction.user_id == user_id
            ).order_by(CreditTransaction.created_at.desc()).offset(offset).limit(limit).all()
            
            return [
                CreditTransactionResponse(
                    id=txn.id,
                    amount=txn.amount,
                    transaction_type=txn.transaction_type,
                    description=txn.description,
                    created_at=txn.created_at,
                    stripe_payment_intent_id=txn.stripe_payment_intent_id
                )
                for txn in transactions
            ]
            
        except Exception as e:
            raise Exception(f"Failed to get credit transactions: {str(e)}")
    
    def calculate_job_cost(self, languages: List[str], duration: int) -> Dict[str, Any]:
        """
        Calculate the credit cost for a dubbing job
        
        Args:
            languages: List of target language codes
            duration: Voice track duration in seconds
            
        Returns:
            Dict containing estimated cost, breakdown, and details
        """
        try:
            total_cost = 0
            breakdown = {}
            
            for language in languages:
                # Determine language classification
                language_class = self._classify_language(language)
                multiplier = CREDIT_RATES["language_multiplier"][language_class]
                
                # Calculate cost for this language
                language_cost = int(duration * CREDIT_RATES["base_rate"] * multiplier)
                total_cost += language_cost
                
                breakdown[language] = {
                    "duration": duration,
                    "rate_per_second": CREDIT_RATES["base_rate"] * multiplier,
                    "cost": language_cost,
                    "classification": language_class
                }
            
            return {
                "estimated_cost": total_cost,
                "languages": languages,
                "duration": duration,
                "breakdown": breakdown
            }
            
        except Exception as e:
            raise Exception(f"Failed to calculate job cost: {str(e)}")
    
    def _classify_language(self, language_code: str) -> str:
        """
        Classify a language code into pricing tier
        
        Args:
            language_code: Language code (e.g., 'en', 'es')
            
        Returns:
            Classification: 'common', 'uncommon', or 'rare'
        """
        if language_code in LANGUAGE_CLASSIFICATION["common"]:
            return "common"
        elif language_code in LANGUAGE_CLASSIFICATION["uncommon"]:
            return "uncommon"
        else:
            return "rare"
    
    def can_afford_job(self, user_id: str, languages: List[str], duration: int) -> Dict[str, Any]:
        """
        Check if user can afford a dubbing job
        
        Args:
            user_id: User ID
            languages: List of target language codes
            duration: Voice track duration in seconds
            
        Returns:
            Dict containing affordability status and details
        """
        try:
            current_balance = self.get_user_credits(user_id)
            cost_calculation = self.calculate_job_cost(languages, duration)
            estimated_cost = cost_calculation["estimated_cost"]
            
            return {
                "can_afford": current_balance >= estimated_cost,
                "current_balance": current_balance,
                "estimated_cost": estimated_cost,
                "shortfall": max(0, estimated_cost - current_balance),
                "cost_breakdown": cost_calculation["breakdown"]
            }
            
        except Exception as e:
            raise Exception(f"Failed to check job affordability: {str(e)}")
    
    def process_job_payment(self, user_id: str, languages: List[str], duration: int,
                           job_id: str) -> Dict[str, Any]:
        """
        Process payment for a dubbing job
        
        Args:
            user_id: User ID
            languages: List of target language codes
            duration: Voice track duration in seconds
            job_id: Job ID for tracking
            
        Returns:
            Dict containing payment processing result
        """
        try:
            # Calculate job cost
            cost_calculation = self.calculate_job_cost(languages, duration)
            estimated_cost = cost_calculation["estimated_cost"]
            
            # Check affordability
            affordability = self.can_afford_job(user_id, languages, duration)
            if not affordability["can_afford"]:
                return {
                    "success": False,
                    "error": "Insufficient credits",
                    "current_balance": affordability["current_balance"],
                    "required": estimated_cost,
                    "shortfall": affordability["shortfall"]
                }
            
            # Deduct credits
            result = self.deduct_credits(
                user_id=user_id,
                amount=estimated_cost,
                transaction_type="job_consumption",
                description=f"Job payment - {job_id}",
                metadata={
                    "job_id": job_id,
                    "languages": languages,
                    "duration": duration,
                    "cost_breakdown": cost_calculation["breakdown"]
                }
            )
            
            if not result["success"]:
                return result
            
            return {
                "success": True,
                "credits_deducted": estimated_cost,
                "new_balance": result["new_balance"],
                "cost_breakdown": cost_calculation["breakdown"]
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": f"Job payment processing failed: {str(e)}"
            }
