#!/usr/bin/env python3
"""
Script to create a test user with credits for development/testing
"""
import asyncio
import uuid
from datetime import datetime
import sys
import os

# Add the app directory to the path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app.config import settings
from app.models import User, UserCredits, CreditTransaction
from app.database import engine, SessionLocal, Base

def create_test_user(email: str = "test@ytdubber.com", credits: int = 10000):
    """Create a test user with specified credits"""

    if not engine:
        print("❌ No database connection available. Using Supabase REST API mode.")
        print("💡 Try using the Supabase dashboard to create the user manually.")
        return False

    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)

    # Create session
    db = SessionLocal()

    try:
        user_id = str(uuid.uuid4())

        # Check if user already exists
        existing_user = db.query(User).filter(User.email == email).first()
        if existing_user:
            print(f"⚠️  User {email} already exists with ID: {existing_user.id}")
            user_id = existing_user.id
        else:
            # Create new user
            new_user = User(
                id=user_id,
                email=email,
                created_at=datetime.utcnow()
            )
            db.add(new_user)
            print(f"✅ Created user: {email} with ID: {user_id}")

        # Check if credits already exist
        existing_credits = db.query(UserCredits).filter(UserCredits.user_id == user_id).first()
        if existing_credits:
            print(f"⚠️  User already has {existing_credits.balance} credits")
            existing_credits.balance = credits
            existing_credits.updated_at = datetime.utcnow()
            print(f"✅ Updated credit balance to {credits}")
        else:
            # Create user credits
            user_credits = UserCredits(
                user_id=user_id,
                balance=credits,
                created_at=datetime.utcnow()
            )
            db.add(user_credits)
            print(f"✅ Added {credits} credits to user account")

        # Create credit transaction record
        transaction = CreditTransaction(
            id=str(uuid.uuid4()),
            user_id=user_id,
            amount=credits,
            transaction_type="bonus",
            description=f"Development testing credits - {credits} credits added",
            transaction_metadata={"source": "dev_script", "created_by": "admin"},
            created_at=datetime.utcnow()
        )
        db.add(transaction)

        # Commit changes
        db.commit()

        print(f"\n🎉 Successfully created test account:")
        print(f"   📧 Email: {email}")
        print(f"   🆔 User ID: {user_id}")
        print(f"   💰 Credits: {credits}")
        print(f"   📊 Transaction Type: bonus")

        return True

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating test user: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description="Create test user with credits")
    parser.add_argument("--email", default="test@ytdubber.com", help="User email")
    parser.add_argument("--credits", type=int, default=10000, help="Number of credits to add")

    args = parser.parse_args()

    print(f"🚀 Creating test user with {args.credits} credits...")
    print(f"📧 Email: {args.email}")
    print(f"🗄️  Database URL: {settings.database_url}")

    success = create_test_user(args.email, args.credits)

    if success:
        print("\n✅ Test user created successfully!")
        print("\nYou can now use this account to test dubbing features.")
    else:
        print("\n❌ Failed to create test user. Check the errors above.")