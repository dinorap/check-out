<script setup>
import { computed } from "vue";

const props = defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  qrImage: {
    type: String,
    default: null,
  },
  isQrLoading: {
    type: Boolean,
    default: false,
  },
  isCreating: {
    type: Boolean,
    default: false,
  },
  isCancelling: {
    type: Boolean,
    default: false,
  },
  countdown: {
    type: Number,
    default: 0,
  },
  newBill: {
    type: Object,
    required: true,
  },
  newDetailList: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["close", "cancel"]);

const totalAmount = computed(() =>
  (props.newDetailList || []).reduce(
    (sum, item) => sum + (item?.amount || 0),
    0
  )
);

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

function formatCurrency(value) {
  return currencyFormatter.format(value || 0);
}

const formattedCountdown = computed(() => {
  const totalSeconds = props.countdown > 0 ? props.countdown : 0;
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
});
</script>

<template>
  <div :class="['modal', 'payment-modal', show && 'is-active']">
    <div class="modal-background no-click"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <div class="header-content">
          <div class="header-icon">
            <svg
              v-if="!qrImage"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 11L12 14L22 4"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
            <svg
              v-else
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect
                x="3"
                y="3"
                width="5"
                height="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <rect
                x="16"
                y="3"
                width="5"
                height="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <rect
                x="3"
                y="16"
                width="5"
                height="5"
                stroke="currentColor"
                stroke-width="2"
              />
              <path d="M11 3H13V11H11V3Z" fill="currentColor" />
              <path d="M11 13H13V21H11V13Z" fill="currentColor" />
              <path d="M3 11H11V13H3V11Z" fill="currentColor" />
              <path d="M13 11H21V13H13V11Z" fill="currentColor" />
              <path d="M16 16H18V18H16V16Z" fill="currentColor" />
            </svg>
          </div>
          <p class="modal-card-title">Quét mã QR để thanh toán</p>
        </div>

        <div class="brand" v-if="countdown > 0">
          <div class="countdown-badge">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="2"
              />
              <path
                d="M12 6V12L16 14"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
              />
            </svg>
            <span
              >Hết hạn sau <strong>{{ formattedCountdown }}</strong></span
            >
          </div>
        </div>
        <button
          class="delete"
          aria-label="close"
          @click="emit('close')"
        ></button>
      </header>

      <section class="modal-card-body">
        <article class="message is-warning notification-box">
          <div class="message-body">
            <div class="notification-icon">⚠️</div>
            <div class="notification-content">
              <strong>Lưu ý quan trọng:</strong>
              <p>
                Quý khách vui lòng không tắt trình duyệt cho đến khi nhận được
                kết quả giao dịch trên website. Trường hợp đã thanh toán nhưng
                chưa nhận kết quả giao dịch, vui lòng bấm
                <a href="#">tại đây</a> để nhận kết quả.
              </p>
            </div>
          </div>
        </article>

        <div class="qr-payment-layout">
          <div class="qr-info-column">
            <div class="info-box qr-info-box">
              <div class="info-header">
                <h3 class="title is-6">
                  <span class="title-icon">📋</span>
                  Thông tin thanh toán
                </h3>
              </div>
              <div class="info-list">
                <div class="info-row highlight">
                  <span class="info-label">Số tiền thanh toán</span>
                  <strong class="info-value amount-highlight">
                    {{ formatCurrency(totalAmount) }}
                  </strong>
                </div>

                <div class="info-row">
                  <span class="info-label">Mã đơn hàng</span>
                  <strong class="info-value code-value">{{
                    newBill.code
                  }}</strong>
                </div>
                <div class="info-row">
                  <span class="info-label">Khách hàng</span>
                  <strong class="info-value">{{
                    newBill.end_user_name
                  }}</strong>
                </div>
                <div class="info-row">
                  <span class="info-label">Mã khách hàng</span>
                  <strong class="info-value">{{ newBill.end_user_id }}</strong>
                </div>

                <div class="info-row address-row">
                  <span class="info-label">Địa chỉ</span>
                  <span class="info-value">{{ newBill.end_user_addr }}</span>
                </div>
              </div>
            </div>

            <div class="info-box products-box">
              <div class="info-header">
                <h3 class="title is-6">
                  <span class="title-icon">🛍️</span>
                  Sản phẩm
                </h3>
              </div>
              <div class="products-list compact">
                <div
                  v-for="(item, index) in newDetailList"
                  :key="index"
                  class="product-item compact"
                >
                  <div class="product-info">
                    <div class="product-name">{{ item.item_name }}</div>
                    <div class="product-remark">{{ item.remark }}</div>
                  </div>
                  <div class="product-amount">
                    {{ formatCurrency(item.amount) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="qr-column">
            <div class="qr-box">
              <div class="qr-header">
                <h3 class="title is-5">
                  <span class="title-icon">📱</span>
                  Quét mã QR
                </h3>
                <p class="qr-subtitle">
                  Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã
                </p>
              </div>
              <div class="qr-container">
                <div v-if="qrImage" class="qr-frame">
                  <figure class="image qr-image">
                    <img :src="qrImage" alt="QR Code" />
                  </figure>
                  <div class="qr-scan-line"></div>
                </div>
                <div v-else class="qr-placeholder">
                  <div class="loader"></div>
                  <span class="placeholder-text">
                    {{ isQrLoading ? "Đang tạo mã QR..." : "Chưa có mã QR" }}
                  </span>
                </div>
              </div>
              <div class="qr-instructions">
                <div class="instruction-item">
                  <span class="instruction-number">1</span>
                  <span>Mở ứng dụng ngân hàng hoặc ví điện tử</span>
                </div>
                <div class="instruction-item">
                  <span class="instruction-number">2</span>
                  <span>Quét mã QR trên màn hình</span>
                </div>
                <div class="instruction-item">
                  <span class="instruction-number">3</span>
                  <span>Xác nhận thanh toán trong ứng dụng</span>
                </div>
              </div>
              <button
                class="button cancel-button"
                @click="emit('cancel')"
                :class="{ 'is-loading': isCancelling }"
                :disabled="isCancelling"
              >
                Hủy thanh toán
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.payment-modal .modal-card {
  width: 100%;
  max-width: 900px;
  max-height: 92vh;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
}

.modal-background {
  pointer-events: none;
  cursor: default;
  background-color: hsl(0deg 0% 100%);
}

.payment-modal .modal-card-body {
  background: white;
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;

  overflow: hidden;
}

.payment-modal .modal-card-head {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 0.75rem 1rem;
  border-bottom: none;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  backdrop-filter: blur(10px);
}

.modal-card-title {
  color: white;
  font-weight: 600;
  font-size: 1.25rem;
  margin: 0;
}

.brand-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  border-radius: 12px;
}

.brand-left {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.payment-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.payment-badge.vnpay {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
}

.payment-badge.bidv {
  background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
  color: white;
}

.badge-icon {
  font-size: 1rem;
}

.countdown-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 20px;
  color: #4a4a4a;
  font-size: 0.875rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.countdown-badge svg {
  color: #ff6b6b;
}

.notification-box {
  margin-bottom: 1.25rem;
  border-radius: 12px;
  border: none;
  background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
}

.notification-box .message-body {
  display: flex;
  gap: 1rem;
  padding: 0.4rem 1rem;
  align-items: center;
}

.notification-icon {
  font-size: 1.5rem;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content strong {
  display: block;
  color: #856404;
}

.notification-content p {
  margin: 0;
  color: #856404;
  font-size: 0.875rem;
  line-height: 1.5;
}

.order-summary {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.summary-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.summary-header .title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #2d3748;
}

.title-icon {
  font-size: 1.5rem;
}

.info-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 12px;
  padding: 1.25rem;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.info-item:last-child {
  border-bottom: none;
}

.info-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #6c757d;
  font-size: 0.875rem;
}

.info-label svg {
  color: #667eea;
}

.info-value {
  color: #2d3748;
  font-weight: 600;
}

.code-value {
  color: #667eea;
  font-size: 1rem;
}

.products-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #f0f0f0;
}

.products-title {
  font-size: 1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 1rem;
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.product-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: all 0.3s ease;
}

.product-item:hover {
  background: #e9ecef;
  transform: translateX(4px);
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.product-remark {
  font-size: 0.875rem;
  color: #6c757d;
}

.product-amount {
  font-weight: 700;
  color: #667eea;
  font-size: 1.1rem;
}

.total-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: white;
}

.total-label {
  font-size: 1.1rem;
  font-weight: 500;
}

.total-amount {
  font-size: 1.5rem;
  font-weight: 700;
}

.pay-button {
  width: 100%;
  margin-top: 1.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  box-shadow: 0 8px 24px rgba(255, 107, 107, 0.4);
  transition: all 0.3s ease;
  cursor: pointer;
}

.pay-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(255, 107, 107, 0.5);
}

