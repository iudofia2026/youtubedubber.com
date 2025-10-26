# Payment Components

This directory contains all the payment-related components for the YT Dubber application.

## Components

### PaymentForm.tsx
- Stripe Elements integration for secure card payments
- Handles payment processing with error handling
- Includes card validation and security features

### CreditBalance.tsx
- Displays user's current credit balance
- Shows credit status (High/Medium/Low)
- Includes estimated video count and cost per video
- Optional "Add Credits" button

### BillingHistory.tsx
- Transaction history with filtering and search
- Supports different transaction types (purchase, usage, refund)
- Download invoice and view details functionality
- Responsive design with status indicators

### PricingCard.tsx
- Enhanced pricing cards with payment integration
- Support for popular and recommended badges
- Real-time pricing display with per-credit calculations
- Integrated purchase buttons

## Usage

```tsx
import { PaymentForm, CreditBalance, BillingHistory, PricingCard } from '@/components/payment';

// Credit balance display
<CreditBalance 
  balance={150} 
  onAddCredits={() => setShowPaymentForm(true)} 
/>

// Pricing card with payment
<PricingCard
  title="Creator Pack"
  price={2900} // $29.00 in cents
  credits={50}
  description="Great value for regular creators"
  features={['50 dubbing credits', 'Premium voice quality']}
  isPopular={true}
  onPurchase={handlePurchase}
  isLoading={false}
/>

// Transaction history
<BillingHistory
  transactions={transactions}
  onDownloadInvoice={handleDownloadInvoice}
  onViewDetails={handleViewDetails}
/>
```

## Environment Variables

Make sure to set up the following environment variables:

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Dependencies

- `@stripe/stripe-js` - Stripe JavaScript SDK
- `@stripe/react-stripe-js` - React components for Stripe
- `stripe` - Server-side Stripe SDK
- `@radix-ui/react-tabs` - Tab component for billing page

## Integration Notes

1. **Backend Integration**: The payment components expect backend endpoints for:
   - Creating payment intents
   - Processing payments
   - Updating user credits
   - Fetching transaction history

2. **Error Handling**: All components include comprehensive error handling for:
   - Network failures
   - Payment failures
   - Validation errors

3. **Security**: Card details are handled securely through Stripe Elements, never touching your servers.

4. **Responsive Design**: All components are fully responsive and work on mobile and desktop.