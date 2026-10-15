<script setup lang="ts">
import { computed } from 'vue'

import { useSettings } from '@/stores/settings'

const settings = useSettings()

const ignoredUsersText = computed({
  get: () => settings.filters.ignoredUsers.join('\n'),
  set: (value: string) => {
    settings.filters.ignoredUsers = value
      .split('\n')
      .map((user) => user.trim().replace(/^@/, '').toLowerCase())
      .filter(Boolean)
  },
})
</script>

<template>
  <section class="panel">
    <header class="panel__header">
      <h2 class="panel__title">Filtros</h2>
    </header>

    <label class="checkbox">
      <input v-model="settings.filters.ignoreCommands" type="checkbox" />
      Ignorar comandos (mensajes que empiezan por <code>!</code>)
    </label>

    <label class="checkbox">
      <input v-model="settings.filters.ignoreUrls" type="checkbox" />
      Ignorar mensajes con URLs
    </label>

    <div class="grid">
      <div class="field">
        <label class="field__label" for="filter-length">Longitud máxima (0 = sin límite)</label>
        <input
          id="filter-length"
          v-model.number="settings.filters.maxLength"
          type="number"
          min="0"
          step="10"
        />
      </div>

      <div class="field">
        <label class="field__label" for="filter-cooldown">Cooldown por usuario (segundos)</label>
        <input
          id="filter-cooldown"
          v-model.number="settings.filters.cooldownSeconds"
          type="number"
          min="0"
          step="1"
        />
      </div>
    </div>

    <div class="field">
      <label class="field__label" for="filter-users">Usuarios ignorados (uno por línea)</label>
      <textarea
        id="filter-users"
        v-model="ignoredUsersText"
        rows="3"
        placeholder="nightbot&#10;streamlabs"
      />
    </div>
  </section>
</template>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.9rem;
  margin-top: 0.6rem;
}

code {
  background: var(--bg-elevated);
  border-radius: 4px;
  padding: 0 4px;
}
</style>