.pay-button:active:not(:disabled) {
  transform: translateY(0);
}

.button-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.qr-payment-layout {
  display: grid;
  grid-template-columns: 0.95fr 1fr;
  gap: 1.25rem;
  align-items: stretch;
  flex: 1;
  min-height: 0;
}

.qr-info-column {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.qr-info-box {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.info-header {
  margin-bottom: 1.25rem;
  padding-bottom: 0.85rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
}

.info-header .title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  color: #2d3748;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.65rem 0.75rem;
  background: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-row.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem;
}

.info-row.highlight .info-label,
.info-row.highlight .info-value {
  color: white;
}

.info-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.info-value {
  color: #2d3748;
  font-weight: 600;
}

.amount-highlight {
  font-size: 1.35rem;
  font-weight: 700;
}

.info-value.free {
  color: #10b981;
  font-weight: 600;
}

.info-row.address-row {
  flex-direction: column;
  align-items: flex-start;
  gap: 0.35rem;
}

.info-row.address-row .info-value {
  width: 100%;
  color: #4a5568;
  font-weight: 500;
  line-height: 1.4;
}

.products-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: auto;
}

.products-list.compact {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.product-item.compact {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8f9fa;
  border-radius: 10px;
  transition: background 0.3s ease;
}

.product-item.compact:hover {
  background: #edf2f7;
}

.product-item.compact .product-info {
  flex: 1;
}

.product-item.compact .product-name {
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.25rem;
}

.product-item.compact .product-remark {
  font-size: 0.8rem;
  color: #6c757d;
}

.product-item.compact .product-amount {
  font-weight: 600;
  color: #2d3748;
  white-space: nowrap;
}

.total-row.compact {
  margin-top: auto;
  padding: 0.85rem 1rem;
  border-radius: 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.total-row.compact .total-label {
  font-size: 0.95rem;
  font-weight: 500;
}

.total-row.compact .total-amount {
  font-size: 1.25rem;
  font-weight: 700;
}

.qr-column {
  display: flex;
  flex-direction: column;
}

.qr-box {
  background: white;
  border-radius: 16px;
  padding: 1rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-height: 0;
}

.qr-header {
  text-align: center;
  width: 100%;
}

.qr-header .title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: #2d3748;
}

.qr-subtitle {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.qr-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 0.5rem;
}

.qr-frame {
  position: relative;

  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.qr-image {
  max-width: 240px;
  width: 100%;
  position: relative;
  z-index: 1;
}

.qr-placeholder {
  width: 240px;
  height: 240px;
  border-radius: 20px;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  color: #6b7280;
  text-align: center;
  padding: 1rem;
}

.loader {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 3px solid #d1d5db;
  border-top-color: #667eea;
  animation: spin 0.8s linear infinite;
}

.placeholder-text {
  font-size: 0.875rem;
  line-height: 1.4;
}

.qr-image img {
  width: 100%;
  height: auto;
  border-radius: 12px;
  background: white;
  padding: 0.5rem;
  display: block;
}

.qr-scan-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, transparent, #667eea, transparent);
  animation: scan 2s linear infinite;
  z-index: 2;
}

@keyframes scan {
  0% {
    top: 0;
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.qr-instructions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem;
  background: #f8f9fa;
  border-radius: 8px;
  font-size: 0.875rem;
  color: #4a4a4a;
}

.instruction-number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.75rem;
  flex-shrink: 0;
}

.cancel-button {
  width: 100%;
  padding: 0.85rem 1.25rem;
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 10px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.cancel-button:hover:not(:disabled) {
  background: #e9ecef;
  color: #495057;
  transform: translateY(-1px);
}

.modal-card-foot {
  padding: 1rem 1.5rem;
  background: #f8f9fa;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

.close-button {
  padding: 0.625rem 1.25rem;
  background: white;
  color: #6c757d;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.close-button:hover {
  background: #e9ecef;
  color: #495057;
}

.payment-methods {
  padding: 1.5rem 0 0 0;
  margin-top: 1.5rem;
  border-top: 2px solid #e5e7eb;
}

.payment-methods-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 2rem;
  text-align: center;
}

.payment-method-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.payment-method-item {
  background: white;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.payment-method-item:hover {
  border-color: #667eea;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.method-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.method-info {
  flex: 1;
}

.method-name {
  font-size: 1.1rem;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.method-badge {
  color: #ff6b6b;
  font-weight: 600;
  margin-left: 0.5rem;
}

.method-badge.vnpay-red {
  color: #dc2626;
}

.card-brands {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
}

.card-brand {
  padding: 0.25rem 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
}

.card-brand.visa {
  color: #1a1f71;
  background: #f0f0f0;
}

.card-brand.mastercard {
  color: #eb001b;
  background: #f0f0f0;
}

.card-brand.jcb {
  color: #0066cc;
  background: #f0f0f0;
}

.card-brand.unionpay {
  color: #e21836;
  background: #f0f0f0;
}

.card-brand.amex {
  color: #006fcf;
  background: #f0f0f0;
}

.method-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #667eea;
}

.qr-icon {
  color: #667eea;
}

.qr-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  margin-top: 0.25rem;
}

.bank-icon {
  color: #4ecdc4;
}

.card-icon {
  color: #3b82f6;
}

.vnpay-icon {
  color: #dc2626;
}

.vnpay-logo {
  display: flex;
  align-items: center;
  font-weight: 700;
  font-size: 1.5rem;
}

.vnpay-v {
  color: #dc2626;
  font-size: 2rem;
}

.vnpay-text {
  color: #1e40af;
  font-size: 1.5rem;
}

.vnpay-app-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6c757d;
  margin-top: 0.25rem;
}

@media (max-width: 768px) {
  .qr-payment-layout {
    grid-template-columns: 1fr;
  }

  .payment-modal .modal-card {
    max-width: 100%;
    margin: 1rem;
  }

  .brand-bar {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .method-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .method-icon {
    align-self: flex-end;
  }
}

.brand {
  margin-right: 1.5rem;
}
</style>
