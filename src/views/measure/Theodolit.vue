<template>
    <PointNumberSelect v-model="point" />
</template>

<script setup lang="ts">

import { ref } from 'vue';
import { Point } from "@/types/Point";
import PointNumberSelect from '@/components/PointNumberSelect.vue';

const point = ref<Point>();
</script>