const Razorpay = require('razorpay');

let razorpayClient = null;

const normalizeContact = (value) => {
  if (!value) return undefined;
  const digits = value.toString().replace(/\D/g, '');
  if (!digits) return undefined;
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.startsWith('91') && digits.length === 12) {
    return `+${digits}`;
  }
  return digits.startsWith('+') ? digits : `+${digits}`;
};

const sanitizedNotes = (notes = {}) => {
  const clean = {};
  Object.entries(notes).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }
    if (typeof value === 'string') {
      clean[key] = value.slice(0, 500);
    } else {
      clean[key] = JSON.stringify(value).slice(0, 500);
    }
  });
  return clean;
};

const ensureClient = () => {
  if (razorpayClient) {
    return razorpayClient;
  }
  const { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET } = process.env;
  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    throw new Error('Razorpay credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.');
  }
  razorpayClient = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });
  return razorpayClient;
};

const createPaymentLink = async ({ amount, customer = {}, items = [], successRedirect, notes = {} }) => {
  const client = ensureClient();
  const payload = {
    amount,
    currency: 'INR',
    accept_partial: false,
    description: 'Infinium Hair Care Plan',
    reference_id: `inf-plan-${Date.now()}`,
    reminder_enable: true,
    notes: sanitizedNotes({
      stage: customer.stage,
      items: Array.isArray(items) ? items.join('; ') : undefined,
      ...notes,
    }),
    customer: {
      name: customer.name || 'Infinium Member',
      contact: normalizeContact(customer.contact),
      email: customer.email,
    },
    notify: {
      sms: Boolean(customer.contact),
      email: Boolean(customer.email),
    },
  };

  if (successRedirect) {
    payload.callback_url = successRedirect;
    payload.callback_method = 'get';
  }

  const link = await client.paymentLink.create(payload);
  return link;
};

module.exports = {
  createPaymentLink,
};
