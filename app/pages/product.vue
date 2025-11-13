<script setup>
import { ref, computed, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

/* ========== PRODUCT STATE ========== */
const baseSize = ref(31);
const sizes = computed(() =>
  Array.from({ length: 5 }, (_, i) => baseSize.value + i)
);
const selected = ref(baseSize.value);
const activeColor = ref(null);

const colors = [
  {
    name: "Trắng",
    image:
      "https://down-vn.img.susercontent.com/file/sg-11134201-824h7-mf6szgkdtv654f@resize_w450_nl.webp",
  },
  {
    name: "Đen",
    image:
      "https://down-vn.img.susercontent.com/file/sg-11134201-824ii-mf6sz4lkjnyhf4@resize_w450_nl.webp",
  },
  {
    name: "Vàng",
    image:
      "https://down-vn.img.susercontent.com/file/sg-11134201-824h7-mf6szgkdtv654f@resize_w450_nl.webp",
  },
  {
    name: "Xanh",
    image:
      "https://down-vn.img.susercontent.com/file/sg-11134201-824ii-mf6sz4lkjnyhf4@resize_w450_nl.webp",
  },
];
activeColor.value = colors[0];

function selectColor(color) {
  activeColor.value = color;
}
function selectSize(value) {
  selected.value = value;
}

/* ========== BILL DATA ========== */
const newBill = ref({
  code: "BG" + Math.floor(Math.random() * 100000),
  end_user_id: "BDTTEST2",
  end_user_name: "Nguyễn Văn Boss",
  end_user_addr: "Hà Nội, Việt Nam",
  merchant: 3,
  customer: 3,
  service_package: 1,
  type: 2,
  status: 1, // 1 = chưa thanh toán, 7 = đã thanh toán
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
const token = ref(null);

let pollingInterval = null;

/* ========== AUTH TOKEN ========== */
async function getAccessToken() {
  try {
    const res = await $fetch("https://bankapi.bigdatatech.vn/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: { username: "Develop", password: "123456789" },
    });
    token.value = res.access;
  } catch (err) {
    console.error("❌ Lỗi khi lấy token:", err);
    alert("Không thể xác thực với BankAPI.");
  }
}

/* ========== LẤY MÃ QR ========== */
async function getQRCode() {
  if (isQrLoading.value) return;
  isQrLoading.value = true;

  try {
    const payload = {
      service_code: "genvietqrcode",
      payload: {
        serviceId: "BDT001",
        code: newBill.value.end_user_id,
        name: "Bigdata",
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

      // Bắt đầu auto-check mỗi 3s
      startPolling();
    } else {
      alert("API không trả về QR. Thử lại sau.");
    }
  } catch (err) {
    console.error("Lỗi khi tạo QR:", err);
  } finally {
    isQrLoading.value = false;
  }
}

/* ========== BẮT ĐẦU AUTO POLLING ========== */
function startPolling() {
  if (pollingInterval) clearInterval(pollingInterval);

  pollingInterval = setInterval(() => {
    console.log("🔄 Đang auto check thanh toán...");
    checkPaymentStatus(newBill.value.end_user_id);
  }, 3000);
}

/* ========== DỪNG AUTO POLLING ========== */
function stopPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log("⛔ Dừng auto check");
  }
}

onBeforeUnmount(() => stopPolling());

/* ========== KIỂM TRA THANH TOÁN ========== */
async function checkPaymentStatus(customerId) {
  if (!token.value) await getAccessToken();

  try {
    const res = await $fetch(
      "https://bankapi.bigdatatech.vn/bidv-bigdata/getbill",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "application/json",
        },
        body: { customer_id: customerId },
      }
    );

    console.log("📦 Kết quả getbill:", res);

    if (res.result_code === "012") {
      stopPolling();
      alert("💰 Thanh toán thành công!");
      updateBillStatus(true);
      await createBill();
    }
  } catch (err) {
    console.error("❌ Lỗi khi kiểm tra thanh toán:", err);
  }
}

/* ========== CẬP NHẬT STATUS BILL & DETAIL ========== */
function updateBillStatus(paid) {
  if (paid) {
    newDetailList.value.forEach((d) => (d.status = 7));
    const allPaid = newDetailList.value.every((d) => d.status === 7);
    if (allPaid) newBill.value.status = 7;
  } else {
    newBill.value.status = 1;
    newDetailList.value.forEach((d) => (d.status = 1));
  }
}

