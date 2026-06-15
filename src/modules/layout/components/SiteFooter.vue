<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import { api } from '@/core/api'
import FooterPartnerStrip from '@/modules/layout/components/FooterPartnerStrip.vue'
import SiteLogo from '@/modules/layout/components/SiteLogo.vue'

const phone = ref('')
const email = ref('')
const address = ref('')

onMounted(async () => {
  const site = await api.getSite()
  phone.value = site.contact.phone
  email.value = site.contact.email
  address.value = site.contact.address
})
</script>

<template>
  <footer class="site-footer">
    <div class="site-footer__top container">
      <div class="site-footer__grid">
        <div class="site-footer__col">
          <RouterLink to="/" class="site-footer__logo" aria-label="aitishka pro — на главную">
            <SiteLogo inverse />
          </RouterLink>
          <p class="site-footer__text">
            Образовательная платформа «Айтишка». Статьи и видео для взрослых и детей по программированию и смежным темам.
          </p>
        </div>

        <div class="site-footer__col">
          <h3 class="site-footer__heading">
            Навигация
          </h3>
          <div class="site-footer__links-grid">
            <RouterLink to="/news" class="site-footer__link">
              Новости
            </RouterLink>
            <RouterLink to="/articles" class="site-footer__link">
              Статьи
            </RouterLink>
            <RouterLink to="/media" class="site-footer__link">
              Видео
            </RouterLink>
          </div>
        </div>

        <div class="site-footer__col">
          <h3 class="site-footer__heading">
            Информация
          </h3>
          <ul class="site-footer__info">
            <li>
              Телефон:
              <a :href="`tel:${phone.replace(/\D/g, '')}`" class="site-footer__link">{{ phone }}</a>
            </li>
            <li>
              Email:
              <a :href="`mailto:${email}`" class="site-footer__link">{{ email }}</a>
            </li>
            <li>Адрес: {{ address }}</li>
          </ul>
        </div>

        <div class="site-footer__col">
          <h3 class="site-footer__heading">
            Документы
          </h3>
          <ul class="site-footer__info">
            <li>
              <RouterLink to="/privacy" class="site-footer__link">
                Политика конфиденциальности
              </RouterLink>
            </li>
            <li>
              <RouterLink to="/terms" class="site-footer__link">
                Пользовательское соглашение
              </RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <FooterPartnerStrip />

    <div class="site-footer__divider" />

    <div class="site-footer__bottom container">
      <p class="site-footer__copyright">
        <SiteLogo inverse :interactive="false" />
        <span>© 2023 – 2026</span>
      </p>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.site-footer {
  background: $color-surface-inverse;
  color: $color-on-inverse;
}

.site-footer__top {
  padding-block: 1.5rem 2rem;

  @include lg {
    padding-block: 2rem 2.5rem;
  }
}

.site-footer__grid {
  display: grid;
  gap: 1.5rem;

  @include sm {
    grid-template-columns: repeat(2, 1fr);
  }

  @include lg {
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
  }
}

.site-footer__col {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: center;
  text-align: center;

  @include lg {
    align-items: flex-start;
    text-align: left;
  }
}

.site-footer__logo {
  font-size: $text-xl;
  text-decoration: none;

  @include lg {
    font-size: $text-2xl;
  }
}

.site-footer__text {
  font-size: 0.875rem;
  color: $color-inverse-muted;
  line-height: 1.6;
  max-width: 18rem;
}

.site-footer__heading {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: $color-inverse-subtle;
}

.site-footer__links-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;

  @include lg {
    align-items: flex-start;
  }
}

.site-footer__link {
  color: $color-primary;
  text-decoration: underline;
  transition: color 0.2s;

  &:hover {
    color: $color-primary-hover;
  }
}

.site-footer__info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: $color-inverse-muted;
}

.site-footer__divider {
  border-top: 1px solid $color-inverse-divider;
}

.site-footer__bottom {
  padding-block: 0.75rem 1rem;
  text-align: center;
  font-size: 0.75rem;
  color: $color-inverse-subtle;

  @include sm {
    font-size: 0.875rem;
  }
}

.site-footer__copyright {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin: 0;
  line-height: 1;
}
</style>
