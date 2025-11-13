<script setup>
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const orderCode = computed(() => route.query.code || "N/A");
</script>

<template>
  <div class="success-page">
    <div class="success-container">
      <div class="success-animation">
        <div class="success-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div class="success-rings">
          <div class="ring ring-1"></div>
          <div class="ring ring-2"></div>
          <div class="ring ring-3"></div>
        </div>
      </div>

      <h1 class="success-title">Thanh toán thành công!</h1>
      <p class="success-message">
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Đơn hàng của bạn đã được xử lý thành công.
      </p>

      <div class="order-info-card">
        <div class="card-header">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span>Thông tin đơn hàng</span>
        </div>
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">Mã đơn hàng</span>
            <strong class="info-value">{{ orderCode }}</strong>
          </div>
          <div class="info-row">
            <span class="info-label">Trạng thái</span>
            <span class="status-badge success">Đã thanh toán</span>
          </div>
          <div class="info-row">
            <span class="info-label">Thời gian</span>
            <span class="info-value">{{ new Date().toLocaleString("vi-VN") }}</span>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <RouterLink to="/" class="button home-button">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M9 22V12H15V22" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Về trang chủ
        </RouterLink>
        <button class="button order-button" @click="router.push('/product')">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Đặt hàng tiếp
        </button>
      </div>

      <div class="support-section">
        <p class="support-text">
          Cần hỗ trợ? <a href="#" class="support-link">Liên hệ chúng tôi</a>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.success-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.success-container {
  max-width: 600px;
  width: 100%;
  background: white;
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  text-align: center;
  position: relative;
  overflow: hidden;
}

.success-container::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.success-animation {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.success-icon {
  position: relative;
  z-index: 2;
  color: #10b981;
  animation: scaleIn 0.5s ease-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

.success-rings {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
}

.ring {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  border: 2px solid #10b981;
  border-radius: 50%;
  opacity: 0;
}

.ring-1 {
  width: 100px;
  height: 100px;
  animation: ringPulse 2s ease-out infinite;
}

.ring-2 {
  width: 120px;
  height: 120px;
  animation: ringPulse 2s ease-out 0.3s infinite;
}

.ring-3 {
  width: 140px;
  height: 140px;
  animation: ringPulse 2s ease-out 0.6s infinite;
}

@keyframes ringPulse {
  0% {
    transform: translate(-50%, -50%) scale(0.8);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.2);
    opacity: 0;
  }
}

.success-title {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.success-message {
  color: #6c757d;
  font-size: 1rem;
  line-height: 1.6;
  margin-bottom: 2rem;
}

.order-info-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 16px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  text-align: left;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  font-weight: 600;
  color: #2d3748;
  font-size: 1.1rem;
}

.card-header svg {
  color: #667eea;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
}

.info-label {
  color: #6c757d;
  font-size: 0.875rem;
}

.info-value {
  color: #2d3748;
  font-weight: 600;
}

.status-badge {
  padding: 0.375rem 0.875rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
}

.status-badge.success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.button {
  flex: 1;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-decoration: none;
  border: none;
  cursor: pointer;
}

.home-button {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.home-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.5);
}

.order-button {
  background: white;
  color: #667eea;
  border: 2px solid #667eea;
}

.order-button:hover {
  background: #667eea;
  color: white;
  transform: translateY(-2px);
}

.support-section {
  padding-top: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.support-text {
  color: #6c757d;
  font-size: 0.875rem;
  margin: 0;
}

.support-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s ease;
}

.support-link:hover {
  color: #764ba2;
}

@media (max-width: 768px) {
  .success-container {
    padding: 2rem 1.5rem;
  }

  .success-title {
    font-size: 1.5rem;
  }

  .action-buttons {
    flex-direction: column;
  }
}
</style>
