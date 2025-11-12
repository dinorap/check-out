import { ref, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

export function usePayment() {
  const router = useRouter();

  const newBill = ref({
    code: "BG000002",
    end_user_id: "BDTTEST002",
    end_user_name: "Nguyễn",
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
  const showQrModal = ref(false);
  const isCreating = ref(false);
  const hasCreatedBill = ref(false);
  const lastBillGroup = ref(null);
  const token = ref(null);

  let pollingTimer = null;
  const POLLING_INTERVAL = 3000;

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
        newBill.value.status = 7;
        newDetailList.value.forEach((detail) => {
          detail.status = 7;
        });

        stopPolling();
        showQrModal.value = false;
        await router.push("/payment-success");
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra bill:", err);
      if (err?.status === 401 || err?.response?.status === 401) {
        token.value = null;
      }
    }
  }

  async function createBill() {
    if (isCreating.value) return;
    isCreating.value = true;

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

        await $fetch("https://bankapi.bigdatatech.vn/data/BillDetail/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: detailBody,
        });
      }

      hasCreatedBill.value = true;
      alert("Tạo bill thành công!");
    } catch (err) {
      console.error("Lỗi khi tạo bill:", err);
      alert("Tạo bill thất bại: " + (err?.data?.detail || err?.message));
    } finally {
      isCreating.value = false;
    }
  }

  async function getQRCode() {
    if (!hasCreatedBill.value) {
      alert("Vui lòng tạo bill trước khi quét QR.");
      return;
    }

    if (isQrLoading.value) return;
    isQrLoading.value = true;

    try {
      const payload = {
        service_code: "genvietqrcode",
        payload: {
          serviceId: "BDT001",
          code: newBill.value.end_user_id,
          name: "Bigdata",
          amount: newDetailList.value[0].amount
        },
      };

      const res = await $fetch("https://bankapi.bigdatatech.vn/bidv/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
      });

      if (res?.vietQRImage) {
        qrImage.value = `data:image/png;base64,${res.vietQRImage}`;
        showQrModal.value = true;
        startPolling(newBill.value.end_user_id);
      } else {
        alert("API không trả về QR. Thử lại sau.");
      }
    } catch (err) {
      console.error("Lỗi khi tạo QR:", err);
    } finally {
      isQrLoading.value = false;
    }
  }

  function closeQrModal() {
    stopPolling();
    showQrModal.value = false;
  }

  onBeforeUnmount(() => {
    stopPolling();
  });

  return {
    newBill,
    newDetailList,
    qrImage,
    isQrLoading,
    showQrModal,
    isCreating,
    hasCreatedBill,
    lastBillGroup,
    checkPaymentStatus,
    createBill,
    getQRCode,
    closeQrModal,
  };
}

