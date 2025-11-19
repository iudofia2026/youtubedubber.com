"""
Account management API endpoints
Includes profile management and GDPR-compliant account deletion
"""
from fastapi import APIRouter, Depends, HTTPException, status, Request
from app.auth import get_current_user
from app.schemas import (
    UserResponse,
    AccountDeletionRequest,
    AccountDeletionConfirmationRequest,
    AccountDeletionInitiationResponse,
    AccountDeletionResponse,
    BackendErrorResponse
)
from app.services.account_deletion_service import AccountDeletionService
from app.services.supabase_db_service import SupabaseDBService
import logging

logger = logging.getLogger(__name__)

router = APIRouter()


@router.post(
    "/delete/initiate",
    response_model=AccountDeletionInitiationResponse,
    status_code=status.HTTP_200_OK,
    summary="Initiate account deletion",
    description="""
    **GDPR-Compliant Account Deletion - Step 1: Initiation**

    Initiates the account deletion process and returns a summary of data that will be deleted.

    - User must type 'DELETE MY ACCOUNT' exactly to confirm
    - Returns a deletion token valid for 10 minutes
    - Provides a detailed summary of all data to be deleted
    - Optional: User can provide reason and feedback

    **Important**: This is a two-step process for safety. After initiation, you must call
    `/account/delete/confirm` with the deletion token to complete the deletion.

    **Data Deleted**:
    - User account and profile
    - All dubbing jobs and their results
    - All language tasks and generated files
    - All credit transactions and balance
    - All uploaded and generated files in storage
    - Job events and artifacts

    **Retained for Compliance**:
    - Audit log of the deletion (user ID, email, timestamp, data summary)
    - This is required for GDPR compliance and cannot be deleted
    """
)
async def initiate_account_deletion(
    deletion_request: AccountDeletionRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Initiate account deletion process
    """
    try:
        deletion_service = AccountDeletionService()

        # Extract IP address and user agent
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get('user-agent')

        result = await deletion_service.initiate_deletion(
            user_id=current_user.id,
            user_email=current_user.email,
            deletion_request=deletion_request,
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Log the initiation attempt
        db_service = SupabaseDBService()
        db_service.create_audit_log({
            'event_type': 'account_deletion_initiated',
            'status': 'success',
            'severity': 'warning',
            'user_id': current_user.id,
            'email': current_user.email,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'resource_type': 'user',
            'resource_id': current_user.id,
            'message': f"User initiated account deletion: {current_user.email}",
            'metadata': {
                'reason': deletion_request.reason,
                'data_to_delete': result.dataToBeDeleted
            }
        })

        return result

    except ValueError as e:
        logger.warning(f"Invalid account deletion initiation request: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error initiating account deletion: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initiate account deletion"
        )


@router.post(
    "/delete/confirm",
    response_model=AccountDeletionResponse,
    status_code=status.HTTP_200_OK,
    summary="Confirm and complete account deletion",
    description="""
    **GDPR-Compliant Account Deletion - Step 2: Confirmation**

    Permanently deletes the user account and all associated data.

    **Requirements**:
    - Valid deletion token from initiation step
    - Token must not be expired (10 minute validity)
    - finalConfirmation must be true

    **This action is IRREVERSIBLE**:
    - All data will be permanently deleted
    - User will be logged out immediately
    - Account cannot be recovered
    - An audit log will be created for compliance

    **After Deletion**:
    - User session will be invalidated
    - All API requests with user's token will fail
    - User can create a new account with the same email if desired
    """
)
async def confirm_account_deletion(
    confirmation_request: AccountDeletionConfirmationRequest,
    request: Request,
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Complete account deletion process
    """
    try:
        deletion_service = AccountDeletionService()

        # Log the confirmation attempt before deletion
        db_service = SupabaseDBService()
        ip_address = request.client.host if request.client else None
        user_agent = request.headers.get('user-agent')

        db_service.create_audit_log({
            'event_type': 'account_deletion_confirmed',
            'status': 'in_progress',
            'severity': 'critical',
            'user_id': current_user.id,
            'email': current_user.email,
            'ip_address': ip_address,
            'user_agent': user_agent,
            'resource_type': 'user',
            'resource_id': current_user.id,
            'message': f"User confirmed account deletion: {current_user.email}",
            'metadata': {
                'deletion_token': confirmation_request.deletionToken[:20] + '...'
            }
        })

        # Perform the deletion
        result = await deletion_service.confirm_deletion(
            user_id=current_user.id,
            confirmation_request=confirmation_request
        )

        logger.info(f"Successfully deleted account for user {current_user.id}")

        return result

    except ValueError as e:
        logger.warning(f"Invalid account deletion confirmation: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error confirming account deletion: {e}")

        # Log the failure
        try:
            db_service = SupabaseDBService()
            db_service.create_audit_log({
                'event_type': 'account_deletion_failed',
                'status': 'failure',
                'severity': 'error',
                'user_id': current_user.id,
                'email': current_user.email,
                'resource_type': 'user',
                'resource_id': current_user.id,
                'message': f"Account deletion failed: {current_user.email}",
                'error': str(e)
            })
        except:
            pass

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete account deletion"
        )


@router.get(
    "/info",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user information",
    description="Returns the current authenticated user's account information"
)
async def get_account_info(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get current user account information
    """
    return current_user


@router.get(
    "/data-summary",
    status_code=status.HTTP_200_OK,
    summary="Get summary of user data",
    description="""
    Returns a summary of all data associated with the user account.

    Useful for:
    - GDPR data access requests
    - Understanding account usage
    - Previewing what will be deleted before account deletion
    """
)
async def get_data_summary(
    current_user: UserResponse = Depends(get_current_user)
):
    """
    Get summary of all user data
    """
    try:
        db_service = SupabaseDBService()
        data_counts = db_service.count_user_data(current_user.id)

        # Estimate storage files
        deletion_service = AccountDeletionService()
        storage_file_count = deletion_service._estimate_storage_files(current_user.id, data_counts)
        data_counts['storageFiles'] = storage_file_count

        return {
            'userId': current_user.id,
            'email': current_user.email,
            'dataSummary': data_counts,
            'totalItems': sum(data_counts.values())
        }

    except Exception as e:
        logger.error(f"Error getting data summary: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve data summary"
        )
