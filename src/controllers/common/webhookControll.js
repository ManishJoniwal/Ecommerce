const stripe = require("../../utils/stripe");
const sendResponse = require("../../utils/sendResponse");
const Order = require("../../models/order");
const Transaction = require("../../models/transaction");

/**
 * Main Stripe webhook handler
 * Handles all Stripe webhook events for payment processing
 */
const handleStripeWebhook = async (req, res) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    // Debug logging for webhook verification
    console.log("Webhook received:");
    console.log("- Content-Type:", req.headers["content-type"]);
    console.log("- Body type:", typeof req.body);
    console.log("- Body is Buffer:", Buffer.isBuffer(req.body));
    console.log("- Signature present:", !!sig);
    console.log("- Endpoint secret configured:", !!endpointSecret);

    if (!sig) {
      console.error("Missing Stripe signature header");
      return res.status(400).send("Missing Stripe signature header");
    }

    if (!endpointSecret) {
      console.error("Missing STRIPE_WEBHOOK_SECRET environment variable");
      return res.status(500).send("Webhook endpoint secret not configured");
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      console.log(
        "Webhook signature verified successfully for event:",
        event.type
      );
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      console.error("Request body type:", typeof req.body);
      console.error("Request body is Buffer:", Buffer.isBuffer(req.body));
      console.error("Request headers:", {
        "content-type": req.headers["content-type"],
        "stripe-signature": sig ? "present" : "missing",
      });
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        await handleCheckoutCompleted(session);
        break;
      }
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        await handleAsyncPaymentSucceeded(session);
        break;
      }
      case "checkout.session.async_payment_failed": {
        const session = event.data.object;
        await handleAsyncPaymentFailed(session);
        break;
      }
      case "checkout.session.expired": {
        const session = event.data.object;
        await handleCheckoutExpired(session);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

async function handleCheckoutCompleted(session) {
  console.log("Checkout completed:", session.id);

  const { orderId, transactionId } = session.metadata;

  await Order.findByIdAndUpdate(orderId, {
    payment_status: "completed",
    status: "pending",
  });

  await Transaction.findByIdAndUpdate(transactionId, {
    status: "Completed",
    transactionId: session.payment_intent,
  });
}

async function handleAsyncPaymentSucceeded(session) {
  console.log("Async payment succeeded:", session.id);

  const { orderId, transactionId } = session.metadata;

  await Order.findByIdAndUpdate(orderId, {
    payment_status: "completed",
    status: "pending",
  });

  await Transaction.findByIdAndUpdate(transactionId, {
    status: "Completed",
    transactionId: session.payment_intent,
  });
}

async function handleAsyncPaymentFailed(session) {
  console.log("Async payment failed:", session.id);

  const { orderId, transactionId } = session.metadata;

  await Order.findByIdAndUpdate(orderId, {
    payment_status: "failed",
    status: "cancelled",
  });

  await Transaction.findByIdAndUpdate(transactionId, {
    status: "Failed",
    failureReason: "Payment failed",
  });
}

async function handleCheckoutExpired(session) {
  console.log("Checkout expired:", session.id);

  const { orderId, transactionId } = session.metadata;

  await Order.findByIdAndUpdate(orderId, {
    payment_status: "failed",
    status: "cancelled",
  });

  await Transaction.findByIdAndUpdate(transactionId, {
    status: "Failed",
    failureReason: "Checkout session expired",
  });
}

module.exports = {handleStripeWebhook};
