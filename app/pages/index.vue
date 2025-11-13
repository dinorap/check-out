<script setup>
import { ref, computed } from "vue";
import { usePayment } from "~/composables/usePayment";

/* ========== PRODUCT STATE ========== */
const baseSize = ref(31);
const sizes = computed(() =>
  Array.from({ length: 5 }, (_, i) => baseSize.value + i)
);
const selected = ref(baseSize.value);
function selectSize(value) {
  selected.value = value;
}

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
const activeColor = ref(colors[0]);
function selectColor(color) {
  activeColor.value = color;
}

/* ========== PAYMENT LOGIC ========== */
const {
  newBill,
  newDetailList,
  qrImage,
  isQrLoading,
  showPaymentModal,
  isCreating,
  isCancelling,
  countdown,
  openPaymentModal,
  closePaymentModal,
  cancelPayment,
  payWithQr,
} = usePayment();

function handleOpenPayment() {
  openPaymentModal();
}

function handlePayWithQr() {
  payWithQr();
}

function handleSelectPaymentMethod(method) {
  if (method === "qr") {
    payWithQr();
  } else {
    // Handle other payment methods
    console.log("Selected payment method:", method);
    alert(`Phương thức thanh toán "${method}" đang được phát triển.`);
  }
}

function handleClosePayment() {
  closePaymentModal();
}

function handleCancelPayment() {
  cancelPayment();
}
</script>

<template>
  <section class="section">
    <div class="container">
      <div class="title">
        <h1 class="title is-4 mb-2">
          Giày New Balance 530 Natural Indigo (GS) GR530SB1
        </h1>
      </div>

      <div class="columns is-variable is-8">
        <!-- Left side - Product Image Gallery -->
        <ProductImageGallery :active-color="activeColor" />

        <!-- Right side - Product Info -->
        <ProductInfo
          :colors="colors"
          :active-color="activeColor"
          :sizes="sizes"
          :selected="selected"
          :is-qr-loading="isQrLoading"
          :is-creating="isCreating"
          @select-color="selectColor"
          @select-size="selectSize"
          @open-payment="handleOpenPayment"
        />
      </div>

      <!-- Description -->
      <ProductDescription />
    </div>

    <PaymentModal
      :show="showPaymentModal"
      :qr-image="qrImage"
      :is-qr-loading="isQrLoading"
      :is-creating="isCreating"
      :is-cancelling="isCancelling"
      :countdown="countdown"
      :new-bill="newBill"
      :new-detail-list="newDetailList"
      @close="handleClosePayment"
      @cancel="handleCancelPayment"
      @pay-with-qr="handlePayWithQr"
      @select-payment-method="handleSelectPaymentMethod"
    />
  </section>
</template>

<style scoped>
.columns .is-multiline {
  padding: 0 34px;
  gap: 18px;
}
.is-active {
  background-color: #3149ff;
  color: white;
}
.column .small {
  padding: 0;
}
.box {
  border-radius: 12px;
}
.qr-modal .modal-background {
  background-color: rgb(255, 255, 255) !important;
  backdrop-filter: blur(5px);
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
