<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  qrImage: {
    type: String,
    default: null,
  },
  amount: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(["close"]);
</script>

<template>
  <div :class="['modal qr-modal', show ? 'is-active' : '']">
    <div class="modal-background" @click="emit('close')"></div>
    <div class="modal-card" style="max-width: 420px">
      <header class="modal-card-head">
        <p class="modal-card-title">Quét mã QR để thanh toán</p>
        <button class="delete" aria-label="close" @click="emit('close')"></button>
      </header>
      <section class="modal-card-body has-text-centered">
        <div v-if="qrImage">
          <img :src="qrImage" alt="QR" style="max-width: 300px; margin: auto" />
          <p class="mt-3">Quét bằng app ngân hàng.</p>
        </div>

        <div v-else class="has-text-grey">Không có QR. Thử tạo lại.</div>
      </section>
      <footer class="modal-card-foot is-justify-content-flex-end">
        <button class="button" @click="emit('close')">Đóng</button>
      </footer>
    </div>
  </div>
</template>
