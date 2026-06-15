<script setup lang="ts">
withDefaults(defineProps<{
  inverse?: boolean
  interactive?: boolean
}>(), {
  inverse: false,
  interactive: true,
})
</script>

<template>
  <span
    class="site-logo"
    :class="{
      'site-logo--inverse': inverse,
      'site-logo--static': !interactive,
    }"
  >
    <span class="site-logo__word">aitishka</span><span class="site-logo__accent"><span class="site-logo__mark">›</span><span class="site-logo__pro">pro</span></span>
  </span>
</template>

<style scoped lang="scss">
.site-logo {
  display: inline-flex;
  align-items: center;
  font-family: $font-logo;
  font-size: inherit;
  font-weight: 500;
  letter-spacing: -0.03em;
  line-height: 1;
  white-space: nowrap;
}

.site-logo__word {
  color: $color-default;
}

.site-logo--inverse .site-logo__word {
  color: $color-on-inverse;
}

.site-logo__accent {
  color: $color-primary;
}

.site-logo__pro {
  display: inline-block;
  transition: transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.site-logo--static .site-logo__pro {
  transition: none;
  will-change: auto;
}

@media (hover: hover) {
  .site-logo:not(.site-logo--static):hover .site-logo__pro {
    transform: translateX(0.2em);
  }
}

@media (prefers-reduced-motion: reduce) {
  .site-logo__pro {
    transition: none;
    will-change: auto;
  }
}
</style>
