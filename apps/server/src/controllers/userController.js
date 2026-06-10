import { saveBankDetails, getUserByWallet, getUserByUid, loginOrSignupByWallet, createSwapOrder } from '../services/userService.js';

export const getProfile = async (req, res) => {
  try {
    const userUid = req.user?.uid;
    if (!userUid) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const result = await getUserByUid(userUid);

    if (result.success) {
      return res.json({ user: result.user });
    } else {
      return res.status(500).json({ error: 'Failed to fetch profile' });
    }
  } catch (error) {
    console.error('Error in getProfile:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const submitSwapForm = async (req, res) => {
  try {
    const userUid = req.user?.uid; // From JWT (set by userAuth middleware)
    if (!userUid) {
      return res.status(401).json({ error: 'Login required before submitting bank details' });
    }

    const { email, phone, account_no, name, ifsc, tokenAddress, amount, network } = req.body;

    // Basic validation on required fields
    if (!phone || !account_no || !name || !ifsc || !tokenAddress || !amount || !network) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Update profile + save bank details for the existing user
    const bankResult = await saveBankDetails(userUid, { email, phone, account_no, name, ifsc });
    
    if (!bankResult.success) {
      return res.status(500).json({ error: 'Failed to save bank details' });
    }

    // Create the pending swap order
    const swapResult = await createSwapOrder(userUid, { tokenAddress, amount, network });

    if (swapResult.success) {
      return res.status(200).json({ 
        message: 'Order created successfully', 
        orderId: swapResult.orderId 
      });
    } else {
      return res.status(500).json({ error: 'Failed to create swap order' });
    }
  } catch (error) {
    console.error('Error in submitSwapForm:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const walletLogin = async (req, res) => {
  try {
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }

    const result = await loginOrSignupByWallet(address);

    if (result.success) {
      return res.json({ message: 'Login successful', token: result.token, uid: result.uid });
    } else {
      return res.status(500).json({ error: 'Failed to authenticate user' });
    }
  } catch (error) {
    console.error('Error in walletLogin:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
