import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import axiosInstance from "@/utils/axiosConfig";

// Extend Window interface for Cashfree
declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => {
      checkout: (options: {
        paymentSessionId: string;
        redirectTarget?: string;
      }) => Promise<{
        error?: { message: string };
        redirect?: boolean;
        paymentDetails?: any;
      }>;
    };
  }
}

export const usePaymentProcessing = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const processPayment = async (
    items: any[],
    shippingAddress: any,
    paymentMethod: "cod" | "online",
    totals: { itemsTotal: number; deliveryCharge: number; totalAmount: number },
    cartType: "cart" | "hamper" = "cart"
  ) => {
    try {
      setCheckoutLoading(true);

      const orderData = {
        userId: user._id,
        items: items,
        shippingAddress: {
          street: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          pincode: shippingAddress.pinCode,
          country: "India",
        },
        itemsTotal: totals.itemsTotal,
        deliveryCharge: totals.deliveryCharge,
        totalAmount: totals.totalAmount,
        paymentMethod: paymentMethod,
        Contact_number: shippingAddress.phone,
        user_email: user.email,

        // ✅ ADD THIS LINE - Identifies hamper vs regular cart orders
        isCustomHamper: cartType === "hamper",
      };

      console.log("📤 Sending order data:", orderData);
      const response = await axiosInstance.post("/cashfree/create", orderData);

      if (response.data.success) {
        if (paymentMethod === "cod") {
          // COD flow remains the same
          if (cartType === "cart") {
            await axiosInstance.delete("/cart/clear");
          } else if (cartType === "hamper") {
            await axiosInstance.delete("/hamper/clear");
          }

          toast({
            title: "Order Placed Successfully! 🎉",
            description:
              "Your order has been placed. Check 'My Orders' to track it.",
          });
          navigate("/orders");
          return true;
        } else {
          // ✅ Enhanced online payment handling
          if (!window.Cashfree) {
            toast({
              title: "Payment Error",
              description: "Payment system is loading. Please try again.",
              variant: "destructive",
            });
            return false;
          }

          const cashfree = window.Cashfree({ mode: "sandbox" });
          const { cashfreeSession, orderId, internalOrderId } = response.data;

          // Store session data
          sessionStorage.setItem("orderId", orderId);
          sessionStorage.setItem("internalOrderId", internalOrderId);
          sessionStorage.setItem("paymentMethod", paymentMethod);
          sessionStorage.setItem("cartType", cartType);

          console.log(
            "🔑 Starting payment with session ID:",
            cashfreeSession.payment_session_id
          );

          const result = await cashfree.checkout({
            paymentSessionId: cashfreeSession.payment_session_id,
            redirectTarget: "_self",
          });

          console.log("💳 Cashfree checkout result:", result);

          // ✅ Handle all possible results
          if (result.redirect) {
            // Payment initiated successfully - redirect to callback for verification
            console.log("✅ Payment initiated - redirecting to verification");
            navigate("/payment/callback");
            return true;
          } else if (result.error) {
            // Direct error from Cashfree SDK
            console.error("❌ Cashfree checkout error:", result.error);
            toast({
              title: "Payment Failed",
              description:
                result.error.message || "Payment could not be processed",
              variant: "destructive",
            });
            return false;
          } else {
            // ✅ No redirect and no error - user likely cancelled or payment failed
            console.warn(
              "⚠️ Payment completed without redirect - checking status"
            );

            // Brief delay then check payment status
            setTimeout(async () => {
              try {
                const verifyRes = await axiosInstance.post("/cashfree/verify", {
                  orderId,
                  internalOrderId,
                });

                if (
                  verifyRes.data.success &&
                  verifyRes.data.paymentStatus === "SUCCESS"
                ) {
                  // Payment actually succeeded
                  navigate("/payment/callback");
                } else {
                  // Payment failed or cancelled
                  toast({
                    title: "Payment Not Completed",
                    description:
                      "Your payment was not successful. You can retry with a different payment method.",
                    variant: "destructive",
                    duration: 8000,
                  });
                }
              } catch (error) {
                console.error("Error verifying payment:", error);
                toast({
                  title: "Payment Status Unknown",
                  description:
                    "Please check your order status or contact support if amount was debited.",
                  variant: "destructive",
                });
              }
            }, 2000);

            return false;
          }
        }
      } else {
        // Order creation failed
        throw new Error(response.data.message || "Failed to create order");
      }
    } catch (error: any) {
      console.error("Payment processing error:", error);
      toast({
        title: "Payment Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to process payment.",
        variant: "destructive",
      });
      return false;
    } finally {
      setCheckoutLoading(false);
    }
  };

  return {
    checkoutLoading,
    processPayment,
  };
};
