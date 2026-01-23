-- Remove the dangerous UPDATE policy that allows users to modify their wallet balance
DROP POLICY IF EXISTS "Users can update their own wallet" ON public.wallets;

-- Add a constraint to ensure balance cannot be negative
ALTER TABLE public.wallets ADD CONSTRAINT balance_non_negative CHECK (balance >= 0);

-- Wallet balance should only be modified through server-side functions
-- Create a secure function for wallet operations that can be called from edge functions
CREATE OR REPLACE FUNCTION public.add_wallet_balance(
  _user_id UUID,
  _amount DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow positive amounts for deposits
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  UPDATE wallets 
  SET balance = balance + _amount, updated_at = NOW()
  WHERE user_id = _user_id;
  
  RETURN TRUE;
END;
$$;

-- Create a secure function for processing payments (transfers between users)
CREATE OR REPLACE FUNCTION public.process_wallet_payment(
  _from_user_id UUID,
  _to_user_id UUID,
  _amount DECIMAL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_balance DECIMAL;
BEGIN
  -- Verify the caller is the from_user
  IF auth.uid() != _from_user_id THEN
    RAISE EXCEPTION 'Unauthorized: can only transfer from your own wallet';
  END IF;
  
  -- Only allow positive amounts
  IF _amount <= 0 THEN
    RAISE EXCEPTION 'Amount must be positive';
  END IF;
  
  -- Check sufficient balance
  SELECT balance INTO current_balance FROM wallets WHERE user_id = _from_user_id FOR UPDATE;
  
  IF current_balance IS NULL THEN
    RAISE EXCEPTION 'Wallet not found';
  END IF;
  
  IF current_balance < _amount THEN
    RAISE EXCEPTION 'Insufficient funds';
  END IF;
  
  -- Perform atomic transfer
  UPDATE wallets SET balance = balance - _amount, updated_at = NOW() WHERE user_id = _from_user_id;
  UPDATE wallets SET balance = balance + _amount, updated_at = NOW() WHERE user_id = _to_user_id;
  
  RETURN TRUE;
END;
$$;