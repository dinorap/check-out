<script setup>
defineProps({
  colors: {
    type: Array,
    required: true,
  },
  activeColor: {
    type: Object,
    required: true,
  },
  sizes: {
    type: Array,
    required: true,
  },
  selected: {
    type: Number,
    required: true,
  },
  isQrLoading: {
    type: Boolean,
    default: false,
  },
  isCreating: {
    type: Boolean,
    default: false,
  },
  hasCreatedBill: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits([
  "select-color",
  "select-size",
  "get-qr",
  "create-bill",
]);
</script>

<template>
  <div class="column is-half">
    <div class="box">
      <h1 class="title is-4 mb-2">
        Giày New Balance 530 Natural Indigo (GS) GR530SB1
      </h1>
      <p class="subtitle is-6 has-text-grey mb-3">
        Mã: GR530SB1-36 ⭐ 4.3 | 31 đánh giá
      </p>

      <div class="mb-4">
        <strong>Màu sắc:</strong>
        <div class="buttons mt-2">
          <button
            v-for="color in colors"
            :key="color.name"
            class="button is-small is-light"
            :class="{ 'is-active': activeColor.name === color.name }"
            @click="emit('select-color', color)"
          >
            {{ color.name }}
          </button>
        </div>
      </div>

      <div class="mb-4">
        <strong>Kích thước:</strong>
        <div class="buttons mt-2">
          <button
            v-for="s in sizes"
            :key="s"
            class="button is-small is-light"
            :class="{ 'is-active': selected === s }"
            @click="emit('select-size', s)"
          >
            {{ s }}
          </button>
        </div>
      </div>

      <div class="box has-background-light mb-4">
        <p class="title is-4 has-text-danger">2,090,000₫</p>
        <p class="subtitle is-6 has-text-grey">
          Giá gốc: <s>2,790,000₫</s> (-5%)
        </p>
      </div>

      <div class="notification is-warning is-light">
        <p><strong>Khuyến mãi & Ưu đãi:</strong></p>
        <ul>
          <li>Giảm ngay 5% áp dụng đến 31/03/2026</li>
          <li>Liên hệ trực tiếp để được tư vấn tốt nhất</li>
        </ul>
      </div>

      <div class="columns">
        <div class="column">
          <button
            class="button is-link is-medium is-fullwidth"
            @click="emit('create-bill')"
            :disabled="isCreating"
          >
            {{ isCreating ? "Đang tạo bill..." : "Tạo bill" }}
          </button>
        </div>
        <div class="column">
          <button
            class="button is-danger is-medium is-fullwidth"
            @click="emit('get-qr')"
            :disabled="isQrLoading || !hasCreatedBill"
          >
            {{ isQrLoading ? "Đang tạo QR..." : "Quét QR" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
