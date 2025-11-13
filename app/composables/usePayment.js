import { ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

export function usePayment() {
  const router = useRouter();

  const newBill = ref({
    code: "",
    end_user_id: "",
    end_user_name: "MPhuong",
    end_user_addr: "Hà Nội, Việt Nam",
    merchant: 3,
    customer: 3,
    service_package: 1,
    type: 2,
    status: 1,
  });

  const newDetailList = ref([
    {
      item_name: "Giày New Balance 530 Natural Indigo (GS)",
      amount: 2090000,
      remark: "Thanh toán đơn hàng test",
      billing_month: 11,
      billing_year: 2025,
      status: 1,
    },
    
  ]);

  const qrImage = ref(null);
  const isQrLoading = ref(false);
  const showPaymentModal = ref(false);
  const isCreating = ref(false);
  const isCancelling = ref(false);
  const countdown = ref(900);
  const hasCreatedBill = ref(false);
  const lastBillGroup = ref(null);
  const token = ref(null);
  const createdDetails = ref([]);

  let pollingTimer = null;
  async function updateBillStatusViaApi(statusId) {
    const billCode = lastBillGroup.value?.code || newBill.value.code;
    if (!billCode) return;

    // Lấy token nếu chưa có
    if (!token.value) {
      try {
        await getAccessToken();
      } catch (err) {
        console.error("Không thể lấy token:", err);
        throw err;
      }
    }

    try {
      await $fetch("https://bankapi.bigdatatech.vn/api/update-bill-status", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.value}`,
        },
        body: {
          bill_group_code: billCode,
          status_id: statusId,
        },
      });
    } catch (err) {
      console.error("Lỗi khi gọi update-bill-status:", err);
      throw err;
    }
  }
  let countdownTimer = null;
  const POLLING_INTERVAL = 3000;

  function regenerateIdentifiers() {
    newBill.value.code = "BG" + Math.floor(100000 + Math.random() * 900000);
    newBill.value.end_user_id = "BDT" + Math.floor(100000 + Math.random() * 900000);
  }

  function resetLocalBill(status = 1) {
    newBill.value.status = status;
    newDetailList.value.forEach((detail) => {
      detail.status = status;
    });
  }

  regenerateIdentifiers();

  async function getAccessToken() {
    try {
      const res = await $fetch("https://bankapi.bigdatatech.vn/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: { username: "Develop", password: "123456789" },
      });
      token.value = res?.access || null;
    } catch (err) {
      token.value = null;
      console.error("Lỗi khi lấy access token:", err);
      alert("Không thể xác thực để kiểm tra bill.");
      throw err;
    }
  }

  function startPolling(customerId = newBill.value.end_user_id) {
    if (!customerId) return;

    stopPolling();
    pollingTimer = setInterval(() => {
      checkPaymentStatus(customerId);
    }, POLLING_INTERVAL);

    checkPaymentStatus(customerId);
  }

  function stopPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
      pollingTimer = null;
    }
  }

  function resetCountdown() {
    countdown.value = 15 * 60;
  }

  function startCountdown() {
    stopCountdown();
    resetCountdown();

    countdownTimer = setInterval(() => {
      countdown.value -= 1;
      if (countdown.value <= 0) {
        stopCountdown();
        handleCountdownExpired();
      }
    }, 1000);
  }

  async function handleCountdownExpired() {
    try {
      await updateBillStatusViaApi(2);
      alert("Giao dịch đã hết hạn. Đơn hàng đã được hủy.");

      stopPolling();
      qrImage.value = null;
      showPaymentModal.value = false;
      hasCreatedBill.value = false;
      lastBillGroup.value = null;
      createdDetails.value = [];
      regenerateIdentifiers();
      resetLocalBill(1);
    } catch (err) {
      console.error("Lỗi khi hủy đơn hàng do hết hạn:", err);
      alert("Giao dịch đã hết hạn nhưng không thể cập nhật trạng thái. Vui lòng thử lại.");
    }
  }

  function stopCountdown() {
    if (countdownTimer) {
      clearInterval(countdownTimer);
      countdownTimer = null;
    }
  }

  async function checkPaymentStatus(customerId = newBill.value.end_user_id) {
    if (!customerId) return;

    if (!token.value) {
      try {
        await getAccessToken();
      } catch {
        stopPolling();
        return;
      }
    }

    try {
      const res = await $fetch("https://bankapi.bigdatatech.vn/bidv-bigdata/getbill", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: { customer_id: customerId },
      });

      if (res?.result_code === "012") {
        try {
          await updateRemoteStatus(7);
        } finally {
          resetLocalBill(7);
          stopPolling();
          qrImage.value = null;
          showPaymentModal.value = false;
          await router.push("/payment-success");
        }
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra bill:", err);
      if (err?.status === 401 || err?.response?.status === 401) {
        token.value = null;
      }
    }
  }

  async function createBill() {
    if (isCreating.value) return false;
    isCreating.value = true;
    createdDetails.value = [];

    try {
      const billGroupRes = await $fetch("https://bankapi.bigdatatech.vn/data/BillGroup/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          ...newBill.value,
          create_time: new Date().toISOString(),
        },
      });

      lastBillGroup.value = billGroupRes;
      const groupBillId = billGroupRes?.id;
      if (!groupBillId) throw new Error("Không lấy được ID BillGroup");

      if (billGroupRes?.code) {
        newBill.value.code = billGroupRes.code;
      }

      for (const detail of newDetailList.value) {
        const detailBody = {
          ...detail,

          group_bill: groupBillId,
          code: billGroupRes?.code || newBill.value.code,
        };

        const detailRes = await $fetch("https://bankapi.bigdatatech.vn/data/BillDetail/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: detailBody,
        });
        if (detailRes?.id) {
          createdDetails.value.push({
            ...detailBody,
            id: detailRes.id,
          });
        }
      }

      hasCreatedBill.value = true;
      return true;
    } catch (err) {
      console.error("Lỗi khi tạo bill:", err);
      alert("Tạo bill thất bại: " + (err?.data?.detail || err?.message));
      return false;
    } finally {
      isCreating.value = false;
    }
  }

  async function getQRCode() {
    if (isQrLoading.value) return false;
    isQrLoading.value = true;
    let success = false;

    try {
      const payload = {
        service_code: "genvietqrcode",
        payload: {
          serviceId: "BDT001",
          code: newBill.value.end_user_id,
          name: "Bigdata",
          amount: newDetailList.value[0].amount,
        },
      };

      const res = await $fetch("https://bankapi.bigdatatech.vn/bidv/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (res?.vietQRImage) {
        qrImage.value = `data:image/png;base64,${res.vietQRImage}`;
        startPolling(newBill.value.end_user_id);
        success = true;
      } else {
        alert("API không trả về QR. Thử lại sau.");
      }
    } catch (err) {
      console.error("Lỗi khi tạo QR:", err);
    } finally {
      isQrLoading.value = false;
    }

    return success;
  }

  function openPaymentModal() {
    resetLocalBill(1);
    showPaymentModal.value = true;
    qrImage.value = null;
    resetCountdown();
  }

  function closePaymentModal() {
    stopPolling();
    stopCountdown();
    showPaymentModal.value = false;
    qrImage.value = null;
  }

  async function payWithQr(options = {}) {
    const { autoStartCountdown = true } = options;

    if (isCreating.value || isQrLoading.value) return false;

    if (!hasCreatedBill.value) {
      const created = await createBill();
      if (!created) return false;
    }

    const generated = await getQRCode();
    if (!generated) return false;

    if (autoStartCountdown) {
      startCountdown();
    }

    return true;
  }

  async function startPaymentWithQr() {
    if (isCreating.value || isQrLoading.value) return false;

    stopPolling();
    stopCountdown();
    hasCreatedBill.value = false;
    lastBillGroup.value = null;
    createdDetails.value = [];
    regenerateIdentifiers();
    resetLocalBill(1);
    qrImage.value = null;
    resetCountdown();

    const success = await payWithQr({ autoStartCountdown: false });
    if (!success) {
      return false;
    }

    showPaymentModal.value = true;
    startCountdown();
    return true;
  }

  async function updateRemoteStatus(status) {
    if (!lastBillGroup.value?.id) return;

    if (status === 2) {
      try {
        await updateBillStatusViaApi(2);
      } catch (err) {
        console.error("Không thể đồng bộ trạng thái qua api/update-bill-status:", err);
      }
    }
  }

  async function cancelPayment() {
    if (isCancelling.value) return;
    isCancelling.value = true;

    stopPolling();
    stopCountdown();

    try {
      await updateBillStatusViaApi(2);
      alert("Đơn hàng đã được hủy.");

      closePaymentModal();
      hasCreatedBill.value = false;
      lastBillGroup.value = null;
      createdDetails.value = [];
      regenerateIdentifiers();
      resetLocalBill(1);
    } catch (err) {
      console.error("Không thể hủy thanh toán:", err);
      alert("Hủy thanh toán thất bại. Vui lòng thử lại.");
    } finally {
      isCancelling.value = false;
    }
  }

  onBeforeUnmount(() => {
    stopPolling();
    stopCountdown();
  });

  return {
    newBill,
    newDetailList,
    qrImage,
    isQrLoading,
    showPaymentModal,
    isCreating,
    isCancelling,
    countdown,
    hasCreatedBill,
    lastBillGroup,
    checkPaymentStatus,
    openPaymentModal,
    closePaymentModal,
    cancelPayment,
    payWithQr,
    startPaymentWithQr,
    createBill,
    getQRCode,
  };
}