/* ========== TẠO BILLGROUP + BILLDETAIL ========== */
async function createBill() {
  if (isCreating.value) return;
  isCreating.value = true;

  try {
    const billGroupRes = await $fetch(
      "https://bankapi.bigdatatech.vn/data/BillGroup/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: {
          ...newBill.value,
          create_time: new Date().toISOString(),
        },
      }
    );

    const groupBillId = billGroupRes?.id;
    if (!groupBillId) throw new Error("Không lấy được ID BillGroup");

    for (const detail of newDetailList.value) {
      const detailBody = {
        ...detail,
        group_bill: groupBillId,
        code: billGroupRes.code,
      };

      await $fetch("https://bankapi.bigdatatech.vn/data/BillDetail/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: detailBody,
      });
    }

    showQrModal.value = false;
    await router.push("/payment-success");
  } catch (err) {
    console.error("Lỗi khi tạo bill:", err);
    alert("Tạo bill thất bại: " + (err?.data?.detail || err?.message));
  } finally {
    isCreating.value = false;
  }
}

/* ========== FAKE THANH TOÁN ========== */
async function handleFakePaid() {
  stopPolling(); // dừng auto check
  alert("💳 Giả lập: Thanh toán thành công!");
  updateBillStatus(true);
  await createBill();
}
</script>

<template>
  <section class="section">
    <div class="container">
      <h1 class="title is-4 mb-2">
        Giày New Balance 530 Natural Indigo (GS) GR530SB1
      </h1>

      <div class="columns is-variable is-8">
        <!-- LEFT -->
        <div class="column is-half">
          <div class="box has-text-centered">
            <img
              :src="activeColor.image"
              :alt="activeColor.name"
              style="max-height: 400px; margin: auto"
            />
          </div>
        </div>

        <!-- RIGHT -->
        <div class="column is-half">
          <div class="box">
            <strong>Màu sắc:</strong>
            <div class="buttons mt-2">
              <button
                v-for="color in colors"
                :key="color.name"
                class="button is-small is-light"
                :class="{ 'is-active': activeColor.name === color.name }"
                @click="selectColor(color)"
              >
                {{ color.name }}
              </button>
            </div>

            <strong>Kích thước:</strong>
            <div class="buttons mt-2">
              <button
                v-for="s in sizes"
                :key="s"
                class="button is-small is-light"
                :class="{ 'is-active': selected === s }"
                @click="selectSize(s)"
              >
                {{ s }}
              </button>
            </div>

            <div class="box has-background-light mt-4">
              <p class="title is-4 has-text-danger">2,090,000₫</p>
              <p class="subtitle is-6 has-text-grey">
                Giá gốc: <s>2,790,000₫</s> (-5%)
              </p>
            </div>

            <div class="columns">
              <div class="column">
                <button
                  class="button is-danger is-medium is-fullwidth"
                  @click="getQRCode"
                  :disabled="isQrLoading"
                >
                  {{ isQrLoading ? "Đang tạo QR..." : "QR" }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- QR MODAL -->
      <div :class="['modal qr-modal', showQrModal ? 'is-active' : '']">
        <div class="modal-background" @click="showQrModal = false"></div>
        <div class="modal-card" style="max-width: 420px">
          <header class="modal-card-head">
            <p class="modal-card-title">Quét mã QR để thanh toán</p>
            <button
              class="delete"
              @click="
                () => {
                  showQrModal = false;
                  stopPolling();
                }
              "
            ></button>
          </header>
          <section class="modal-card-body has-text-centered">
            <div v-if="qrImage">
              <img
                :src="qrImage"
                alt="QR"
                style="max-width: 300px; margin: auto"
              />
              <p class="mt-3">Đang tự kiểm tra thanh toán mỗi 3s...</p>
            </div>
            <div v-else class="has-text-grey">Không có QR. Thử tạo lại.</div>
          </section>
          <footer class="modal-card-foot is-justify-content-space-between">
            <button
              class="button is-success"
              @click="handleFakePaid"
              :disabled="isCreating"
            >
              {{
                isCreating ? "Đang xử lý..." : "Fake thanh toán (đã trả tiền)"
              }}
            </button>
            <button
              class="button"
              @click="
                () => {
                  showQrModal = false;
                  stopPolling();
                }
              "
            >
              Đóng
            </button>
          </footer>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.is-active {
  background-color: #3149ff;
  color: white;
}

.qr-modal.is-active .modal-card {
  animation: fadeInUp 0.3s ease;
}
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
