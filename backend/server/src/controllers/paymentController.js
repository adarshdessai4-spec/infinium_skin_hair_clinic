const { createPaymentLink } = require('../services/paymentService');

const parseAmountToPaise = (rawValue) => {
  if (typeof rawValue === 'number') {
    return Math.round(rawValue * 100);
  }
  if (!rawValue) {
    return null;
  }
  const normalized = rawValue.toString().replace(/[^0-9.]/g, '');
  if (!normalized) {
    return null;
  }
  const parsed = parseFloat(normalized);
  if (Number.isNaN(parsed)) {
    return null;
  }
  return Math.round(parsed * 100);
};

const createPlanPaymentLink = async (req, res) => {
  try {
    const { totalAmount, amount, customer = {}, items = [], successRedirect } = req.body || {};
    const resolvedAmount = parseAmountToPaise(totalAmount ?? amount);
    if (!resolvedAmount || resolvedAmount <= 0) {
      return res.status(400).json({ message: 'A valid total amount is required.' });
    }

    const link = await createPaymentLink({
      amount: resolvedAmount,
      customer,
      items,
      successRedirect,
    });

    return res.json({
      id: link.id,
      status: link.status,
      shortUrl: link.short_url,
      paymentUrl: link.short_url || link.long_url,
    });
  } catch (error) {
    console.error('Payment link error:', error.message);
    if (/Razorpay credentials/i.test(error.message)) {
      return res.status(500).json({
        message: 'Payment gateway is not configured. Please set RAZORPAY credentials.',
      });
    }
    return res.status(500).json({
      message: 'Unable to create payment link at the moment. Please try again later.',
    });
  }
};

module.exports = {
  createPlanPaymentLink,
};
