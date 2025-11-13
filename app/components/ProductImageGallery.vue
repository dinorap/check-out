<script setup>
defineProps({
  activeColor: {
    type: Object,
    required: true,
  },
});
</script>

<template>
  <div class="column is-half">
    <div class="box has-text-centered">
      <img
        :src="activeColor.image"
        :alt="activeColor.name"
        style="max-height: 400px; margin: auto"
      />
    </div>

    <div class="columns is-multiline is-centered mt-3">
      <div class="column small" v-for="n in 5" :key="n">
        <div class="box p-1 has-text-centered">
          <img
            src="https://product.hstatic.net/200000581855/product/giay_new_balance_530_white_natural_indigo__gs__gr530sb14_95fffa78eca84b589ef807fb50cfe14d_compact.jpg"
            alt="thumb"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.columns.is-multiline {
  padding: 0 32px;
  gap: 16px;
}
.column .small {
  padding: 0;
}
</style>
